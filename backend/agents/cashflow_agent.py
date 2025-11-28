import numpy as np
from datetime import datetime
from services.firestore_service import get_user_transactions
from services.gemini_service import call_gemini
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase init
cred = credentials.Certificate("firebase-key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()


class CashflowPredictionService:
    def __init__(self, user_id):
        self.user_id = user_id
        self.user_ref = db.collection("users").document(user_id)

    def get_user_profile(self):
        return self.user_ref.get().to_dict() or {}

    def predict(self):
        profile = self.get_user_profile()

        base_income = float(profile.get("monthlyIncome", 0))  # onboarding income
        base_expense = float(profile.get("monthlyExpense", 0))  # onboarding expense

        logs = get_user_transactions(self.user_id)

        now = datetime.now()
        cm = now.month
        cy = now.year

        daily_incomes = []
        daily_expenses = []
        days_logged = 0

        # ---------- READ REAL FIRESTORE DATE (doc.id) ----------
        for log in logs:
            date_str = log.get("__id__") or log.get("date")
            if not date_str:
                continue

            try:
                dt = datetime.strptime(date_str, "%Y-%m-%d")
            except:
                continue

            # ---------- include ONLY current month's logs ----------
            if dt.year == cy and dt.month == cm:
                days_logged += 1

                income = float(log.get("income", 0))
                total_exp = sum(float(v or 0) for v in log.get("expenses", {}).values())

                daily_incomes.append(income)
                daily_expenses.append(total_exp)

        # ---------- If no logs this month → fallback to onboarding ----------
        if days_logged == 0:
            final_income = base_income
            final_expense = base_expense

        else:
            # ---------- project from actual logs ----------
            avg_daily_income = np.mean(daily_incomes)
            avg_daily_expense = np.mean(daily_expenses)

            projected_income_actual = avg_daily_income * 30
            projected_expense_actual = avg_daily_expense * 30

            # ---------- NO mixing onboarding into projection ----------
            final_income = projected_income_actual
            final_expense = projected_expense_actual

        shortage = final_expense - final_income

        # ---------- Cashflow Score ----------
        if shortage <= 0:
            score = 85
        else:
            percent_gap = (shortage / max(final_income, 1)) * 100
            score = max(5, 75 - percent_gap)

        # ---------- Gemini AI Tips ----------
        prompt = f"""
You are a financial coach for gig workers in India.

User data:
- Onboarding expected income: ₹{base_income}
- Onboarding expected expense: ₹{base_expense}
- Avg daily income this month: ₹{np.mean(daily_incomes) if days_logged else 0:.0f}
- Avg daily expense this month: ₹{np.mean(daily_expenses) if days_logged else 0:.0f}
- Projected monthly income based on actual logs: ₹{final_income:.0f}
- Projected monthly expenses based on actual logs: ₹{final_expense:.0f}
- Expected shortage (if any): ₹{shortage:.0f}

TASK:
Give EXACTLY 3 short, sharp, actionable financial tips.
Each tip must be ONE sentence. No bullets.
"""

        ai_text = call_gemini(prompt)
        tips = [t.strip() for t in ai_text.split("\n") if t.strip()][:3]

        result = {
            "cashflowScore": int(score),
            "shortageAmount": int(shortage) if shortage > 0 else 0,
            "next30DaysProjection": {
                "income": int(final_income),
                "expense": int(final_expense),
            },
            "aiTips": tips,
            "dailyStats": {
                "daysLogged": days_logged,
                "avgDailyIncome": (
                    round(np.mean(daily_incomes), 2) if days_logged else 0
                ),
                "avgDailyExpense": (
                    round(np.mean(daily_expenses), 2) if days_logged else 0
                ),
            },
            "updatedAt": datetime.utcnow().isoformat(),
        }

        self.user_ref.collection("cashflow").document("prediction").set(result)
        return result
