import { useEffect, useState } from "react";

export default function SmartSpendCard({ user }) {
  const [tip, setTip] = useState(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/ai/smart-spend/${user.uid}`
        );
        const data = await res.json();
        setTip(data.tip || "Spending insights will appear here soon.");
      } catch (err) {
        console.error("SmartSpend error:", err);
        setTip("Unable to fetch advice right now.");
      }
    };

    load();
  }, [user]);

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 h-full">
      <h2 className="text-lg font-semibold mb-3">
        TODAY'S AI TIP — SmartSpend Guardian
      </h2>
      <p className="text-sm text-gray-700 leading-relaxed">
        {tip || "Loading your personalized tip…"}
      </p>
    </div>
  );
}
