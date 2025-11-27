# agents/smart_spend_agent.py
import json
from services.firestore_service import get_full_summary
from services.gemini_service import call_gemini


class SmartSpendGuardianService:
    def __init__(self, user_id):
        self.user_id = user_id

    # -----------------------------------------
    # 1. Safe daily limit based on monthly income
    # -----------------------------------------
    def compute_safe_daily_limit(self, monthly_income, monthly_expense):
        monthly_income = float(monthly_income)
        monthly_expense = float(monthly_expense)

        if monthly_income <= 0:
            return 300  # fallback

        work_days = 26
        safe = (monthly_income - monthly_expense) / work_days
        return max(50, round(safe, 2))

    # -----------------------------------------
    # 2. Main prediction
    # -----------------------------------------
    def predict(self):
        # 🔥 Fetch fully enriched summary
        summary = get_full_summary(self.user_id)

        monthly_income = summary.get("monthlyIncome", 0)
        monthly_expense = summary.get("monthlyExpense", 0)

        # Safe limit calculation
        safe_daily = self.compute_safe_daily_limit(monthly_income, monthly_expense)

        # Today's data
        today_data = summary.get("today", {})
        today_spent = today_data.get("todaySpent", 0)
        category_risk = today_data.get("categoryRisk")
        today_expenses = today_data.get("expenses", {})
        latest_date = today_data.get("date")

        # Velocity
        avg_daily = summary.get("avgDailySpend", 0)
        projected_monthly = summary.get("projectedMonthlySpend", 0)
        overshoot = summary.get("expectedOvershoot", 0)

        # Build context for Gemini
        context = {
            "safeDailyLimit": safe_daily,
            "latestDay": latest_date,
            "todaySpent": today_spent,
            "categoryRisk": category_risk,
            "avgDailySpend": avg_daily,
            "projectedMonthly": projected_monthly,
            "expectedOvershoot": overshoot,
            "rawExpenses": today_expenses,
            "monthlyIncome": monthly_income,
        }

        prompt = f"""
You are SmartSpend Guardian, a friendly Indian financial coach for gig workers.

Given this data:
{json.dumps(context)}

TASK:
Return EXACTLY ONE short actionable sentence warning the user about their spending.
Mention ₹ amounts if helpful.

Examples:
- "Avoid spending over ₹150 today—you are already close to your safe limit."
- "Your food spend is too high today, try to keep the rest under ₹120."
- "At this pace you'll exceed your monthly budget by ₹900—reduce misc expenses today."

Return ONLY the tip text.
"""

        ai_tip = call_gemini(prompt)

        # -------------------------------
        # Final return payload
        # -------------------------------
        return {
            "safeDailyLimit": safe_daily,
            "latestDay": latest_date,
            "todaySpent": today_spent,
            "categoryRisk": category_risk,
            "avgDailySpend": avg_daily,
            "projectedMonthly": projected_monthly,
            "expectedOvershoot": overshoot,
            "expensesToday": today_expenses,
            "tip": ai_tip,
        }
