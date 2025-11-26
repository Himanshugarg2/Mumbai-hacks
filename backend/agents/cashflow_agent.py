import numpy as np
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Load Firebase service account
cred = credentials.Certificate("firebase-key.json")

# Initialize only once
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()


class CashflowPredictionService:
    def __init__(self, user_id):
        self.user_id = user_id
        self.user_ref = db.collection("users").document(user_id)

    def get_user_data(self):
        user = self.user_ref.get().to_dict()
        return user

    # Simple linear regression using numpy
    def simple_linear_predict(self, values):
        X = np.arange(len(values))
        Y = np.array(values)

        slope = np.cov(X, Y, bias=True)[0][1] / np.var(X)
        intercept = Y.mean() - slope * X.mean()

        return slope * len(values) + intercept

    def predict(self):
        user = self.get_user_data()
        income = user["monthlyIncome"]
        expense = user["monthlyExpense"]

        # Simulate past 6 months for irregular workers
        past_income = np.array([income * np.random.uniform(0.6, 1.2) for _ in range(6)])
        past_expense = np.array(
            [expense * np.random.uniform(0.9, 1.1) for _ in range(6)]
        )

        next_income = self.simple_linear_predict(past_income)
        next_expense = self.simple_linear_predict(past_expense)

        shortage = next_expense - next_income

        if shortage <= 0:
            score = 80 + np.random.randint(10)
        else:
            score = max(10, 80 - (shortage / next_income * 100))

        if shortage > 0:
            alert = (
                f"You may fall short by ₹{int(shortage)} next month. "
                f"Reduce spending by ₹{int(shortage * 0.30)}."
            )
        else:
            alert = "No risk detected. You're stable!"

        result = {
            "cashflowScore": int(score),
            "shortageAmount": int(shortage) if shortage > 0 else 0,
            "next30DaysProjection": {
                "income": int(next_income),
                "expense": int(next_expense),
            },
            "alertMessage": alert,
            "updatedAt": datetime.utcnow(),
        }

        self.user_ref.collection("cashflow").document("prediction").set(result)

        return result
