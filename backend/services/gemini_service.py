# services/gemini_service.py
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "models/gemini-2.5-flash"


# -----------------------------
# 🔵 Shared Gemini Caller
# -----------------------------
def call_gemini(prompt: str) -> str:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)

        # Some responses might not have .text (Gemini API quirk)
        text = getattr(response, "text", None)

        if text and text.strip():
            return text.strip()

        # fallback
        return "No response generated."

    except Exception as e:
        print("Gemini Error:", e)
        return "AI tip unavailable right now."


# -----------------------------
def generate_advice(summary: dict):
    prompt = f"""
You are a financial advisor AI. The user gives their financial summary.

User Summary:
• Income: {summary.get('totalIncome')}
• Expenses: {summary.get('totalExpenses')}
• Balance: {summary.get('balance')}
• Spending Categories: {summary.get('byCategory')}

TASK:
- Give EXACTLY 3 short, sharp, personalized recommendations.
- Avoid generic statements.
- Focus on real improvements based on the numbers.
- Keep each tip to 1 sentence.
"""

    return call_gemini(prompt)


# -------------------------------------
# 🔵 Custom Gemini JSON Caller (safe)
# -------------------------------------
def call_gemini_json(prompt: str) -> str:
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)

        # Correct extraction for Gemini 2.5 JSON output
        if (
            hasattr(response, "candidates")
            and response.candidates
            and hasattr(response.candidates[0], "content")
        ):
            parts = response.candidates[0].content.parts
            if parts:
                text = "".join(
                    getattr(part, "text", "") for part in parts if hasattr(part, "text")
                )
                return text.strip()

        return ""  # return empty to trigger fallback in DreamPlanner

    except Exception as e:
        print("Gemini JSON Error:", e)
        return ""
