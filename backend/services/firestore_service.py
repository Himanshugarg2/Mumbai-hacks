# services/firestore_service.py
# This file handles all Firestore interactions

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase Admin only once
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred)

# Correct Firestore client
db = firestore.client()


# Add dream
def add_dream(user_id, data):
    return db.collection("users").document(user_id).collection("dreams").add(data)


# Get all dreams
def get_dreams(user_id):
    docs = db.collection("users").document(user_id).collection("dreams").stream()

    dreams = []
    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        dreams.append(item)

    return dreams


# Update dream
def update_dream(user_id, dream_id, data):
    return (
        db.collection("users")
        .document(user_id)
        .collection("dreams")
        .document(dream_id)
        .set(data, merge=True)
    )


# Delete dream
def delete_dream(user_id, dream_id):
    return (
        db.collection("users")
        .document(user_id)
        .collection("dreams")
        .document(dream_id)
        .delete()
    )


def get_summary(user_id: str) -> dict:
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get().to_dict()

    if not user_doc:
        return {
            "totalIncome": 0,
            "totalExpenses": 0,
            "balance": 0,
            "byCategory": {},
        }

    monthly_income = user_doc.get("monthlyIncome", 0)
    monthly_expense = user_doc.get("monthlyExpense", 0)

    summary = {
        "totalIncome": monthly_income,
        "totalExpenses": monthly_expense,
        "balance": monthly_income - monthly_expense,
        "byCategory": {},
    }

    trans_ref = user_ref.collection("transactions")
    trans_docs = trans_ref.stream()

    category_totals = {}

    for t in trans_docs:
        data = t.to_dict()
        expenses = data.get("expenses", {})

        for cat, amt in expenses.items():
            value = float(amt) if isinstance(amt, str) else (amt or 0)
            category_totals[cat] = category_totals.get(cat, 0) + value

    summary["byCategory"] = category_totals

    return summary


def get_user_transactions(user_id: str):
    """
    Fetch all daily transaction logs for the user.
    Expected structure:
    users/{userId}/transactions/{YYYY-MM-DD}
    """
    try:
        trans_ref = db.collection("users").document(user_id).collection("transactions")
        docs = trans_ref.stream()

        logs = []
        for doc in docs:
            data = doc.to_dict()
            data["date"] = doc.id  # 🔥 THIS IS THE FIX
            logs.append(data)

        return logs

    except Exception as e:
        print("Error fetching user transactions:", e)
        return []


def get_full_summary(user_id: str) -> dict:
    """
    Returns a complete summary of the user's financial activity:
    - monthlyIncome, monthlyExpense
    - total category spend (monthly)
    - all daily logs
    - today's spending
    - category dominance
    - avg daily spend
    - projected monthly spend
    - expected overshoot
    """

    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get().to_dict() or {}

    monthly_income = float(user_doc.get("monthlyIncome", 0))
    monthly_expense = float(user_doc.get("monthlyExpense", 0))

    # -----------------------------------------
    # 1. Fetch ALL daily logs
    # -----------------------------------------
    trans_ref = user_ref.collection("transactions")
    trans_docs = trans_ref.stream()

    all_logs = []
    category_totals = {}
    today_str = datetime.now().strftime("%Y-%m-%d")

    today_expenses = {}
    today_spent = 0

    for doc in trans_docs:
        data = doc.to_dict()

        date = data.get("date") or doc.id  # use doc.id if needed
        expenses = data.get("expenses", {})
        income = float(data.get("income", 0))

        # Add log to list
        all_logs.append({"date": date, "income": income, "expenses": expenses})

        # Build category totals (monthly)
        for cat, amt in expenses.items():
            value = float(amt or 0)
            category_totals[cat] = category_totals.get(cat, 0) + value

        # Check today
        if date == today_str:
            today_expenses = expenses
            today_spent = sum(float(v or 0) for v in expenses.values())

    # -----------------------------------------
    # 2. Category dominance (SmartSpend)
    # -----------------------------------------
    category_risk = None
    if today_expenses:
        total_today = sum(float(v or 0) for v in today_expenses.values())
        if total_today > 0:
            for cat, val in today_expenses.items():
                if float(val or 0) / total_today >= 0.40:  # >40%
                    category_risk = cat
                    break

    # -----------------------------------------
    # 3. Spending velocity (SmartSpend)
    # -----------------------------------------
    if all_logs:
        total_days = len(all_logs)
        total_spent = 0
        for log in all_logs:
            total_spent += sum(float(v or 0) for v in log["expenses"].values())

        avg_daily = total_spent / total_days
        projected_monthly = avg_daily * 30
    else:
        avg_daily = 0
        projected_monthly = 0

    overshoot = max(0, projected_monthly - monthly_income)

    # -----------------------------------------
    # Final summary
    # -----------------------------------------
    return {
        "monthlyIncome": monthly_income,
        "monthlyExpense": monthly_expense,
        "balance": monthly_income - monthly_expense,
        "byCategory": category_totals,
        "today": {
            "date": today_str,
            "expenses": today_expenses,
            "todaySpent": today_spent,
            "categoryRisk": category_risk,
        },
        "logs": all_logs,
        "avgDailySpend": round(avg_daily, 2),
        "projectedMonthlySpend": round(projected_monthly, 2),
        "expectedOvershoot": round(overshoot, 2),
    }
