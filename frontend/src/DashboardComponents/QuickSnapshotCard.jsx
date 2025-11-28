import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function QuickSnapshotCard({ profile, user }) {
  const [live, setLive] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    daysLogged: 0,
  });

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const userId = user.uid;
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const transRef = collection(db, "users", userId, "transactions");
      const docsSnap = await getDocs(transRef);

      let totalIncome = 0;
      let totalExpenses = 0;
      let daysLogged = 0;

      docsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const dateKey = docSnap.id; // YYYY-MM-DD

        const [year, month, day] = dateKey.split("-").map(Number);
        const d = new Date(year, month - 1, day);

        if (isNaN(d)) return;

        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          daysLogged++;

          const income = Number(data.income) || 0;
          const expenses = Object.values(data.expenses || {}).reduce(
            (sum, val) => sum + (Number(val) || 0),
            0
          );

          totalIncome += income;
          totalExpenses += expenses;
        }
      });

      setLive({
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        daysLogged,
      });
    };

    load();
  }, [user]);

  const onboardingIncome = Number(profile?.monthlyIncome) || 0;
  const onboardingExpense = Number(profile?.monthlyExpense) || 0;
  const onboardingSavings = onboardingIncome - onboardingExpense;

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
      <h2 className="text-lg font-semibold mb-4">Quick Snapshot</h2>

      {/* Onboarding Section */}
      <h3 className="text-sm font-bold text-gray-600 mb-2">
        Onboarding Estimates
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-500">Monthly Income (Estimated)</p>
          <p className="text-xl font-bold">₹{onboardingIncome}</p>
        </div>
        <div>
          <p className="text-gray-500">Monthly Expenses (Estimated)</p>
          <p className="text-xl font-bold">₹{onboardingExpense}</p>
        </div>
        <div>
          <p className="text-gray-500">Savings (Estimated)</p>
          <p className="text-xl font-bold">₹{onboardingSavings}</p>
        </div>
        <div>
          <p className="text-gray-500">Gig Type</p>
          <p className="text-base font-semibold">{profile?.gigType}</p>
        </div>
      </div>

      <hr className="my-3" />

      {/* Live Section */}
      <h3 className="text-sm font-bold text-gray-600 mb-2">
        Current (This Month)
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Days Logged</p>
          <p className="text-xl font-bold">{live.daysLogged}</p>
        </div>
        <div>
          <p className="text-gray-500">Actual Income</p>
          <p className="text-xl font-bold">₹{live.income}</p>
        </div>
        <div>
          <p className="text-gray-500">Actual Expenses</p>
          <p className="text-xl font-bold">₹{live.expenses}</p>
        </div>
        <div>
          <p className="text-gray-500">Current Balance</p>
          <p className="text-xl font-bold">₹{live.balance}</p>
        </div>
      </div>
    </div>
  );
}
