import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { db } from "../firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  Calendar as CalendarIcon, 
  Edit3, 
  Save, 
  Briefcase, 
  Clock, 
  Banknote, 
  Fuel, 
  Coffee, 
  Tag, 
  Receipt
} from "lucide-react";

// --------------------------
// 1. UTILITY FUNCTIONS
// --------------------------

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// --------------------------
// 2. INPUT COMPONENT (Must be outside TodayLogCard)
// --------------------------

const InputGroup = ({ label, icon: Icon, value, onChange, type = "text", placeholder, inputMode }) => (
  <div className="mb-3">
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type={type}
        inputMode={inputMode} // Added for better mobile keyboard support
        value={value === undefined || value === null ? "" : value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-gray-800"
      />
    </div>
  </div>
);

// --------------------------
// 3. MAIN COMPONENT
// --------------------------

export default function TodayLogCard({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [log, setLog] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const dateKey = selectedDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const emptyLog = {
    income: "",
    hoursWorked: "",
    platform: "",
    expenses: {
      food: "",
      fuel: "",
      misc: "",
    },
    notes: "",
  };

  const [form, setForm] = useState(emptyLog);

  // Load Data
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const load = async () => {
      try {
        const snap = await getDoc(
          doc(db, "users", user.uid, "transactions", dateKey)
        );

        if (snap.exists()) {
          setLog(snap.data());
          setForm({ ...emptyLog, ...snap.data() });
        } else {
          setLog(null);
          setForm(emptyLog);
        }
      } catch (err) {
        console.error("Error loading log:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, dateKey]);

  // Save Data
  const saveLog = async () => {
    setLoading(true);
    // Convert inputs to numbers only when saving
    const cleaned = {
      ...form,
      income: form.income === "" ? 0 : Number(form.income),
      hoursWorked: form.hoursWorked === "" ? 0 : Number(form.hoursWorked),
      expenses: {
        fuel: form.expenses.fuel === "" ? 0 : Number(form.expenses.fuel),
        food: form.expenses.food === "" ? 0 : Number(form.expenses.food),
        misc: form.expenses.misc === "" ? 0 : Number(form.expenses.misc),
      }
    };
    
    try {
      await setDoc(
        doc(db, "users", user.uid, "transactions", dateKey),
        cleaned,
        { merge: true }
      );
      setLog(cleaned);
      setEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper Calculations
  const calculateTotalExpenses = (expensesObj) => {
    return Object.values(expensesObj || {}).reduce(
      (sum, v) => sum + (Number(v) || 0), 0
    );
  };

  const currentTotalExpenses = calculateTotalExpenses(form.expenses);
  const netProfit = (Number(form.income) || 0) - currentTotalExpenses;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full relative">
      
      {/* --- HEADER --- */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-20 relative">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
             <Receipt className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-sm font-bold text-gray-900">Daily Ledger</h2>
             <p className="text-xs text-gray-400">Track earnings & spend</p>
           </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
          >
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </button>
          
          {showCalendar && (
            <div className="absolute right-0 top-12 z-50 bg-white p-2 rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setShowCalendar(false);
                  setEditing(false);
                }}
                maxDate={new Date()}
                inline
              />
            </div>
          )}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar bg-white">
        
        {loading ? (
          <div className="flex items-center justify-center h-40 animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        ) : !editing ? (
          
          /* VIEW MODE */
          <>
            {log ? (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Net Earnings</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {formatCurrency((Number(log.income) || 0) - calculateTotalExpenses(log.expenses))}
                      </h3>
                    </div>
                    <div className="bg-white/10 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                      {log.hoursWorked ? `${log.hoursWorked} hrs` : '0 hrs'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                      <div>
                        <p className="text-emerald-400 text-xs font-bold uppercase mb-1">Income</p>
                        <p className="font-semibold">{formatCurrency(log.income)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-rose-400 text-xs font-bold uppercase mb-1">Expenses</p>
                        <p className="font-semibold">{formatCurrency(calculateTotalExpenses(log.expenses))}</p>
                      </div>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-3">
                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                     <div className="flex items-center gap-3">
                       <Briefcase className="w-4 h-4 text-gray-400" />
                       <span className="text-sm font-medium text-gray-600">Platform</span>
                     </div>
                     <span className="text-sm font-bold text-gray-900">{log.platform || "Not specified"}</span>
                   </div>

                   {/* Expenses Breakdown */}
                   {(Number(log.expenses?.fuel) > 0 || Number(log.expenses?.food) > 0 || Number(log.expenses?.misc) > 0) && (
                     <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                       <p className="text-xs font-bold text-gray-400 uppercase mb-2">Expense Breakdown</p>
                       <div className="space-y-2">
                         {Number(log.expenses?.fuel) > 0 && (
                           <div className="flex justify-between text-sm">
                             <span className="flex items-center gap-2 text-gray-600"><Fuel className="w-3 h-3"/> Fuel</span>
                             <span className="font-medium">₹{log.expenses.fuel}</span>
                           </div>
                         )}
                         {Number(log.expenses?.food) > 0 && (
                           <div className="flex justify-between text-sm">
                             <span className="flex items-center gap-2 text-gray-600"><Coffee className="w-3 h-3"/> Food</span>
                             <span className="font-medium">₹{log.expenses.food}</span>
                           </div>
                         )}
                         {Number(log.expenses?.misc) > 0 && (
                           <div className="flex justify-between text-sm">
                             <span className="flex items-center gap-2 text-gray-600"><Tag className="w-3 h-3"/> Misc</span>
                             <span className="font-medium">₹{log.expenses.misc}</span>
                           </div>
                         )}
                       </div>
                     </div>
                   )}

                   {log.notes && (
                     <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-yellow-800 italic">
                       "{log.notes}"
                     </div>
                   )}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full py-10 text-center opacity-75">
                <div className="bg-gray-100 p-4 rounded-full mb-3">
                   <Edit3 className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-700">No logs for today</h3>
                <p className="text-sm text-gray-500 max-w-[200px]">Track your gig work to see analytics.</p>
              </div>
            )}
          </>
        ) : (
          
          /* EDIT MODE */
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Main Inputs */}
            <div className="space-y-1">
              {/* INCOME INPUT */}
              <InputGroup 
                label="Total Income" 
                icon={Banknote} 
                type="text"
                inputMode="numeric"
                value={form.income}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow empty or numbers only
                  if (val === "" || /^\d+$/.test(val)) {
                    setForm({ ...form, income: val });
                  }
                }}
                placeholder="0"
              />

              <div className="grid grid-cols-2 gap-4">
                {/* HOURS INPUT - FIXED */}
                <InputGroup 
                  label="Hours" 
                  icon={Clock} 
                  type="text" // Use text to allow typing freely
                  inputMode="decimal" // Shows decimal keyboard on mobile
                  value={form.hoursWorked} 
                  onChange={(e) => {
                    const val = e.target.value;
                    // Regex: Allow empty, numbers, and one decimal point (e.g., 5.5)
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setForm({ ...form, hoursWorked: val });
                    }
                  }}
                  placeholder="0"
                />
                
                <InputGroup 
                  label="Platform" 
                  icon={Briefcase} 
                  type="text"
                  value={form.platform} 
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  placeholder="e.g. Swiggy"
                />
              </div>
            </div>

            {/* Expenses Section */}
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
               <div className="flex justify-between items-center mb-3">
                 <h4 className="text-xs font-bold text-gray-500 uppercase">Daily Expenses</h4>
                 <span className="text-xs font-bold text-rose-500">Total: {formatCurrency(currentTotalExpenses)}</span>
               </div>
               
               <div className="grid grid-cols-3 gap-2">
                 <div>
                   <label className="text-[10px] text-gray-400 font-bold mb-1 block">Fuel</label>
                   <input 
                     type="number" 
                     className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all"
                     placeholder="₹0"
                     value={form.expenses.fuel}
                     onChange={(e) => setForm({...form, expenses: {...form.expenses, fuel: e.target.value}})}
                   />
                 </div>
                 <div>
                   <label className="text-[10px] text-gray-400 font-bold mb-1 block">Food</label>
                   <input 
                     type="number" 
                     className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all"
                     placeholder="₹0"
                     value={form.expenses.food}
                     onChange={(e) => setForm({...form, expenses: {...form.expenses, food: e.target.value}})}
                   />
                 </div>
                 <div>
                   <label className="text-[10px] text-gray-400 font-bold mb-1 block">Misc</label>
                   <input 
                     type="number" 
                     className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all"
                     placeholder="₹0"
                     value={form.expenses.misc}
                     onChange={(e) => setForm({...form, expenses: {...form.expenses, misc: e.target.value}})}
                   />
                 </div>
               </div>
            </div>

            <InputGroup 
              label="Notes" 
              icon={Tag} 
              type="text"
              value={form.notes} 
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any details..."
            />
            
            {/* Real-time Net Profit Preview */}
            <div className="flex justify-between items-center px-2 py-1">
               <span className="text-xs text-gray-400 font-medium">Projected Net Profit:</span>
               <span className={`text-sm font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                 {formatCurrency(netProfit)}
               </span>
            </div>
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <div className="p-5 border-t border-gray-100 bg-gray-50 z-10">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            {log ? "Edit Log" : "Add Entry"}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveLog}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}