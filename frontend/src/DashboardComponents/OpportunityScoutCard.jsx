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
      <p className="text-sm">Advice: <b>{data.aiAdvice}</b></p>
      <p className="text-sm">Action: <b>{data.action}</b></p>
      <p className="text-sm">Confidence: <b>{data.confidence}</b></p>
      <p className="text-xs text-gray-500">Reason: {data.why}</p>
      {data.weather && (
        <p className="text-xs text-gray-500">Weather: {data.weather.condition} ({data.weather.temp}°C)</p>
      )}
      {data.traffic && (
        <p className="text-xs text-gray-500">Traffic: {data.traffic}</p>
      )}
      {data.finalHourlyUsed && (
        <p className="text-xs text-gray-500">Hourly Used: ₹{data.finalHourlyUsed}</p>
      )}
      {data.surgeScore !== undefined && (
        <p className="text-xs text-gray-500">Surge Score: {data.surgeScore}</p>
      )}
      {Array.isArray(data.reasons) && data.reasons.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-semibold text-gray-700 mb-1">Reasons:</div>
          <ul className="list-disc ml-5 text-xs text-gray-800">
            {data.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
