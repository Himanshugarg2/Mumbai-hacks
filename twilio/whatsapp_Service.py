import os
import requests
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
from dotenv import load_dotenv

load_dotenv()

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_WHATSAPP_FROM")

client = Client(TWILIO_SID, TWILIO_AUTH)

FASTAPI_BASE = "http://localhost:8000"

# In-memory session
user_state = {}
user_email = {}


# ---------------------------------------------------------
# SMART RECURSIVE FORMATTER (Handles nested dict + lists)
# ---------------------------------------------------------
def format_value(value, indent=0):
    space = " " * indent
    msg = ""

    # dict inside dict
    if isinstance(value, dict):
        for k, v in value.items():
            msg += f"{space}*{k.capitalize()}*:\n"
            msg += format_value(v, indent + 4)
        return msg

    # list inside dict
    if isinstance(value, list):
        for i, item in enumerate(value, 1):
            msg += f"{space}{i}. {item}\n"
        return msg

    # plain value
    return f"{space}{value}\n"


def format_nested(data, title=""):
    msg = f"*{title}*\n\n" if title else ""
    msg += format_value(data)
    return msg.strip()


# ---------------------------------------------------------
def send_whatsapp_message(to: str, body: str):
    return client.messages.create(from_=TWILIO_FROM, to=to, body=body)


def handle_incoming_message(from_num: str, message_body: str) -> str:
    phone = from_num.replace("whatsapp:", "")
    msg = message_body.strip()
    msg_lower = msg.lower()

    resp = MessagingResponse()

    # STEP 1 — Ask for Email
    if phone not in user_email:
        user_state[phone] = "waiting_email"
        resp.message("Hi! Please share your email to continue ✨")
        return str(resp)

    # STEP 2 — Save Email
    if user_state.get(phone) == "waiting_email":
        user_email[phone] = msg
        user_state[phone] = None

        resp.message(f"🎉 *Email saved!* ({msg})")
        resp.message("You can now ask:\n- *dreams*\n- *cashflow*\n- *advice*")
        return str(resp)

    # STEP 3 — Commands

    # Dreams
    if "dream" in msg_lower:
        r = requests.get(f"{FASTAPI_BASE}/dreams/{phone}")
        data = r.json()
        formatted = format_nested(data, "🌙 Your Dreams")
        resp.message(formatted)
        return str(resp)

    # Cashflow (main fix)
    if "cash" in msg_lower:
        r = requests.get(f"{FASTAPI_BASE}/cashflow/predict/{phone}")
        data = r.json()
        formatted = format_nested(data, "💰 Cashflow Prediction")
        resp.message(formatted)
        return str(resp)

    # Advice
    if "advice" in msg_lower:
        payload = {"userId": phone}
        r = requests.post(f"{FASTAPI_BASE}/generate-advice", json=payload)
        advice = r.json().get("advice", "")
        resp.message(f"*💡 Advice*\n\n{advice}")
        return str(resp)

    # Default fallback
    resp.message("Sorry 😅 I didn’t understand.\nTry: *dreams*, *cashflow*, *advice*")
    return str(resp)
