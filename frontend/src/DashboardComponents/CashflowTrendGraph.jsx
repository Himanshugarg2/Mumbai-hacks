import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function CashflowTrendGraph({ user }) {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    const ref = collection(db, "users", user.uid, "transactions");
    const snap = await getDocs(ref);

    let arr = [];

    snap.forEach((doc) => {
      const d = doc.data();
      const spent = Object.values(d.expenses || {}).reduce(
        (a, b) => a + Number(b || 0),
        0
      );

      arr.push({
        date: d.date || "Unknown",
        spent,
      });
    });

    arr.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
    setSeries(arr);
  }

  return (
    <div className="p-5 bg-white rounded-xl shadow border">
      <h3 className="font-semibold mb-2">Cashflow Trend</h3>

      <div style={{ width: "100%", height: 260 }}>
        {series.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
