import React, { useEffect, useState } from "react";

export default function SmartSpendGuardianCard({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:8000/ai/smart-guardian/${user.uid}`)
      .then(r => r.json())
      .then(setData);
  }, [user]);

  if (!data)
    return <div className="p-4 bg-white rounded-xl shadow">Loading…</div>;

  return (
    <div className="p-5 bg-white rounded-xl shadow border">
      <h2 className="font-semibold text-lg">🔍 SmartSpend Guardian</h2>
      <p className="text-sm mt-2">
        Today's spend: <b>₹{data.todaySpent}</b>
      </p>
      <p className="text-sm">
        Safe limit: <b>₹{data.safeDailyLimit}</b>
      </p>
      <p className="text-sm mt-2 text-blue-600">
        {data.tip}
      </p>
    </div>
  );
}
