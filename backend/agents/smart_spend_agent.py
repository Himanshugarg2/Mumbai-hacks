# agents/smart_spend_agent.py
import json
from services.firestore_service import get_full_summary
from services.gemini_service import call_gemini


class SmartSpendGuardianService:
    def __init__(self, user_id):
        self.user_id = user_id

    def compute_safe_daily_limit(self, monthly_income, monthly_expense):
        monthly_income = float(monthly_income)
        monthly_expense = float(monthly_expense)

        if monthly_income <= 0:
            return 300

        work_days = 26
        safe = (monthly_income - monthly_expense) / work_days
        return max(50, round(safe, 2))

    def predict(self):
        summary = get_full_summary(self.user_id)

        monthly_income = summary.get("monthlyIncome", 0)
        monthly_expense = summary.get("monthlyExpense", 0)

        safe_daily = self.compute_safe_daily_limit(monthly_income, monthly_expense)

        today_data = summary.get("today", {})
        today_spent = today_data.get("todaySpent", 0)
        category_risk = today_data.get("categoryRisk")
        today_expenses = today_data.get("expenses", {})
        latest_date = today_data.get("date")

        # ⭐ NEW: today income added
        today_income = float(today_data.get("income", 0))
        today_net = today_income - today_spent  # daily profit/loss

        avg_daily = summary.get("avgDailySpend", 0)
        projected_monthly = summary.get("projectedMonthlySpend", 0)
        overshoot = summary.get("expectedOvershoot", 0)

        # Gemini context
        context = {
            "safeDailyLimit": safe_daily,
            "latestDay": latest_date,
            "todayIncome": today_income,  # NEW
            "todaySpent": today_spent,
            "todayNet": today_net,  # NEW
            "categoryRisk": category_risk,
            "avgDailySpend": avg_daily,
            "projectedMonthly": projected_monthly,
            "expectedOvershoot": overshoot,
            "rawExpenses": today_expenses,
            "monthlyIncome": monthly_income,
        }

        prompt = f"""
You are SmartSpend Guardian, a financial assistant for Indian gig workers.

Here is the user's real-time spending & income data:
{json.dumps(context)}

TASK:
Give EXACTLY ONE short actionable financial warning for TODAY,
based on:
- today's income
- today's spending
- daily safe limit
- category overspending
- projected monthly overshoot
- net daily balance

Must be 1 sentence.
"""

        ai_tip = call_gemini(prompt)

        return {
            "safeDailyLimit": safe_daily,
            "latestDay": latest_date,
            "todayIncome": today_income,  # NEW
            "todaySpent": today_spent,
            "todayNet": today_net,  # NEW
            "categoryRisk": category_risk,
            "avgDailySpend": avg_daily,
            "projectedMonthly": projected_monthly,
            "expectedOvershoot": overshoot,
            "expensesToday": today_expenses,
            "tip": ai_tip,
        }
