import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  Clock 
} from "lucide-react";

// Utility to format currency nicely (e.g., ₹12,000)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// A nice shimmer loading effect
const SkeletonLoader = () => (
  <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="flex gap-4 mb-6">
      <div className="h-20 bg-gray-100 rounded-xl w-1/2"></div>
      <div className="h-20 bg-gray-100 rounded-xl w-1/2"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export default function CashflowCard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:8000/cashflow/predict/${user.uid}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Cashflow API error:", err);
        setLoading(false);
      });
  }, [user]);

  if (loading || !data || !data.next30DaysProjection) {
    return <SkeletonLoader />;
  }

  const { income, expense } = data.next30DaysProjection;
  const hasShortage = data.shortageAmount > 0;

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl">
      {/* Decorative top gradient line */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${hasShortage ? 'bg-red-500' : 'bg-emerald-500'}`} />

      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>AI Predictor</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-1">Cashflow Forecast</h2>
          </div>
          
          {/* Score Badge */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 mb-1">Health Score</span>
            <div className={`px-3 py-1 rounded-full text-sm font-bold border ${
              data.cashflowScore >= 70 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {data.cashflowScore} / 100
            </div>
          </div>
        </div>

        {/* Financial Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Income Card */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Projected In</span>
            </div>
            <p className="text-lg font-bold text-emerald-900">
              {formatCurrency(income)}
            </p>
          </div>

          {/* Expense Card */}
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Projected Out</span>
            </div>
            <p className="text-lg font-bold text-rose-900">
              {formatCurrency(expense)}
            </p>
          </div>
        </div>

        {/* Shortage Alert */}
        {hasShortage && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Cashflow Shortage Alert</p>
              <p className="text-sm text-red-600 mt-1">
                You are projected to be short by <span className="font-bold">{formatCurrency(data.shortageAmount)}</span> this month.
              </p>
            </div>
          </div>
        )}

        {/* AI Tips Section */}
        {data.aiTips && data.aiTips.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-bold text-slate-700">Smart Insights</h3>
            </div>
            <ul className="space-y-2">
              {data.aiTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-violet-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      {data.updatedAt && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-1.5">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">
            Updated {new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
}