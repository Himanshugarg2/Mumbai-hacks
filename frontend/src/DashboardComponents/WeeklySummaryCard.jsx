import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { 
  TrendingUp, 
  Calendar, 
  Trophy, 
  Clock, 
  Wallet, 
  ArrowRight,
  BarChart3
} from "lucide-react";

// Utility to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Utility to format date (e.g., "Mon, 24 Oct")
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
};

export default function WeeklySummaryCard({ user }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const loadWeeklySummary = async () => {
      try {
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
          const dateKey = docSnap.id;
          const logDate = new Date(dateKey);
          
          if (isNaN(logDate.getTime())) return;
          if (logDate < startDate) return; // Only last 7 days

          const income = Number(data.income || 0);
          const hours = Number(data.hoursWorked || 0);
          const expenses = Object.values(data.expenses || {}).reduce(
            (sum, v) => sum + (Number(v) || 0), 0
          );

          totalIncome += income;
          totalExpenses += expenses;
          totalHours += hours;

          if (income > bestDayIncome) {
            bestDayIncome = income;
            bestDay = dateKey;
          }

          daily.push({
            date: dateKey,
            income,
            expenses,
            profit: income - expenses
          });
        });

        // Sort: Newest first for the list usually looks better, but Chronological is good for "Summary"
        daily.sort((a, b) => new Date(b.date) - new Date(a.date));

        const efficiency = totalHours > 0 ? Number((totalIncome / totalHours).toFixed(0)) : 0;

        setSummary({
          totalIncome,
          totalExpenses,
          netProfit: totalIncome - totalExpenses,
          bestDay: bestDay,
          bestDayIncome,
          efficiencyPerHour: efficiency,
          totalHours,
          daily,
        });
      } catch (err) {
        console.error("Error loading summary", err);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklySummary();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 h-full flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
      
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Weekly Performance</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.netProfit)}
            </h2>
            <p className="text-sm text-gray-500">Net profit this week</p>
          </div>
          
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
             <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Income Stat */}
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Total Revenue
            </p>
            <p className="font-bold text-emerald-900">{formatCurrency(summary.totalIncome)}</p>
          </div>
          
          {/* Expense Stat */}
          <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
            <p className="text-[10px] text-rose-600 font-bold uppercase mb-1 flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Expenses
            </p>
            <p className="font-bold text-rose-900">{formatCurrency(summary.totalExpenses)}</p>
          </div>

          {/* Efficiency Stat */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-[10px] text-blue-600 font-bold uppercase mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Hourly Rate
            </p>
            <p className="font-bold text-blue-900">
              {summary.efficiencyPerHour > 0 ? `₹${summary.efficiencyPerHour}/hr` : '-'}
            </p>
          </div>

          {/* Best Day Stat */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p className="text-[10px] text-amber-600 font-bold uppercase mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Best Day
            </p>
            <p className="font-bold text-amber-900 text-xs truncate">
              {summary.bestDay ? formatDate(summary.bestDay) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Breakdown List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xs font-bold text-gray-500 uppercase">Recent Activity</h3>
        </div>
        
        {summary.daily.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No activity logged this week.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {summary.daily.map((day) => (
              <div key={day.date} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700">
                    {formatDate(day.date)}
                  </span>
                  <span className={`text-sm font-bold ${day.profit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {day.profit >= 0 ? '+' : ''}{formatCurrency(day.profit)}
                  </span>
                </div>
                
                {/* Visual Bar for Income vs Expense */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 flex flex-col gap-1">
                     {/* Income Bar */}
                     <div className="flex items-center gap-2">
                        <div className="w-16 text-right text-gray-400 text-[10px]">In</div>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min((day.income / summary.bestDayIncome) * 100, 100)}%` }}></div>
                        </div>
                        <div className="w-12 text-right font-medium text-emerald-600">{formatCurrency(day.income)}</div>
                     </div>
                     
                     {/* Expense Bar */}
                     <div className="flex items-center gap-2">
                        <div className="w-16 text-right text-gray-400 text-[10px]">Out</div>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           {/* Calculate expense relative to income for scale, guarding against div by zero */}
                           <div className="h-full bg-rose-400 rounded-full" style={{ width: `${summary.bestDayIncome > 0 ? Math.min((day.expenses / summary.bestDayIncome) * 100, 100) : 0}%` }}></div>
                        </div>
                        <div className="w-12 text-right font-medium text-rose-600">{formatCurrency(day.expenses)}</div>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}