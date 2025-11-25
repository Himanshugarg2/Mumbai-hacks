import requests

AMFI_URL = "https://www.amfiindia.com/spages/NAVAll.txt"


#  Risk classifier
def classify_risk(category: str):
    if not category:
        return "unknown"

    cat = category.lower()

    if any(
        x in cat for x in ["small cap", "mid cap", "sectoral", "thematic", "equity"]
    ):
        return "high"

    if any(x in cat for x in ["liquid", "overnight", "ultra short", "gilt", "floater"]):
        return "low"

    return "medium"


#  fallback category extraction from scheme name (for missing categories)
def infer_category_from_name(name: str):
    name = name.lower()

    if any(x in name for x in ["liquid", "overnight"]):
        return "Liquid Fund"

    if any(x in name for x in ["small cap"]):
        return "Equity - Small Cap"

    if any(x in name for x in ["mid cap"]):
        return "Equity - Mid Cap"

    if "psu" in name or "banking" in name:
        return "Debt - Banking & PSU"

    if "gilt" in name:
        return "Debt - Gilt"

    if "corporate" in name:
        return "Debt - Corporate Bond"

    return "Other"


#  Fetch + parse AMFI data correctly
def fetch_amfi_data():
    response = requests.get(AMFI_URL)

    if response.status_code != 200:
        raise Exception("Failed to fetch AMFI data")

    lines = response.text.splitlines()

    funds = []
    current_amc = None
    current_category = None

    for line in lines:
        parts = line.split(";")

        #  AMC (fund house)
        if len(parts) == 1 and parts[0].strip() != "":
            current_amc = parts[0].strip()
            current_category = None
            continue

        #  Category line format: ;Open Ended - Debt - Banking and PSU;;;;;
        if len(parts) > 1 and parts[0].strip() == "" and parts[1].strip() != "":
            current_category = parts[1].strip()
            continue

        # Actual scheme row
        if len(parts) >= 6 and parts[0].isdigit():
            scheme_name = parts[3]
            category = current_category or infer_category_from_name(scheme_name)

            funds.append(
                {
                    "scheme_code": parts[0],
                    "scheme_name": scheme_name,
                    "nav": parts[4],
                    "date": parts[5],
                    "amc": current_amc,
                    "category": category,
                    "risk": classify_risk(category),
                }
            )

    return funds


#  Filtering + pagination
def get_filtered_funds(page=1, limit=50, risk=None, category=None, search=None):
    data = fetch_amfi_data()

    if risk:
        data = [f for f in data if f["risk"].lower() == risk.lower()]

    if category:
        data = [
            f
            for f in data
            if f["category"] and category.lower() in f["category"].lower()
        ]

    if search:
        data = [f for f in data if search.lower() in f["scheme_name"].lower()]

    total = len(data)
    start = (page - 1) * limit
    end = start + limit

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "results": data[start:end],
    }
