from fastapi import FastAPI, Form, Response, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse

load_dotenv()

# -------------------------------------------------------------------
# FASTAPI APP (PORT 3000)
# -------------------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# MEMORY (TEMP STORAGE)
# -------------------------------------------------------------------
user_state = {}  # tracks if user is in email-collecting mode
user_email = {}  # maps phone -> email

FASTAPI_BASE_URL = "http://localhost:8000"  # main backend

# -------------------------------------------------------------------
# Twilio config from env
# -------------------------------------------------------------------
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_WHATSAPP_FROM")
client = Client(TWILIO_SID, TWILIO_AUTH)


# -------------------------------------------------------------------
# SEND WHATSAPP MESSAGE VIA TWILIO
# -------------------------------------------------------------------
def send_whatsapp(to, text):
    client.messages.create(from_=TWILIO_FROM, to=to, body=text)


# -------------------------------------------------------------------
# WHATSAPP SERVICE API ENDPOINTS
# -------------------------------------------------------------------
@app.post("/whatsapp/send")
async def whatsapp_send(to: str = Form(...), body: str = Form(...)):
    try:
        message = client.messages.create(from_=TWILIO_FROM, to=to, body=body)
        return {"status": "sent", "sid": message.sid}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/whatsapp/handle")
async def whatsapp_handle(request: Request):
    form = await request.form()
    from_num = form.get("From")
    message_body = form.get("Body")
    phone = from_num.replace("whatsapp:", "") if from_num else ""
    msg = message_body.strip().lower() if message_body else ""

    resp = MessagingResponse()

    # STEP 1: Ask for Email
    if phone not in user_email:
        resp.message("Hi! Please share your email to continue ✨")
        user_state[phone] = "waiting_email"
        return Response(str(resp), media_type="application/xml")

    # STEP 2: Save email
    if user_state.get(phone) == "waiting_email":
        user_email[phone] = message_body.strip()
        user_state[phone] = None
        resp.message(f"Thanks! Your email ({user_email[phone]}) is saved 🎉")
        resp.message("You can now ask:\n- dreams\n- cashflow\n- advice")
        return Response(str(resp), media_type="application/xml")

    # STEP 3: Commands
    if "dream" in msg:
        r = requests.get(f"{FASTAPI_BASE_URL}/dreams/{phone}")
        resp.message(f"Your dreams:\n{r.json()}")
        return Response(str(resp), media_type="application/xml")

    if "cash" in msg:
        r = requests.get(f"{FASTAPI_BASE_URL}/cashflow/predict/{phone}")
        resp.message(f"Cashflow Prediction:\n{r.json()}")
        return Response(str(resp), media_type="application/xml")

    if "advice" in msg:
        payload = {"userId": phone}
        r = requests.post(f"{FASTAPI_BASE_URL}/generate-advice", json=payload)
        resp.message(f"Advice:\n{r.json().get('advice', '')}")
        return Response(str(resp), media_type="application/xml")

    # Default
    resp.message("Sorry, I didn’t understand. Try: dreams / cashflow / advice")
    return Response(str(resp), media_type="application/xml")


# -------------------------------------------------------------------
# WEBHOOK ENDPOINT (TWILIO CALLS THIS)
@app.post("/webhook")
def whatsapp_webhook(From: str = Form(...), Body: str = Form(...)):
    phone = From.replace("whatsapp:", "")
    msg = Body.strip()

    # -------- 1️⃣ FIRST: If waiting for email → SAVE IT --------
    if user_state.get(phone) == "waiting_email":
        user_email[phone] = msg
        user_state[phone] = None

        send_whatsapp(From, f"Thanks! Your email ({msg}) is saved 🎉")
        send_whatsapp(From, "Now you can ask:\n- dreams\n- cashflow\n- advice")
        return Response("<Response></Response>", media_type="application/xml")

    # -------- 2️⃣ SECOND: If no email → ASK FOR EMAIL --------
    if phone not in user_email:
        user_state[phone] = "waiting_email"
        send_whatsapp(From, "Hi! Please share your email to continue ✨")
        return Response("<Response></Response>", media_type="application/xml")

    # -------- 3️⃣ THIRD: Process other commands --------
    message = msg.lower()

    if "dream" in message:
        r = requests.get(f"{FASTAPI_BASE_URL}/dreams/{phone}")
        send_whatsapp(From, f"Your dreams:\n{r.json()}")
        return Response("<Response></Response>", media_type="application/xml")

    if "cash" in message:
        r = requests.get(f"{FASTAPI_BASE_URL}/cashflow/predict/{phone}")
        send_whatsapp(From, f"Cashflow Prediction:\n{r.json()}")
        return Response("<Response></Response>", media_type="application/xml")

    if "advice" in message:
        payload = {"userId": phone}
        r = requests.post(f"{FASTAPI_BASE_URL}/generate-advice", json=payload)
        send_whatsapp(From, f"Advice:\n{r.json()['advice']}")
        return Response("<Response></Response>", media_type="application/xml")

    # Default fallback
    send_whatsapp(From, "Sorry, try: dreams / cashflow / advice")
    return Response("<Response></Response>", media_type="application/xml")
