# agents/finance_chatbot_agent.py

from services.firestore_service import (
    save_chat_message,
    get_chat_history,
    get_onboarding_fields,
)
from services.gemini_service import call_gemini


class chatbot:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.onboarding = get_onboarding_fields(user_id)
        self.history = get_chat_history(user_id)

    def chat(self, user_message: str):

        # Save user message
        save_chat_message(self.user_id, "user", user_message)

        # Recent chat context (last 10 messages)
        last_messages = "\n".join(
            [f"{c['role']}: {c['message']}" for c in self.history[-10:]]
        )

        # Extract fields safely
        income = self.onboarding.get("monthlyIncome")
        expense = self.onboarding.get("monthlyExpense")
        risk = self.onboarding.get("riskAppetite")
        invest_amt = self.onboarding.get("investmentAmount")

        # Check data completeness
        profile_complete = all(
            [
                income not in (None, "", 0),
                expense not in (None, "", 0),
                risk not in (None, ""),
                invest_amt not in (None, "", 0),
            ]
        )

        # ===========================================================
        # SPECIAL CASE 1: User says Hi / Hello / Who are you
        # ===========================================================
        greeting_keywords = ["hi", "hello", "hey", "who are you", "introduce"]
        if any(k in user_message.lower() for k in greeting_keywords):
            reply = (
                "Hi! I’m your personal finance chatbot. "
                "I help you understand money, savings, and investments in simple language. "
                "Ask me anything—budgeting, SIPs, stocks, taxes, or goals!"
            )
            save_chat_message(self.user_id, "assistant", reply)
            return {"reply": reply, "intro": True, "userId": self.user_id}

        # ===========================================================
        # SPECIAL CASE 2: Profile incomplete → give simple response
        # ===========================================================
        if not profile_complete:
            prompt = f"""
You are a friendly Indian finance chatbot.

RULES:
- Keep the answer under 8–10 lines.
- DO NOT generate a full portfolio because data is incomplete.
- Answer the user's question clearly and simply.
- If needed, ask for missing info (income, expenses, risk, investment amount).

USER MESSAGE:
"{user_message}"

RECENT CHAT:
{last_messages}

Write in simple English, friendly tone.
"""
            response = call_gemini(prompt)
            save_chat_message(self.user_id, "assistant", response)

            return {
                "reply": response,
                "profile_complete": False,
                "userId": self.user_id,
            }

        # ===========================================================
        # FULL PROFILE PRESENT → Give Finance Guidance + Portfolio
        # ===========================================================
        savings = income - expense if isinstance(income, (int, float)) else None

        prompt = f"""
You are a SEBI-like Indian financial advisor.

RULES:
- Answer in under 10 lines.
- First answer the user's question.
- Then give a simple personalized investment direction.
- Include a SHORT portfolio only if relevant.

USER PROFILE:
Income ₹{income}, Expense ₹{expense}, Savings ₹{savings}
Risk Appetite: {risk}
Investment Amount: ₹{invest_amt}
Gig Type: {self.onboarding.get('gigType')}

USER QUESTION:
"{user_message}"

RECENT CHAT:
{last_messages}

FORMAT:
1–2 lines: Answer doubt clearly  
3–4 lines: Simple advice  
Up to 3 lines: Short portfolio IF user asked about investing  

Write human-friendly, very simple.
"""
        response = call_gemini(prompt)

        save_chat_message(self.user_id, "assistant", response)

        return {
            "reply": response,
            "profile_complete": True,
            "userId": self.user_id,
        }
