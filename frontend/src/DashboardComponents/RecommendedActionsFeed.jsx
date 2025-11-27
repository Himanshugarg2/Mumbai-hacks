import React from "react";

export default function RecommendedActionsFeed({ aiTips = [], tip, aiAdvice }) {
  const items = [];

  if (Array.isArray(aiTips) && aiTips.length > 0) {
    items.push(...aiTips.map(t => ({ source: "Cashflow", text: t })));
  }
  if (tip) {
    items.push({ source: "SmartSpend", text: tip });
  }
  if (aiAdvice) {
    items.push({ source: "Opportunity", text: aiAdvice });
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5 border">
      <h3 className="font-semibold mb-3">Recommended Actions</h3>
      <div className="space-y-2">
        {items.length === 0 && <div className="text-sm text-gray-500">No recommendations yet.</div>}
        {items.map((it, idx) => (
          <div key={idx} className="p-2 border rounded bg-gray-50">
            <div className="text-xs text-gray-500">{it.source}</div>
            <div className="text-sm">{it.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
