# services/firestore_service.py
# This file handles all Firestore interactions

import firebase_admin
from firebase_admin import credentials, firestore

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
        .update(data)
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
            # 🔥 FIX: Convert string → number safely
            value = float(amt) if isinstance(amt, str) else (amt or 0)
            category_totals[cat] = category_totals.get(cat, 0) + value

    summary["byCategory"] = category_totals

    return summary
