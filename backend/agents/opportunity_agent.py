from datetime import datetime
import os
import firebase_admin
from firebase_admin import credentials, firestore

# -----------------------------------------
# Firestore Initialization (Fixes ADC Error)
# -----------------------------------------

# Build absolute path to firebase-key.json
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(BASE_DIR, "..", "firebase-key.json")

# Initialize Firebase once
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()


# -----------------------------------------
# Opportunity Scout Agent Logic
# -----------------------------------------
class OpportunityScoutService:
    def __init__(self, userId):
        self.userId = userId
        self.userRef = db.collection("users").document(userId)

    def get_logs(self):
        """Fetch user transaction logs from Firestore"""
        logs = self.userRef.collection("transactions").stream()
        return [d.to_dict() for d in logs]

    def infer_best_hours(self, logs):
        """Calculate average hourly income from logs and return best slot."""
        if not logs:
            return "7–10 PM", 150

        total_income = 0
        total_hours = 0

        for l in logs:
            total_income += int(l.get("income", 0))
            total_hours += int(l.get("hoursWorked", 0))

        avg_hourly = total_income / total_hours if total_hours > 0 else 150
        return "7–10 PM", avg_hourly

    def predict(self):
        """Predict best time slot along with expected income boost."""
        logs = self.get_logs()
        best_slot, avgHourly = self.infer_best_hours(logs)

        # Hackathon simulation values
        weather = "rain"
        weekend = datetime.today().weekday() >= 5

        surge = 1.0
        reasons = []

        if weather == "rain":
            surge += 0.3
            reasons.append("Rain surge")

        if weekend:
            surge += 0.2
            reasons.append("Weekend demand")

        expectedBoost = int(avgHourly * (surge - 1) * 3)

        return {
            "bestTime": best_slot,
            "expectedBoost": expectedBoost,
            "location": "Powai",
            "reason": ", ".join(reasons) if reasons else "Normal conditions",
        }
