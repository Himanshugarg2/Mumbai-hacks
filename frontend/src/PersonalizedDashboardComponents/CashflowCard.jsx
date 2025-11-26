import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CashflowCard({ user, profile }) {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadPrediction = async () => {
      const snap = await getDoc(
        doc(db, "users", user.uid, "cashflow", "prediction")
      );
      if (snap.exists()) {
        setPrediction(snap.data());
      }
    };

    loadPrediction();
  }, [user]);

  if (!prediction) {
    return (
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 h-full">
        <h2 className="text-lg font-semibold mb-3">
          CASHFLOW AI — Future Income Predictor
        </h2>
        <p className="text-sm text-gray-500">
          Generating your cashflow forecast…
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 h-full">
      <h2 className="text-lg font-semibold mb-1">
        CASHFLOW AI — Future Income Predictor
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        Uses your income, expenses & gig profile to predict future cashflow.
      </p>

      <p className="text-3xl font-bold mb-1">
        {prediction.cashflowScore}/100
      </p>
      <p className="text-sm text-gray-600 mb-3">
        {prediction.alertMessage}
      </p>

      <div className="text-sm space-y-1">
        <p>
          <span className="font-semibold">Gig Type:</span>{" "}
          {profile?.gigType}
        </p>
        <p>
          <span className="font-semibold">Last Month Income:</span>{" "}
          ₹{profile?.monthlyIncome}
        </p>
        <p>
          <span className="font-semibold">Predicted Next Month Income:</span>{" "}
          ₹{prediction.next30DaysProjection.income}
        </p>
        <p>
          <span className="font-semibold">Predicted Next Month Expense:</span>{" "}
          ₹{prediction.next30DaysProjection.expense}
        </p>
        <p className="font-semibold text-red-600">
          Shortage Forecast: ₹{prediction.shortageAmount}
        </p>
      </div>
    </div>
  );
}
