import numpy as np
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase init
cred = credentials.Certificate("firebase-key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Financial Portfolio Agent
import re
import firebase_admin
from firebase_admin import credentials, firestore
from services.gemini_service import call_gemini


class FinancialPortfolioAgent:
    def __init__(self, user_id):
        self.user_id = user_id
        self.user_ref = db.collection("users").document(user_id)

    def get_user_profile(self):
        return self.user_ref.get().to_dict() or {}

    def generate_portfolio(self):
        profile = self.get_user_profile()
        # Collect all onboarding fields
        age = profile.get("age", "")
        sex = profile.get("sex", "")
        income = profile.get("income", "")
        incomeAfterTax = profile.get("incomeAfterTax", "")
        marriageStatus = profile.get("marriageStatus", "")
        numOfKids = profile.get("numOfKids", "")
        ageOfParents = profile.get("ageOfParents", "")
        riskAppetite = profile.get("riskAppetite", "")
        healthConditions = profile.get("healthConditions", "")
        investmentAmount = profile.get("investmentAmount", "")

        prompt = (
            f"Age: {age}, Sex: {sex}, Income (INR): {income}, "
            f"Income after Tax: {incomeAfterTax}, Marriage Status: {marriageStatus}, "
            f"Number of Kids: {numOfKids}, Age of Parents: {ageOfParents}, "
            f"Risk Appetite: {riskAppetite}, Health Conditions: {healthConditions}, "
            f"Amount to Invest: {investmentAmount} INR. "
            f"Based on Indian investing principles, provide: \n"
            f"1. Portfolio allocation (percentages + rupee amounts) across Equity, Debt, Mutual Funds, FD, Commodities. \n"
            f"2. Recommended health insurance coverage and term insurance amount. \n"
            f"3. Top 5 Indian Mutual Fund recommendations matching the user's risk appetite "
            f"(provide fund name + category + expected returns short one-liner). \n"
            f"Be VERY concise. No disclaimers. Bullet points only. "
        )

        ai_text = call_gemini(prompt)
        cleaned_response = re.sub(r"\*+", "", ai_text)

        result = {
            "portfolio": cleaned_response,
            "updatedAt": datetime.utcnow().isoformat(),
        }
        self.user_ref.collection("portfolio").document("allocation").set(result)
        return result
