import React, { useEffect, useState } from "react";

export default function OpportunityScoutCard({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) return;

    if (!navigator.geolocation) {
      fetch(`http://localhost:8000/ai/opportunity/${user.uid}`)
        .then(r => r.json())
        .then(setData);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `http://localhost:8000/ai/opportunity/${user.uid}?lat=${latitude}&lon=${longitude}`
        );
        setData(await res.json());
      },
      async () => {
        const res = await fetch(`http://localhost:8000/ai/opportunity/${user.uid}`);
        setData(await res.json());
      },
      { timeout: 3000 }
    );
  }, [user]);

  if (!data)
    return <div className="p-4 bg-white rounded-xl shadow">Loading…</div>;

  return (
    <div className="p-5 bg-white rounded-xl shadow border">
      <h2 className="font-semibold text-lg">⚡ OpportunityScout</h2>
      <p className="mt-2 text-sm">Best time: <b>{data.bestTime}</b></p>
      <p className="text-sm">Area: <b>{data.bestArea}</b></p>
      <p className="text-sm">Boost: <b>₹{data.expectedBoost}</b></p>
      <p className="text-xs text-gray-500">Reason: {data.why}</p>
    </div>
  );
}
