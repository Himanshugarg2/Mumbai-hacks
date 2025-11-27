import React, { useEffect, useState } from "react";

export default function CashflowCard({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8000/cashflow/predict/${user.uid}`)
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error("Cashflow API error:", err));
  }, [user]);

  if (!data || !data.next30DaysProjection) {
    return <div className="p-4 bg-white rounded-xl shadow">Loading…</div>;
  }

  const projection = data.next30DaysProjection;

  return (
    <div className="p-5 bg-white rounded-xl shadow border">
      <h2 className="font-semibold text-lg">📈 Cashflow Predictor</h2>

      <p className="text-sm mt-2">
        Next income: <b>₹{projection.income}</b>
      </p>

      <p className="text-sm">
        Next expenses: <b>₹{projection.expense}</b>
      </p>

      {data.alertMessage && (
        <p className="text-red-500 mt-2">{data.alertMessage}</p>
      )}
    </div>
  );
}
