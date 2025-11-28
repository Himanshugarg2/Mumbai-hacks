import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Rocket, 
  Target, 
  Calendar, 
  Trash2, 
  Plus, 
  Sparkles, 
  X, 
  TrendingUp,
  BrainCircuit,
  CheckCircle2
} from "lucide-react";

// Utility to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Component for the Progress Bar
const ProgressBar = ({ saved, goal }) => {
  const percentage = Math.min((saved / goal) * 100, 100);
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-violet-500 to-fuchsia-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default function DreamsCard({ user }) {
  const [dreams, setDreams] = useState([]);
  const [aiPlan, setAiPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    goal_amount: "",
    saved_amount: "",
    deadline: "",
  });

  const API = "http://localhost:8000";

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([loadDreams(), loadAIPlan()]).finally(() => setLoading(false));
  }, [user]);

  const loadDreams = async () => {
    try {
      const res = await axios.get(`${API}/dreams/${user.uid}`);
      setDreams(res.data || []);
    } catch (err) {
      console.error("Failed to load dreams", err);
    }
  };

  const loadAIPlan = async () => {
    try {
      const res = await axios.get(`${API}/dreams/plan/${user.uid}`);
      setAiPlan(res.data || null);
    } catch (err) {
      console.log("AI Plan load failed", err);
    }
  };

  const saveDream = async () => {
    if (!form.title || !form.goal_amount || !form.deadline) {
      return alert("Please fill title, goal amount and deadline.");
    }

    const payload = {
      ...form,
      saved_amount: form.saved_amount || "0",
      userId: user.uid,
    };

    await axios.post(`${API}/dreams`, payload);

    setForm({ title: "", goal_amount: "", saved_amount: "", deadline: "" });
    setShowModal(false);
    setLoading(true);
    
    await loadDreams();
    // Clear AI cache and reload
    await axios.delete(`${API}/dreams/plan/${user.uid}/cache`).catch(() => {});
    await loadAIPlan();
    setLoading(false);
  };

  const deleteDream = async (id) => {
    if (!window.confirm("Delete this dream?")) return;
    setLoading(true);
    await axios.delete(`${API}/dreams/${user.uid}/${id}`);
    await loadDreams();
    await axios.delete(`${API}/dreams/plan/${user.uid}/cache`).catch(() => {});
    await loadAIPlan();
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative min-h-[400px]">
      
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
        <div>
          <div className="flex items-center gap-2 text-violet-600 mb-1 uppercase tracking-wider text-xs font-bold">
            <Rocket className="w-4 h-4" />
            <span>Vision Board</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Dreams</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="group flex items-center gap-2 bg-gray-900 hover:bg-violet-600 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span>Add Dream</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 bg-gray-50/50 min-h-[300px]">
        
        {loading && dreams.length === 0 ? (
          <div className="animate-pulse space-y-4">
             {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
             ))}
          </div>
        ) : dreams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-violet-100 p-4 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No dreams yet?</h3>
            <p className="text-gray-500 max-w-xs mt-2">Start adding your financial goals and let AI build a roadmap for you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {dreams.map((d) => {
              // Parse AI Plan safely
              let planObj = aiPlan?.aiPlan;
              if (typeof planObj === "string") {
                planObj = planObj.replace(/```json|```/g, "").trim();
                try { planObj = JSON.parse(planObj); } catch { planObj = null; }
              }
              const dreamPlan = planObj?.[d.title];

              return (
                <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Card Header */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                           {d.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Target: {d.deadline}
                        </p>
                      </div>
                      <button 
                        onClick={() => deleteDream(d.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Financial Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-gray-600">{formatCurrency(d.saved_amount)} saved</span>
                        <span className="text-gray-900">{formatCurrency(d.goal_amount)}</span>
                      </div>
                      <ProgressBar saved={d.saved_amount} goal={d.goal_amount} />
                    </div>
                  </div>

                  {/* AI Strategy Footer */}
                  {dreamPlan && (
                    <div className="bg-slate-50 border-t border-slate-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit className="w-4 h-4 text-violet-600" />
                        <span className="text-xs font-bold text-violet-900 uppercase tracking-wide">AI Blueprint</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Monthly Focus</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{dreamPlan.monthly_plan}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                           <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Daily Habit</p>
                           <p className="text-sm text-slate-700 leading-relaxed">{dreamPlan.daily_plan}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-start gap-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                        <Sparkles className="w-3 h-3 text-yellow-600 mt-1 flex-shrink-0" />
                        <p className="text-xs text-yellow-800 italic">"{dreamPlan.motivation}"</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modern Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Add New Dream</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dream Title</label>
                <input
                  type="text"
                  placeholder="e.g. Europe Trip, New Macbook"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Goal Amount</label>
                   <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder="50000"
                        className="w-full p-3 pl-7 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                        value={form.goal_amount}
                        onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Savings</label>
                   <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full p-3 pl-7 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                        value={form.saved_amount}
                        onChange={(e) => setForm({ ...form, saved_amount: e.target.value })}
                      />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Deadline</label>
                <input
                  type="date"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-600"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>

              <button
                onClick={saveDream}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-200 transition-all mt-2"
              >
                Launch Dream
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}