import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Wallet, 
  AlertTriangle, 
  TrendingUp, 
  PieChart,
  Info
} from "lucide-react";

// Utility to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Shimmer Loader
const SkeletonLoader = () => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse h-[350px]">
    <div className="flex justify-between mb-8">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-2 bg-gray-200 rounded w-2/3 mb-8"></div>
    <div className="grid grid-cols-3 gap-4 mb-6">
       <div className="h-16 bg-gray-100 rounded-xl"></div>
       <div className="h-16 bg-gray-100 rounded-xl"></div>
       <div className="h-16 bg-gray-100 rounded-xl"></div>
    </div>
  </div>
);

export default function SmartSpendGuardianCard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`http://localhost:8000/ai/smart-guardian/${user.uid}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("SmartSpend API error:", err);
        setLoading(false);
      });
  }, [user]);

  if (loading || !data) return <SkeletonLoader />;

  // Logic to determine status colors
  const todaySpent = Number(data.todaySpent || 0);
  const safeLimit = Number(data.safeDailyLimit || 1); // Avoid div by zero
  const percentageUsed = Math.min((todaySpent / safeLimit) * 100, 100);
  const isOverLimit = todaySpent > safeLimit;

  // Dynamic Styles
  const statusColor = isOverLimit ? "text-red-600" : "text-emerald-600";
  const progressColor = isOverLimit ? "bg-red-500" : "bg-emerald-500";
  const bgBadge = isOverLimit ? "bg-red-50" : "bg-emerald-50";

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
      
      {/* Header */}
      <div className="p-6 pb-2 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Wallet className="w-3 h-3" />
            <span>Daily Guardian</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {isOverLimit ? "Limit Exceeded" : "Within Safe Limit"}
          </h2>
        </div>
        <div className={`p-2 rounded-full ${bgBadge}`}>
          {isOverLimit ? (
            <ShieldAlert className="w-6 h-6 text-red-500" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          )}
        </div>
      </div>

      <div className="px-6 py-2">
        {/* Main Progress Gauge */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className={`text-3xl font-extrabold ${statusColor}`}>
                {formatCurrency(todaySpent)}
              </span>
              <span className="text-sm text-gray-400 font-medium ml-1">
                 / {formatCurrency(safeLimit)}
              </span>
            </div>
            <span className="text-xs font-bold text-gray-400">
              {percentageUsed.toFixed(0)}% Used
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${progressColor}`} 
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Monthly Proj.</p>
            <p className="text-sm font-bold text-slate-700">{formatCurrency(data.projectedMonthly)}</p>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Daily Avg</p>
            <p className="text-sm font-bold text-slate-700">{formatCurrency(data.avgDailySpend)}</p>
          </div>

          <div className={`p-3 rounded-xl border text-center ${data.expectedOvershoot > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-[10px] uppercase font-bold mb-1 ${data.expectedOvershoot > 0 ? 'text-red-500' : 'text-gray-500'}`}>
              Overshoot
            </p>
            <p className={`text-sm font-bold ${data.expectedOvershoot > 0 ? 'text-red-700' : 'text-slate-700'}`}>
              {data.expectedOvershoot > 0 ? `+${formatCurrency(data.expectedOvershoot)}` : "-"}
            </p>
          </div>
        </div>

        {/* Today's Breakdown */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
             <PieChart className="w-4 h-4 text-gray-400" />
             <h3 className="text-sm font-bold text-gray-700">Today's Breakdown</h3>
          </div>
          
          <div className="space-y-2">
            {data.expensesToday && Object.entries(data.expensesToday).length > 0 ? (
              Object.entries(data.expensesToday).map(([cat, amt]) => {
                const isRisky = data.categoryRisk === cat;
                return (
                  <div key={cat} className={`flex justify-between items-center p-2 rounded-lg text-sm ${isRisky ? 'bg-amber-50 border border-amber-100' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                       {isRisky && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                       <span className={isRisky ? "font-bold text-amber-800" : "text-gray-600"}>{cat}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(amt)}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-400 italic pl-1">No spending recorded today.</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Tip */}
      {data.tip && (
        <div className="bg-blue-50 border-t border-blue-100 p-4 flex items-start gap-3">
           <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
           <p className="text-sm text-blue-800 leading-relaxed">
             <span className="font-bold block text-xs uppercase mb-1 opacity-75">AI Recommendation</span>
             {data.tip}
           </p>
        </div>
      )}
    </div>
  );
}