# this service interacts with Gemini API to generate financial advice

import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "models/gemini-2.5-flash"


def generate_advice(summary: dict):
    try:
        prompt = f"""
        You are a financial coaching AI.

        Here is the user's financial summary:
        • Income: {summary.get('totalIncome')}
        • Expenses: {summary.get('totalExpenses')}
        • Balance: {summary.get('balance')}
        • Category breakdown: {summary.get('byCategory')}

        Provide exactly 3 short, actionable, personalized recommendations.
        Do NOT give generic advice.
        Make each suggestion specific and practical.
        """

        model = genai.GenerativeModel(MODEL_NAME)

        response = model.generate_content(prompt)

        # ✅ safe return
        return (response.text or "").strip() or "No advice generated."

    except Exception as e:
        print(f"Gemini API Error using {MODEL_NAME}:", e)
        return "Unable to generate advice right now."
