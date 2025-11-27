import { useEffect, useState } from "react";

export default function OpportunityScoutCard({ user }) {
  const [opp, setOpp] = useState(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const res = await fetch(
        `http://localhost:8000/ai/opportunity/${user.uid}`
      );
      const data = await res.json();
      setOpp(data);
    };

    load();
  }, [user]);

  if (!opp)
    return (
      <div className="p-5 bg-white rounded-2xl shadow border">
        Loading opportunity scout…
      </div>
    );

  return (
    <div className="p-5 bg-white rounded-2xl shadow border">
      <h2 className="text-lg font-semibold">⚡ OpportunityScout</h2>
      <p className="mt-2 text-sm">
        Best earning window today: <b>{opp.bestTime}</b>
      </p>
      <p className="text-sm">
        Expected extra earnings: <b>₹{opp.expectedBoost}</b>
      </p>
      <p className="text-sm">
        Suggested area: <b>{opp.location}</b>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Reason: {opp.reason}
      </p>
    </div>
  );
}
