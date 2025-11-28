import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Activity, TrendingUp, CalendarDays, Filter } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Defs,
  LinearGradient,
  Stop
} from "recharts";

// Utility to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Custom Tooltip for the Chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-xl rounded-xl border border-gray-100 ring-1 ring-black/5">
        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-indigo-600">
          {formatCurrency(payload[0].value)}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">Daily Spend</p>
      </div>
    );
  }
  return null;
};

export default function CashflowTrendGraph({ user }) {
  const [series, setSeries] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const ref = collection(db, "users", user.uid, "transactions");
      const snap = await getDocs(ref);

      let arr = [];
      let total = 0;

      snap.forEach((doc) => {
        const d = doc.data();
        const spent = Object.values(d.expenses || {}).reduce(
          (a, b) => a + Number(b || 0),
          0
        );

        total += spent;

        // Date Parsing & Formatting
        let displayDate = doc.id;
        let rawDate = new Date(); // Default fallback

        if (d.date) {
          // Parse YYYY-MM-DD
          const [year, month, day] = d.date.split("-").map(Number);
          rawDate = new Date(year, month - 1, day);
          
          // Format to "12 Oct"
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          displayDate = `${day} ${months[month - 1]}`;
        }

        arr.push({
          date: displayDate,
          rawDate: rawDate, // We keep this for sorting
          spent,
        });
      });

      // Sort Chronologically (Oldest to Newest)
      arr.sort((a, b) => a.rawDate - b.rawDate);

      // Limit to last 7 or 14 data points if list is huge, for cleaner UI? 
      // For now, we show all.
      setSeries(arr);
      setTotalSpent(total);
    } catch (err) {
      console.error("Error loading graph data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 h-[350px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 w-full bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Spending Pulse</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalSpent)}
          </h2>
          <p className="text-sm text-gray-400 mt-1">Total expenses recorded</p>
        </div>
        
        {/* Optional Filter Icon (Visual only) */}
        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
          <Filter className="w-4 h-4" />
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-[250px]">
        {series.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <CalendarDays className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">No transactions logged yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                dy={10}
                interval="preserveStartEnd"
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(value) => `₹${value}`}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              <Area 
                type="monotone" 
                dataKey="spent" 
                stroke="#4f46e5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSpent)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}