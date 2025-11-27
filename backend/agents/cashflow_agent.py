import numpy as np
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from services.gemini_service import call_gemini


# -----------------------------
# Firebase Init
# -----------------------------
cred = credentials.Certificate("firebase-key.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()


class CashflowPredictionService:
    def __init__(self, user_id):
        self.user_id = user_id
        self.user_ref = db.collection("users").document(user_id)

    # -------------------------------------------------
    # Fetch user profile + transactions (if needed)
    # -------------------------------------------------
    def get_user_profile(self):
        data = self.user_ref.get().to_dict()
        return data or {}

    def get_recent_transactions(self):
        logs = self.user_ref.collection("transactions").stream()
        result = []

        for d in logs:
            obj = d.to_dict()
            obj["date"] = d.id
            result.append(obj)

        return result

    # -------------------------------------------------
    # Simple Linear Regression (numpy)
    # -------------------------------------------------
    def simple_linear_predict(self, values):
        if len(values) < 2:
            return values[-1] if values else 0

        X = np.arange(len(values))
        Y = np.array(values)

        slope = np.cov(X, Y, bias=True)[0][1] / np.var(X)
        intercept = Y.mean() - slope * X.mean()

        return slope * len(values) + intercept

    # -------------------------------------------------
    # Main Prediction Logic
    # -------------------------------------------------
    def predict(self):
        profile = self.get_user_profile()

        base_income = float(profile.get("monthlyIncome", 0))
        base_expense = float(profile.get("monthlyExpense", 0))

        # ----------------------------------
        # Build pseudo-historical data (6 mo)
        # ----------------------------------
        past_income = np.array(
            [base_income * np.random.uniform(0.6, 1.25) for _ in range(6)]
        )

        past_expense = np.array(
            [base_expense * np.random.uniform(0.85, 1.15) for _ in range(6)]
        )

        # Regression-based prediction
        next_income = self.simple_linear_predict(past_income)
        next_expense = self.simple_linear_predict(past_expense)

        shortage = next_expense - next_income

        # ----------------------------------
        # Cashflow Stability Score (0–100)
        # ----------------------------------
        if shortage <= 0:
            score = 75 + np.random.randint(10)
        else:
            percent_gap = (shortage / max(next_income, 1)) * 100
            score = max(5, 70 - percent_gap)

        # ----------------------------------
        # Gemini – Generate 3 personalized tips
        # ----------------------------------
        prompt = f"""
You are a financial planning AI for Indian gig workers.

Given this data:
- Next month expected income: ₹{int(next_income)}
- Next month expected expense: ₹{int(next_expense)}
- Expected shortage: ₹{int(shortage)} (negative means safe)
- Base monthly income: ₹{base_income}
- Base monthly expense: ₹{base_expense}

TASK:
Generate EXACTLY 3 short, highly personalized and practical financial tips.
Each tip must be a single sentence.
Focus on:
- reducing spend
- boosting income
- managing cashflow risk
- planning ahead

Return tips in plain text separated by newline. No bullets or numbering.
"""

        ai_text = call_gemini(prompt)

        # ensure list format
        tips = [t.strip() for t in ai_text.split("\n") if t.strip()]
        if len(tips) > 3:
            tips = tips[:3]

        # ----------------------------------
        # Final Response
        # ----------------------------------
        result = {
            "cashflowScore": int(score),
            "shortageAmount": int(shortage) if shortage > 0 else 0,
            "next30DaysProjection": {
                "income": int(next_income),
                "expense": int(next_expense),
            },
            "aiTips": tips,
            "updatedAt": datetime.utcnow().isoformat(),
        }

        # Store in Firestore
        self.user_ref.collection("cashflow").document("prediction").set(result)

        return result
