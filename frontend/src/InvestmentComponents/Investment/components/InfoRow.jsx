import React from "react";

export default function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-500 text-xs">{label}</span>
      <span
        className={`text-sm font-medium ${
          highlight ? "text-blue-700" : "text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
