import os
import json
import requests
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
from dotenv import load_dotenv
from fastapi import FastAPI, Form, Request, Response
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Twilio credentials
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_WHATSAPP_FROM")

client = Client(TWILIO_SID, TWILIO_AUTH)

# Main backend
BACKEND = "http://localhost:8000"

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# Memory
user_state = {}  # phone → waiting_email
user_email = {}  # phone → email
phone_to_uid = {}  # phone → firebase uid


# ---------------------------------------------------------
# FORMAT NESTED JSON → WhatsApp friendly text
# ---------------------------------------------------------
def format_value(val, indent=0):
    space = " " * indent
    msg = ""

    if isinstance(val, dict):
        for k, v in val.items():
            msg += f"{space}*{k.capitalize()}*:\n"
            msg += format_value(v, indent + 4)
        return msg

    if isinstance(val, list):
        for i, item in enumerate(val, 1):
            msg += f"{space}{i}. {item}\n"
        return msg

    return f"{space}{val}\n"


def format_nested(data, title=None):
    out = f"*{title}*\n\n" if title else ""
    out += format_value(data)
    return out.strip()


# ---------------------------------------------------------
def send_whatsapp(to, text):
    client.messages.create(from_=TWILIO_FROM, to=to, body=text)


# ---------------------------------------------------------
# Resolve UID by email
# ---------------------------------------------------------
def resolve_uid(email):
    try:
        r = requests.post(f"{BACKEND}/resolve-user", json={"email": email})
        data = r.json()
        return data.get("uid")
    except:
        return None


# =========================================================
# WHATSAPP WEBHOOK (MAIN ENDPOINT)
# =========================================================
@app.post("/webhook")
async def whatsapp_webhook(From: str = Form(...), Body: str = Form(...)):
    phone = From.replace("whatsapp:", "")
    msg = Body.strip()
    msg_lower = msg.lower()

    # ---------------------- Step 1: Ask for email ----------------------
    if phone not in user_email:
        user_state[phone] = "waiting_email"
        send_whatsapp(From, "Hi! Please share your email to continue ✨")
        return Response("<Response></Response>", media_type="application/xml")

    # ---------------------- Step 2: Save email ----------------------
    if user_state.get(phone) == "waiting_email":
        user_email[phone] = msg
        user_state[phone] = None

        # Resolve UID
        uid = resolve_uid(msg)
        phone_to_uid[phone] = uid

        send_whatsapp(From, f"🎉 Email saved: {msg}")
        send_whatsapp(
            From,
            "You can now ask:\n"
            "- *dreams*\n"
            "- *dream plan*\n"
            "- *cashflow*\n"
            "- *advice*",
        )
        return Response("<Response></Response>", media_type="application/xml")

    # If user has email but UID missing → fetch once
    if phone not in phone_to_uid:
        uid = resolve_uid(user_email[phone])
        phone_to_uid[phone] = uid

    uid = phone_to_uid.get(phone)
    if not uid:
        send_whatsapp(From, "❌ Unable to resolve your account. Send email again.")
        return Response("<Response></Response>", media_type="application/xml")

    # ---------------------- Step 3: Commands ----------------------

    # Dreams list
    if "dream" in msg_lower and "plan" not in msg_lower:
        r = requests.get(f"{BACKEND}/dreams/{uid}")
        try:
            data = r.json()
        except:
            data = json.loads(r.text)

        send_whatsapp(From, format_nested(data, "🌙 Your Dreams"))
        return Response("<Response></Response>", media_type="application/xml")

    # Dream plan
    if "plan" in msg_lower:
        r = requests.get(f"{BACKEND}/dreams/plan/{uid}")
        try:
            data = r.json()
        except:
            data = json.loads(r.text)

        send_whatsapp(From, format_nested(data, "🧠 Dream Plan"))
        return Response("<Response></Response>", media_type="application/xml")

    # Cashflow
    if "cash" in msg_lower:
        r = requests.get(f"{BACKEND}/cashflow/predict/{uid}")
        try:
            data = r.json()
        except:
            data = json.loads(r.text)

        send_whatsapp(From, format_nested(data, "💰 Cashflow Prediction"))
        return Response("<Response></Response>", media_type="application/xml")

    # Advice
    if "advice" in msg_lower:
        r = requests.post(f"{BACKEND}/generate-advice", json={"userId": uid})
        advice = r.json().get("advice", "No advice available.")
        send_whatsapp(From, f"*💡 Advice*\n\n{advice}")
        return Response("<Response></Response>", media_type="application/xml")

    # Unknown
    send_whatsapp(
        From,
        "Sorry 😅 I didn’t understand.\nTry:\n"
        "- dreams\n- dream plan\n- cashflow\n- advice",
    )
    return Response("<Response></Response>", media_type="application/xml")
