import { useEffect, useState } from "react";

export default function FinancialCoachCard({ user }) {
  const [advice, setAdvice] = useState(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const res = await fetch("http://localhost:8000/generate-advice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid }),
        });

        const data = await res.json();
        setAdvice(data.advice || "Unable to load advice right now.");
      } catch (err) {
        console.error("FinancialCoach error:", err);
        setAdvice("AI coach unavailable right now.");
      }
    };

    load();
  }, [user]);

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 h-full">
      <h2 className="text-lg font-semibold mb-3">
        📘 Financial Coach — 3 Personalized Tips
      </h2>

      {advice ? (
        <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
          {advice.split("\n").map((line, i) => (
            <p key={i}>• {line}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Generating your personalized tips…</p>
      )}
    </div>
  );
}
