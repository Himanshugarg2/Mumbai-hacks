import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { 
  Target, 
  Zap, 
  Calendar, 
  Briefcase, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Layers
} from "lucide-react";

// Utility for formatting currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Shimmer loading state
const SkeletonLoader = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-40 bg-gray-100 rounded-xl"></div>
      <div className="h-40 bg-gray-100 rounded-xl"></div>
    </div>
  </div>
);

export default function QuickSnapshotCard({ profile, user }) {
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    daysLogged: 0,
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const load = async () => {
      try {
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

          if (isNaN(d.getTime())) return;

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
      } catch (err) {
        console.error("Snapshot Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (loading) return <SkeletonLoader />;

  // Onboarding Data
  const onboardingIncome = Number(profile?.monthlyIncome) || 0;
  const onboardingExpense = Number(profile?.monthlyExpense) || 0;
  const onboardingSavings = onboardingIncome - onboardingExpense;

  // Progress Calculation (Just for visual flair on days logged)
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const progressPercent = Math.min((live.daysLogged / daysInMonth) * 100, 100);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">Monthly Snapshot</h2>
        </div>
        <p className="text-sm text-gray-500 ml-7">Plan vs. Reality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: The Plan (Onboarding) */}
        <div className="p-6 bg-slate-50 border-r border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-6 uppercase tracking-wider text-xs font-bold">
            <Target className="w-4 h-4" />
            <span>Target / Estimates</span>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs text-slate-400 mb-1">Target Income</p>
              <p className="text-lg font-bold text-slate-700">{formatCurrency(onboardingIncome)}</p>
            </div>
            
            <div>
              <p className="text-xs text-slate-400 mb-1">Target Expense</p>
              <p className="text-lg font-bold text-slate-700">{formatCurrency(onboardingExpense)}</p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Target Savings</p>
                  <p className="text-base font-bold text-emerald-600">
                    {formatCurrency(onboardingSavings)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end text-xs text-slate-400">
                    <Briefcase className="w-3 h-3" /> Gig Type
                  </div>
                  <span className="inline-block mt-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600">
                    {profile?.gigType || "Unspecified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Reality (Live) */}
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-indigo-600 uppercase tracking-wider text-xs font-bold">
              <Zap className="w-4 h-4" />
              <span>Live Actuals</span>
            </div>
            {/* Days Logged Badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              <Calendar className="w-3 h-3" />
              {live.daysLogged} Days Logged
            </div>
          </div>

          <div className="space-y-4">
            {/* Live Income */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-emerald-800 font-medium">Income</p>
                  <p className="text-lg font-bold text-emerald-900">{formatCurrency(live.income)}</p>
                </div>
              </div>
            </div>

            {/* Live Expenses */}
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-rose-800 font-medium">Expense</p>
                  <p className="text-lg font-bold text-rose-900">{formatCurrency(live.expenses)}</p>
                </div>
              </div>
            </div>

            {/* Current Balance */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Net Balance
                </span>
                <span className={`font-bold text-lg ${live.balance >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                  {formatCurrency(live.balance)}
                </span>
              </div>
              {/* Subtle Progress Bar for Month */}
              <div className="w-full bg-gray-100 rounded-full h-1 mt-3">
                <div 
                  className="bg-indigo-500 h-1 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 text-right mt-1">Month Progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}