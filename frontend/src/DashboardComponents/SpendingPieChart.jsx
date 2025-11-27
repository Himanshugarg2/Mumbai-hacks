import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function SpendingPieChart({ user }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    const ref = collection(db, "users", user.uid, "transactions");
    const snap = await getDocs(ref);

    let totals = {};

    snap.forEach((doc) => {
      const ex = doc.data().expenses || {};
      for (let cat in ex) {
        totals[cat] = (totals[cat] || 0) + Number(ex[cat] || 0);
      }
    });

    // Convert to chart format
    const formatted = Object.entries(totals).map(([name, value]) => ({
      name,
      value,
    }));

    setData(formatted);
  }

  if (!data.length) {
    return (
      <div className="p-5 bg-white rounded-xl shadow border">
        <h3 className="font-semibold mb-2">Spending Breakdown</h3>
        <div className="flex items-center justify-center h-40 text-gray-400">
          No expenses logged yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white rounded-xl shadow border">
      <h3 className="font-semibold mb-2">Spending Breakdown</h3>

      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Optional totals */}
      <div className="mt-3 text-sm">
        {data.map((d, i) => (
          <div key={i} className="flex justify-between">
            <span>{d.name}</span>
            <span>₹{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
