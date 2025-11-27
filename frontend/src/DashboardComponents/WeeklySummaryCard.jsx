import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function WeeklySummaryCard({ user }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadWeeklySummary = async () => {
      const userId = user.uid;

      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 7);

      const transRef = collection(db, "users", userId, "transactions");
      const docsSnap = await getDocs(transRef);

      let totalIncome = 0;
      let totalExpenses = 0;
      let totalHours = 0;

      let bestDay = null;
      let bestDayIncome = 0;

      let daily = [];

      docsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const dateKey = docSnap.id; // yyyy-mm-dd

        const logDate = new Date(dateKey);
        if (isNaN(logDate)) return;

        // Only last 7 days
        if (logDate < startDate) return;

        const income = Number(data.income || 0);
        const hours = Number(data.hoursWorked || 0);
        const expenses = Object.values(data.expenses || {}).reduce(
          (sum, v) => sum + (Number(v) || 0),
          0
        );

        totalIncome += income;
        totalExpenses += expenses;
        totalHours += hours;

        if (income > bestDayIncome) {
          bestDayIncome = income;
          bestDay = dateKey;
        }

        // Add daily row
        daily.push({
          date: dateKey,
          income,
          expenses,
        });
      });

      // Sort oldest → newest
      daily.sort((a, b) => new Date(a.date) - new Date(b.date));

      const efficiency =
        totalHours > 0 ? Number((totalIncome / totalHours).toFixed(2)) : 0;

      setSummary({
        totalIncome,
        totalExpenses,
        bestDay: bestDay || "N/A",
        bestDayIncome,
        efficiencyPerHour: efficiency,
        daily, // final list
      });
    };

    loadWeeklySummary();
  }, [user]);

  // ----------------------------
  // LOADING STATE
  // ----------------------------
  if (!summary) {
    return (
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 h-full">
        <h2 className="text-lg font-semibold mb-3">Weekly Summary</h2>
        <p className="text-sm text-gray-500">Loading weekly stats…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 h-full">
      <h2 className="text-lg font-semibold mb-3">Weekly Summary</h2>

      {/* OVERALL STATS */}
      <div className="text-sm space-y-1 mb-4">
        <p>
          <span className="font-semibold">Total Income:</span> ₹
          {summary.totalIncome}
        </p>
        <p>
          <span className="font-semibold">Total Expenses:</span> ₹
          {summary.totalExpenses}
        </p>
        <p>
          <span className="font-semibold">Highest Earnings Day:</span>{" "}
          {summary.bestDay} (₹{summary.bestDayIncome})
        </p>
        <p>
          <span className="font-semibold">Efficiency:</span>{" "}
          ₹{summary.efficiencyPerHour}/hour
        </p>
      </div>

      {/* DAILY BREAKDOWN */}
      <div>
        <h3 className="text-md font-semibold mb-2">Daily Breakdown</h3>

        {summary.daily.length === 0 ? (
          <p className="text-sm text-gray-500">No logs this week.</p>
        ) : (
          <div className="space-y-2">
            {summary.daily.map((day) => (
              <div
                key={day.date}
                className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg border"
              >
                <span className="font-semibold">{day.date}</span>
                <span>
                  Income: <span className="font-semibold">₹{day.income}</span>
                </span>
                <span>
                  Expense:{" "}
                  <span className="font-semibold">₹{day.expenses}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
