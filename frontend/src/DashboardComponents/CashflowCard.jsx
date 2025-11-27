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

      <div className="mb-2">
        <span className="text-sm text-gray-600">Cashflow Score:</span>
        <span className="ml-2 font-bold text-blue-700">{data.cashflowScore}</span>
      </div>

      <p className="text-sm mt-2">
        Next income: <b>₹{projection.income}</b>
      </p>

      <p className="text-sm">
        Next expenses: <b>₹{projection.expense}</b>
      </p>

      {data.shortageAmount > 0 && (
        <p className="text-sm text-red-600 mt-2">
          Shortage expected: <b>₹{data.shortageAmount}</b>
        </p>
      )}

      {data.aiTips && data.aiTips.length > 0 && (
        <div className="mt-3">
          <div className="text-sm font-semibold text-gray-700 mb-1">AI Tips:</div>
          <ul className="list-disc ml-5 text-sm text-gray-800">
            {data.aiTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {data.updatedAt && (
        <div className="mt-3 text-xs text-gray-400">Updated: {new Date(data.updatedAt).toLocaleString()}</div>
      )}
    </div>
  );
}
