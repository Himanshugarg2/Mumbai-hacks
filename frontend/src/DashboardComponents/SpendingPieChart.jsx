import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { PieChart as PieIcon, Layers, CreditCard } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Modern Palette (Indigo, Emerald, Amber, Rose, Cyan, Violet, Slate)
const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#64748b", // Slate
];

// Utility to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-xl rounded-xl border border-gray-100 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: data.fill }}
          />
          <span className="font-bold text-gray-700">{data.name}</span>
        </div>
        <div className="text-gray-500">
          <span className="font-bold text-gray-900">{formatCurrency(data.value)}</span>
          <span className="text-xs ml-1">({data.percentage}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SpendingPieChart({ user }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSpend, setTotalSpend] = useState(0);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const ref = collection(db, "users", user.uid, "transactions");
      const snap = await getDocs(ref);

      let totals = {};
      let totalSum = 0;

      snap.forEach((doc) => {
        const ex = doc.data().expenses || {};
        for (let cat in ex) {
          const amount = Number(ex[cat] || 0);
          totals[cat] = (totals[cat] || 0) + amount;
          totalSum += amount;
        }
      });

      // Convert to chart format and add percentages
      const formatted = Object.entries(totals)
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalSum === 0 ? 0 : ((value / totalSum) * 100).toFixed(1),
        }))
        .sort((a, b) => b.value - a.value); // Sort highest spend first

      setData(formatted);
      setTotalSpend(totalSum);
    } catch (error) {
      console.error("Error loading chart data", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow border border-gray-100 h-[400px] animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="mx-auto w-48 h-48 bg-gray-200 rounded-full mb-8"></div>
        <div className="space-y-3">
           <div className="h-4 bg-gray-200 rounded w-full"></div>
           <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow border border-gray-100 h-[400px] flex flex-col items-center justify-center text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <PieIcon className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold mb-1">No Data Yet</h3>
        <p className="text-gray-500 text-sm">Log your expenses to see the breakdown.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Distribution</span>
          </div>
          <h3 className="font-bold text-xl text-gray-900">Spending Breakdown</h3>
        </div>
        <div className="text-right">
           <span className="text-[10px] text-gray-400 uppercase font-bold">Total Out</span>
           <div className="text-lg font-bold text-gray-800">{formatCurrency(totalSpend)}</div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[250px] relative">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60} // Donut style
              outerRadius={80}
              paddingAngle={5} // Gap between slices
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  // Add fill to data object for Tooltip to access
                  payload={{...entry, fill: COLORS[index % COLORS.length]}} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text (Donut Hole) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="text-center">
              <span className="text-xs text-gray-400 font-medium">Categories</span>
              <div className="text-2xl font-bold text-gray-800">{data.length}</div>
           </div>
        </div>
      </div>

      {/* Legend / List */}
      <div className="bg-gray-50 p-4 max-h-[200px] overflow-y-auto custom-scrollbar border-t border-gray-100">
        <div className="space-y-3">
          {data.map((d, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {d.name}
                  </span>
                </div>
                
                <div className="text-right">
                  <span className="block text-sm font-bold text-gray-800">
                    {formatCurrency(d.value)}
                  </span>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1 overflow-hidden">
                     <div 
                       className="h-full rounded-full" 
                       style={{ width: `${d.percentage}%`, backgroundColor: color }} 
                     />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}