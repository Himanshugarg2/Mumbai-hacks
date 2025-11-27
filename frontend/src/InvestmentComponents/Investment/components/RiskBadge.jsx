import React from "react";

export default function RiskBadge({ level }) {
  const colors = {
    low: "bg-green-100 text-green-700",
    safe: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    "very high": "bg-red-100 text-red-700",
  };

  const normalized = level ? level.toLowerCase() : "unknown";
  const colorClass = colors[normalized] || "bg-gray-100 text-gray-600";

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${colorClass}`}
    >
      {level || "Unknown"}
    </span>
  );
}
