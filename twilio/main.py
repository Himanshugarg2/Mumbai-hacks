from fastapi import FastAPI, Form, Response
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

# Twilio Setup
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_WHATSAPP_FROM")
client = Client(TWILIO_SID, TWILIO_AUTH)

# Backend
BACKEND = "http://localhost:8000"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Memory
user_state = {}
phone_to_uid = {}


# -----------------------------------------------------
# HELPER: Currency Formatter
# -----------------------------------------------------
def to_currency(amount):
    try:
        return f"₹{int(amount):,}"
    except:
        return str(amount)


# -----------------------------------------------------
# FORMATTERS: Turn Data into Beautiful Text
# -----------------------------------------------------


def format_dreams_msg(data):
    if not data:
        return "You haven't added any dreams yet! 🌙"

    msg = "🌙 *Your Dreams Board*\n"
    # Assuming data is a list of objects like {title, goal_amount, saved_amount, deadline}
    for item in data:
        title = item.get("title", "Unknown")
        goal = to_currency(item.get("goal_amount", 0))
        saved = to_currency(item.get("saved_amount", 0))
        deadline = item.get("deadline", "No Date")

        msg += f"\n📌 *{title}*"
        msg += f"\n   💰 Saved: {saved} / {goal}"
        msg += f"\n   📅 Target: {deadline}"
        msg += "\n   ------------------"
    return msg


def format_plan_msg(data):
    # Assuming structure: { "aiPlan": { "DreamName": { "monthly_plan": "...", "motivation": "..." } } }
    if not data:
        return "🧠 No AI Plan generated yet."

    plans = data.get("aiPlan", {})
    if not plans:
        return "🧠 No active plans found."

    msg = "🧠 *AI Action Plan*\n"

    # Handle if plans is just a string or JSON object
    if isinstance(plans, str):
        return f"🧠 *AI Plan*\n\n{plans}"

    for dream_name, details in plans.items():
        monthly = details.get("monthly_plan", "N/A")
        daily = details.get("daily_plan", "N/A")
        motivation = details.get("motivation", "Keep going!")

        msg += f"\n🚀 *{dream_name}*"
        msg += f"\n📅 *Monthly:* {monthly}"
        msg += f"\n✨ *Tip:* {motivation}\n"
        msg += "------------------"
    return msg


def format_cashflow_msg(data):
    # Assuming { "status": "Surplus", "predicted_balance": 5000, "burn_rate": 200 }
    status = data.get("status", "Neutral")
    balance = to_currency(data.get("predicted_balance", 0))
    burn = data.get("burn_rate", "0")

    icon = "✅" if "Surplus" in status or "Positive" in status else "⚠"

    return (
        f"💰 *Cashflow Prediction*\n\n"
        f"Status: {status} {icon}\n"
        f"End of Month: *{balance}*\n"
        f"Burn Rate: {burn}/day\n"
    )


def format_portfolio_msg(data):
    # Assuming { "risk": "Moderate", "allocation": {"Stocks": "50%", "Gold": "20%"} }
    risk = data.get("risk", "Unknown")
    alloc = data.get("allocation", {})

    msg = f"📊 *Portfolio Recommendation*\n"
    msg += f"Risk Profile: *{risk}*\n\n"
    msg += "*Allocation:*\n"

    for asset, percent in alloc.items():
        msg += f"• {asset}: {percent}\n"

    return msg


def format_generic_msg(data):
    """Fallback if we don't have a specific formatter"""
    if isinstance(data, str):
        return data
    if isinstance(data, list):
        return "\n".join([f"• {str(item)}" for item in data])

    # Clean dictionary print
    msg = ""
    for k, v in data.items():
        clean_key = k.replace("_", " ").title()
        msg += f"• *{clean_key}:* {v}\n"
    return msg


# -----------------------------------------------------
# SPLIT & SEND
# -----------------------------------------------------
def send_whatsapp(to, text):
    # Limit message size for WhatsApp
    chunks = [text[i : i + 1500] for i in range(0, len(text), 1500)]
    for c in chunks:
        client.messages.create(from_=TWILIO_FROM, to=to, body=c)


# -----------------------------------------------------
# WEBHOOK
# -----------------------------------------------------
@app.post("/webhook")
def webhook(WaId: str = Form(...), Body: str = Form(...)):

    phone = WaId.strip()
    msg = Body.strip()
    msg_lower = msg.lower()
    full_phone = f"whatsapp:+{phone}"

    # --- LOGIN LOGIC (Keep as is) ---
    if phone not in phone_to_uid and user_state.get(phone) != "waiting_uid":
        user_state[phone] = "waiting_uid"
        send_whatsapp(
            full_phone, "Hi! 👋 Please enter your *User ID (UID)* to continue:"
        )
        return Response("<Response></Response>", media_type="application/xml")

    if user_state.get(phone) == "waiting_uid":
        uid = msg.strip()
        phone_to_uid[phone] = uid
        user_state[phone] = None
        send_whatsapp(
            full_phone,
            f"🎉 *Logged in!*\nUID: {uid}\n\nType 'dreams', 'plan', 'cashflow' to start.",
        )
        return Response("<Response></Response>", media_type="application/xml")

    uid = phone_to_uid.get(phone)
    if not uid:
        send_whatsapp(full_phone, "⚠ Session expired. Enter UID again.")
        user_state[phone] = "waiting_uid"
        return Response("<Response></Response>", media_type="application/xml")

    # --------------------------------------------------------
    # COMMAND HANDLERS (UPDATED)
    # --------------------------------------------------------

    try:
        # DREAMS
        if "dream" in msg_lower and "plan" not in msg_lower:
            r = requests.get(f"{BACKEND}/dreams/{uid}")
            text = format_dreams_msg(r.json())
            send_whatsapp(full_phone, text)

        # PLAN
        elif "plan" in msg_lower:
            r = requests.get(f"{BACKEND}/dreams/plan/{uid}")
            text = format_plan_msg(r.json())
            send_whatsapp(full_phone, text)

        # CASHFLOW
        elif "cash" in msg_lower:
            r = requests.get(f"{BACKEND}/cashflow/predict/{uid}")
            text = format_cashflow_msg(r.json())
            send_whatsapp(full_phone, text)

        # ADVICE
        elif "advice" in msg_lower:
            r = requests.post(f"{BACKEND}/generate-advice", json={"userId": uid})
            data = r.json()
            # If advice returns a simple string or dict
            advice_text = data.get("advice", "No advice available.")
            send_whatsapp(full_phone, f"💡 *Financial Advice*\n\n{advice_text}")

        # GUARDIAN
        elif "guardian" in msg_lower:
            r = requests.get(f"{BACKEND}/ai/smart-guardian/{uid}")
            # Use generic formatter or create a specific one
            text = f"🛡 *Smart Guardian*\n\n" + format_generic_msg(r.json())
            send_whatsapp(full_phone, text)

        # OPPORTUNITY
        elif "opportunity" in msg_lower:
            r = requests.get(f"{BACKEND}/ai/opportunity/{uid}")
            # Assuming list of opportunities
            data = r.json()
            msg = "📍 *Opportunities Nearby*\n"
            for opp in data:
                # Adjust keys based on your actual API
                role = opp.get("role", "Job")
                pay = opp.get("pay", "N/A")
                msg += f"\n• *{role}* ({pay})"
            send_whatsapp(full_phone, msg)

        # PORTFOLIO
        elif "portfolio" in msg_lower:
            r = requests.get(f"{BACKEND}/ai/portfolio/{uid}")
            text = format_portfolio_msg(r.json())
            send_whatsapp(full_phone, text)

        # FALLBACK
        else:
            send_whatsapp(
                full_phone,
                "🤖 *Menu*\n\n"
                "• *Dreams*: View your goals\n"
                "• *Plan*: AI roadmap\n"
                "• *Cashflow*: Predictions\n"
                "• *Advice*: Financial tips\n"
                "• *Portfolio*: Asset allocation",
            )

    except Exception as e:
        print(f"Error: {e}")
        send_whatsapp(full_phone, "⚠ Oops! Something went wrong fetching data.")

    return Response("<Response></Response>", media_type="application/xml")
