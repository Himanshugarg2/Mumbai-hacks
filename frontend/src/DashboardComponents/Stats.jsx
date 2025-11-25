import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  CreditCard,
  PieChart
} from "lucide-react";

export default function Stats({ income, expense }) {
  const monthlyIncome = Number(income) || 0;
  const monthlyExpense = Number(expense) || 0;
  
  const dailyIncome = Math.round(monthlyIncome / 30);
  const dailyExpense = Math.round(monthlyExpense / 30);
  const balance = monthlyIncome - monthlyExpense;
  
  // Calculate savings percentage
  const savingsRate = monthlyIncome > 0 
    ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) 
    : 0;

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Balance Card - Spans full width on mobile, 3 cols on desktop */}
      <div className="md:col-span-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        {/* Decorative Background Icon */}
        <div className="absolute -right-6 -top-6 text-white opacity-10 transform rotate-12">
          <Wallet size={150} />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-100 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <CreditCard size={16} />
              </div>
              <span className="font-medium text-sm tracking-wide">NET BALANCE</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
              {formatCurrency(balance)}
            </h2>
            <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md">
              <PieChart size={14} />
              <span>
                {savingsRate > 0 
                  ? `You save ${savingsRate}% of your income` 
                  : 'Expenses exceed income'}
              </span>
            </div>
          </div>
          
          {/* Daily Breakdown Mini-Card */}
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10 w-full sm:w-auto min-w-[200px]">
             <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                   <Calendar size={14} />
                   <span>Daily Limit</span>
                </div>
                <span className="font-semibold">{formatCurrency(dailyIncome)}</span>
             </div>
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                   <TrendingDown size={14} />
                   <span>Avg Spend</span>
                </div>
                <span className="font-semibold text-white">{formatCurrency(dailyExpense)}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Income Stat */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <TrendingUp size={28} />
        </div>
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Monthly Income</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyIncome)}</p>
        </div>
      </div>

      {/* Expense Stat */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <TrendingDown size={28} />
        </div>
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Monthly Expenses</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyExpense)}</p>
        </div>
      </div>

      {/* Daily Safe-to-Spend */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Calendar size={28} />
        </div>
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">Daily Budget</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(dailyExpense)}</p>
        </div>
      </div>
    </div>
  );
}