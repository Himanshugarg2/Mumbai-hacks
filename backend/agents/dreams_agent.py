import json
from datetime import datetime, timezone
from services.firestore_service import get_full_summary, get_dreams
from services.gemini_service import call_gemini
from firebase_admin import firestore

db = firestore.client()


class DreamPlannerService:
    def __init__(self, user_id):
        self.user_id = user_id

    # ------------------------------
    # Months between dates
    # ------------------------------
    def months_between(self, start, end):
        return max(1, (end.year - start.year) * 12 + (end.month - start.month))

    # ------------------------------
    # MAIN FUNCTION (always computes fresh result)
    # ------------------------------
    def predict(self):
        return self._compute_plan()

    # ------------------------------
    # INTERNAL: Compute fresh AI plan
    # ------------------------------
    def _compute_plan(self):
        summary = get_full_summary(self.user_id)
        dreams = get_dreams(self.user_id)

        monthly_income = float(summary.get("monthlyIncome", 0))
        monthly_expense = float(summary.get("monthlyExpense", 0))
        projected_savings = monthly_income - monthly_expense

        plans = []

        for dream in dreams:
            goal = float(dream.get("goal_amount", 0))
            saved = float(dream.get("saved_amount", 0))
            title = dream.get("title", "Dream")
            deadline = dream.get("deadline")

            if not deadline:
                continue

            deadline_date = datetime.strptime(deadline, "%Y-%m-%d")
            today = datetime.now(timezone.utc)

            months_left = self.months_between(today, deadline_date)
            remaining = max(0, goal - saved)

            monthly_required = remaining / months_left
            daily_required = monthly_required / 30
            affordable = monthly_required <= projected_savings

            plans.append(
                {
                    "title": title,
                    "goal": goal,
                    "saved": saved,
                    "remaining": remaining,
                    "deadline": deadline,
                    "monthsLeft": months_left,
                    "monthlyRequired": round(monthly_required, 2),
                    "dailyRequired": round(daily_required, 2),
                    "isAffordable": affordable,
                }
            )

        # ------------------------------
        # GEMINI PROMPT
        # ------------------------------
        prompt = f"""
You are a financial planning assistant for gig workers in India.

User summary:
{json.dumps(summary, indent=2)}

User dreams:
{json.dumps(plans, indent=2)}

TASK:
Return a VALID JSON object where each key is a dream title.

Each dream must have:
{{
  "monthly_plan": "string",
  "daily_plan": "string",
  "adjustments": "string",
  "motivation": "string"
}}

Return ONLY JSON — no text outside JSON.
"""

        raw_response = call_gemini(prompt)

        # Safe parsing
        try:
            ai_plan_json = json.loads(raw_response)
            if not isinstance(ai_plan_json, dict):
                ai_plan_json = {}
        except Exception:
            ai_plan_json = {}

        return {
            "dreams": plans,
            "aiPlan": ai_plan_json,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        }
