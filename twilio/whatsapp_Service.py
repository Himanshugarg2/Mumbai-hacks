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


def send_whatsapp_message(to: str, body: str):
    return client.messages.create(from_=TWILIO_FROM, to=to, body=body)


def handle_incoming_message(from_num: str, message_body: str) -> str:
    phone = from_num.replace("whatsapp:", "")
    msg = message_body.strip().lower()

    resp = MessagingResponse()

    # STEP 1: Ask for Email
    if phone not in user_email:
        resp.message("Hi! Please share your email to continue ✨")
        user_state[phone] = "waiting_email"
        return str(resp)

    # STEP 2: Save email
    if user_state.get(phone) == "waiting_email":
        user_email[phone] = message_body.strip()
        user_state[phone] = None

        resp.message(f"Thanks! Your email ({user_email[phone]}) is saved 🎉")
        resp.message("You can now ask:\n- dreams\n- cashflow\n- advice")
        return str(resp)

    # STEP 3: Commands
    if "dream" in msg:
        r = requests.get(f"{FASTAPI_BASE}/dreams/{phone}")
        resp.message(f"Your dreams:\n{r.json()}")
        return str(resp)

    if "cash" in msg:
        r = requests.get(f"{FASTAPI_BASE}/cashflow/predict/{phone}")
        resp.message(f"Cashflow Prediction:\n{r.json()}")
        return str(resp)

    if "advice" in msg:
        payload = {"userId": phone}
        r = requests.post(f"{FASTAPI_BASE}/generate-advice", json=payload)
        resp.message(f"Advice:\n{r.json()['advice']}")
        return str(resp)

    # Default
    resp.message("Sorry, I didn’t understand. Try: dreams / cashflow / advice")

    return str(resp)
