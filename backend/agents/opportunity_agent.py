# agents/opportunity_agent.py
import os
import math
import time
import json
import requests
import concurrent.futures
from functools import lru_cache
from datetime import datetime


# Import your existing services
from services.firestore_service import get_user_transactions
from services.gemini_service import call_gemini

TOMTOM_KEY = os.getenv("TOMTOM_API_KEY")
WEATHER_KEY = os.getenv("WEATHER_API_KEY")

DEFAULT_HOURLY = 120.0  # fallback earning estimate

# Initialize a global session to reuse TCP connections (Performance Boost)
session = requests.Session()


# ----------------------------
# Utility: Haversine Distance
# ----------------------------
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (
        math.sin(dLat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dLon / 2) ** 2
    )
    return R * 2 * math.asin(math.sqrt(a))


# ----------------------------
# OpenWeather
# ----------------------------
def get_weather(lat, lon):
    if not WEATHER_KEY:
        return {"condition": "Unknown", "temp": None}
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_KEY}&units=metric"
        # Reduced timeout, using shared session
        r = session.get(url, timeout=3)
        r.raise_for_status()
        j = r.json()
        cond = j.get("weather", [{}])[0].get("main", "Unknown")
        temp = j.get("main", {}).get("temp")
        return {"condition": cond, "temp": temp}
    except Exception:
        return {"condition": "Unknown", "temp": None}


# ----------------------------
# TomTom Traffic (Flow Segment)
# ----------------------------
def get_tomtom_traffic(lat, lon):
    if not TOMTOM_KEY:
        return "Unknown"
    try:
        url = (
            "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
            f"?point={lat},{lon}&unit=KMPH&key={TOMTOM_KEY}"
        )
        r = session.get(url, timeout=3)
        r.raise_for_status()
        j = r.json()
        flow = j.get("flowSegmentData", {})
        curr = flow.get("currentSpeed")
        free = flow.get("freeFlowSpeed")

        if not curr or not free:
            return "Unknown"

        ratio = curr / free
        if ratio < 0.4:
            return "Heavy"
        elif ratio < 0.7:
            return "Moderate"
        else:
            return "Light"
    except Exception:
        return "Unknown"


# ----------------------------
# TomTom POI count
# ----------------------------
def tomtom_poi_count(lat, lon, radius_m=1000, limit=100):
    if not TOMTOM_KEY:
        return 0
    try:
        url = (
            "https://api.tomtom.com/search/2/categorySearch/restaurant.json"
            f"?lat={lat}&lon={lon}&radius={radius_m}&limit={limit}&key={TOMTOM_KEY}"
        )
        r = session.get(url, timeout=3)
        r.raise_for_status()
        j = r.json()
        return len(j.get("results") or [])
    except Exception:
        return 0


# ----------------------------
# TomTom Reverse Geocode (Specific Area Fix)
# ----------------------------
@lru_cache(maxsize=128)
def tomtom_reverse_geocode(lat, lon):
    """
    Returns specific area name (e.g., 'Powai', 'Indiranagar') instead of just 'Mumbai'.
    Cached to prevent duplicate API calls for the same coordinates.
    """
    if not TOMTOM_KEY:
        return None
    try:
        # Round coords slightly to increase cache hit rate
        r_lat, r_lon = round(lat, 4), round(lon, 4)
        url = f"https://api.tomtom.com/search/2/reverseGeocode/{r_lat},{r_lon}.json?key={TOMTOM_KEY}"
        r = session.get(url, timeout=3)
        r.raise_for_status()
        j = r.json()

        addrs = j.get("addresses", [])
        if addrs:
            data = addrs[0].get("address", {})

            # PRIORITY 1: Specific Neighborhood / Sub-district (e.g., "Powai", "Andheri West")
            area = data.get("municipalitySubdivision") or data.get("neighbourhood")

            # PRIORITY 2: Street Name (e.g., "Linking Road") if neighborhood is missing
            if not area:
                area = data.get("streetName")

            # PRIORITY 3: Fallback to City (e.g., "Mumbai")
            if not area:
                area = data.get("municipality") or data.get("freeformAddress")

            return area

        return "Nearby Area"
    except Exception:
        return "Unknown Area"


# ----------------------------
# Weak signal: compute user hourly
# ----------------------------
def compute_user_hourly(transactions):
    if not transactions:
        return None
    total_i = 0.0
    total_h = 0.0
    for t in transactions:
        try:
            i = float(t.get("income") or 0)
            h = float(t.get("hoursWorked") or 0)
            if h > 0:
                total_i += i
                total_h += h
        except Exception:
            continue
    if total_h == 0:
        return None
    return total_i / total_h


# ----------------------------
# JSON Parser Helper
# ----------------------------
def parse_json_text(txt):
    if not txt:
        return None
    s = txt.strip()
    if s.startswith("```"):
        s = s.strip("` \n")
        if s.startswith("json"):
            s = s[4:].strip()
    try:
        start = s.find("{")
        end = s.rfind("}")
        if start != -1 and end != -1:
            return json.loads(s[start : end + 1])
    except Exception:
        pass
    return None


# ----------------------------
# Helper: Analyze a single point (Run in Thread)
# ----------------------------
def analyze_single_point(lat, lon, origin_lat, origin_lon, poi_radius=1000):
    """
    Fetches POI, Traffic, and Area Name for a single point concurrently.
    """
    # Create a mini thread pool for this specific point's data
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        f_poi = executor.submit(tomtom_poi_count, lat, lon, poi_radius)
        f_traffic = executor.submit(get_tomtom_traffic, lat, lon)
        f_area = executor.submit(tomtom_reverse_geocode, lat, lon)

        poi_count = f_poi.result()
        traffic = f_traffic.result()
        area_name = f_area.result()

    distance_km = round(haversine_km(origin_lat, origin_lon, lat, lon), 2)

    return {
        "lat": lat,
        "lon": lon,
        "poi_count": poi_count,
        "traffic": traffic,
        "area": area_name,
        "distance_km": distance_km,
    }


# ----------------------------
# Hotspot detection (Parallelized)
# ----------------------------
def detect_hotspots_around(lat, lon):
    """
    Samples nearby points in parallel to find the best specific area.
    """
    # Offsets: Center, N, S, E, W (~500m shifts)
    sample_offsets = [
        (0.0, 0.0),
        (0.005, 0.0),
        (-0.005, 0.0),
        (0.0, 0.005),
        (0.0, -0.005),
    ]

    points = []

    # Run all 5 geographical samples concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        for dlat, dlon in sample_offsets:
            p_lat = lat + dlat
            p_lon = lon + dlon
            futures.append(
                executor.submit(analyze_single_point, p_lat, p_lon, lat, lon)
            )

        for f in concurrent.futures.as_completed(futures):
            points.append(f.result())

    # Scoring logic
    max_poi = max((p["poi_count"] for p in points), default=1)
    hotspots = []

    for p in points:
        poi_norm = p["poi_count"] / max(1, max_poi)

        # Traffic scoring
        traffic_map = {"Light": 1.0, "Moderate": 0.7, "Heavy": 0.4}
        traffic_score = traffic_map.get(p["traffic"], 0.8)

        # Distance weighting (closer is better)
        distance_factor = 1.0 / (1.0 + p["distance_km"])

        score = 0.6 * poi_norm + 0.25 * traffic_score + 0.15 * distance_factor
        hotspots.append({**p, "score": round(score, 3)})

    # Sort by score desc
    hotspots.sort(key=lambda x: x["score"], reverse=True)
    return hotspots


# ----------------------------
# Main OpportunityScoutService
# ----------------------------
class OpportunityScoutService:
    def __init__(self, user_id: str):
        self.user_id = user_id

    def predict(self, lat: float = None, lon: float = None):
        # Default fallback (Mumbai center)
        if lat is None or lon is None:
            lat, lon = 19.0760, 72.8777

        now = datetime.now()
        hour = now.hour
        is_weekend = now.weekday() >= 5

        # 1) PARALLEL DATA GATHERING
        # We fetch Weather, Hotspots, Traffic, and User History all at once.
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            future_weather = executor.submit(get_weather, lat, lon)
            future_hotspots = executor.submit(detect_hotspots_around, lat, lon)
            future_user_traffic = executor.submit(get_tomtom_traffic, lat, lon)
            future_transactions = executor.submit(get_user_transactions, self.user_id)

            # Wait for results
            weather = future_weather.result()
            hotspots = future_hotspots.result()
            traffic_at_user = future_user_traffic.result()
            try:
                transactions = future_transactions.result()
            except Exception:
                transactions = []

        # 2) Logic Processing
        user_hourly = compute_user_hourly(transactions)
        final_hourly = (
            DEFAULT_HOURLY
            if user_hourly is None
            else (0.7 * DEFAULT_HOURLY + 0.3 * user_hourly)
        )
        top_hotspot = hotspots[0] if hotspots else None

        surge_score = 0.0
        reasons = []

        # Weather boost
        if weather.get("condition", "").lower() in ("rain", "drizzle", "thunderstorm"):
            surge_score += 0.30
            reasons.append("Rain increases orders")

        # Weekend boost
        if is_weekend:
            surge_score += 0.18
            reasons.append("Weekend demand")

        # Hotspot boost
        if top_hotspot:
            surge_score += top_hotspot["score"] * 0.35
            # Use specific area name in reason
            reasons.append(f"High demand near {top_hotspot.get('area')}")

        # Traffic boost/penalty
        if traffic_at_user == "Light":
            surge_score += 0.12
            reasons.append("Light traffic speeds up delivery")
        elif traffic_at_user == "Heavy":
            surge_score -= 0.12
            reasons.append("Heavy traffic reduces earnings")

        # Cap score
        surge_score = max(-0.3, min(surge_score, 1.0))
        multiplier = 1.0 + surge_score
        expected_boost = int(max(0, (final_hourly * (multiplier - 1.0)) * 3))

        # Time Window Logic
        if 17 <= hour <= 22:
            suggested_window = f"{hour}–{min(hour+3,22)} PM"
        else:
            suggested_window = "6–9 PM"

        # 3) Build Context for Gemini
        context = {
            "lat": lat,
            "lon": lon,
            "now": now.isoformat(),
            "weather": weather,
            "traffic_at_user": traffic_at_user,
            "top_hotspot": top_hotspot,
            "hotspots": hotspots[:4],  # Top 4 samples
            "default_hourly": DEFAULT_HOURLY,
            "user_hourly": round(user_hourly, 2) if user_hourly else None,
            "final_hourly": round(final_hourly, 2),
            "expected_boost": expected_boost,
            "surge_score": round(surge_score, 3),
            "reasons": reasons,
            "suggested_window": suggested_window,
        }

        prompt = f"""
You are OpportunityScout, a helpful and practical AI for gig workers in India.
Do NOT invent math. Use provided context.

Context: {json.dumps(context, default=str)}

TASK: Return ONLY valid JSON with keys:
{{ 
  "bestTime": "...", 
  "bestArea": "...", 
  "expectedBoost": number, 
  "advice": "...", 
  "action": "...", 
  "why": "...", 
  "confidence": "Low|Medium|High" 
}}

IMPORTANT: 
- "bestArea" must be the specific name from "top_hotspot.area" (e.g. "Powai", "Koramangala"), NOT just the city name.
- Keep advice short.
"""
        # 4) Call Gemini
        ai_text = call_gemini(prompt)
        ai_parsed = parse_json_text(ai_text) or {}

        # Fallbacks
        best_area = top_hotspot.get("area") if top_hotspot else "Nearby Area"

        ai_advice = (
            ai_parsed.get("advice") or f"Work {suggested_window} near {best_area}."
        )
        ai_action = ai_parsed.get("action") or f"Plan a focused 3-hour shift."
        ai_why = ai_parsed.get("why") or ", ".join(reasons)
        ai_conf = ai_parsed.get("confidence") or "Medium"

        # 5) Final Result
        return {
            "bestTime": context["suggested_window"],
            "bestArea": best_area,
            "expectedBoost": expected_boost,
            "weather": weather,
            "traffic": traffic_at_user,
            "hotspot_sample": top_hotspot,
            "hotspots": hotspots[:4],
            "finalHourlyUsed": round(final_hourly, 2),
            "surgeScore": round(surge_score, 3),
            "reasons": reasons,
            "aiAdvice": ai_advice,
            "action": ai_action,
            "why": ai_why,
            "confidence": ai_conf,
            "raw_ai_text": ai_text,
        }
