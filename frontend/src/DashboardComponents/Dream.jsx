import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Link as LinkIcon, 
  Target, 
  Calendar, 
  PiggyBank, 
  X, 
  Save, 
  TrendingUp,
  Loader2
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Ensure this matches your firebase config path

// --- Helpers ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const calculateProgress = (saved, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.min(Math.round((saved / goal) * 100), 100);
};

// ================= DREAM CARD =================
export function DreamCard({ dream, onEdit, onDelete, onLink }) {
  const progress = calculateProgress(dream.saved_amount, dream.goal_amount);
  
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Card Header */}
      <div className="p-5 flex justify-between items-start bg-gradient-to-br from-white to-blue-50/30">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Target size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">{dream.title}</h3>
            <div className="flex items-center text-xs text-gray-500 gap-1 mt-1">
              <Calendar size={12} />
              <span>{dream.deadline ? new Date(dream.deadline).toLocaleDateString() : 'No Deadline'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(dream)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(dream.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-5 py-2">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Progress</span>
          <span className="font-semibold text-blue-700">{progress}%</span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="font-medium text-gray-900">{formatCurrency(dream.saved_amount)}</span>
          <span className="text-gray-400">of {formatCurrency(dream.goal_amount)}</span>
        </div>
      </div>

      {/* Linked Investment / Actions */}
      <div className="mt-auto p-5 pt-2">
        {dream.linked_investment ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">
              <TrendingUp size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Linked Investment</p>
              <p className="text-sm font-medium text-gray-900 truncate">{dream.linked_investment.name}</p>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => onLink(dream)}
            className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <LinkIcon size={16} />
            Link an Investment
          </button>
        )}
      </div>
    </div>
  );
}

// ================= DREAM MODAL =================
export function DreamModal({ dream, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(dream || {
    title: "",
    goal_amount: "",
    saved_amount: 0,
    deadline: "",
    linked_investment: null,
  });

  const updateField = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {dream ? <Pencil size={20} className="text-blue-600" /> : <Plus size={20} className="text-blue-600" />}
            {dream ? "Edit Dream" : "Create New Dream"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dream Title</label>
            <input 
              type="text" 
              placeholder="e.g. Europe Trip, New Home" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={form.title} 
              onChange={(e) => updateField("title", e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Amount (₹)</label>
              <input 
                type="number" 
                placeholder="0" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={form.goal_amount} 
                onChange={(e) => updateField("goal_amount", e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saved So Far (₹)</label>
              <input 
                type="number" 
                placeholder="0" 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                value={form.saved_amount} 
                onChange={(e) => updateField("saved_amount", e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Deadline</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={form.deadline} 
              onChange={(e) => updateField("deadline", e.target.value)} 
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(form)} 
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Dream</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= LINK INVESTMENT MODAL =================
export function LinkInvestmentModal({ dream, investments, onClose, onLink }) {
  if (!dream) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Link Investment</h2>
            <p className="text-sm text-gray-500">Select an investment to fund <strong>{dream.title}</strong></p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          {investments.length === 0 ? (
             <div className="text-center py-10 text-gray-500">
               <PiggyBank size={40} className="mx-auto mb-2 text-gray-300" />
               <p>No investments found.</p>
               <p className="text-xs">Start investing in the Investments tab first.</p>
             </div>
          ) : (
            investments.map((inv, idx) => (
              <button 
                key={idx} 
                onClick={() => onLink(dream, inv)}
                className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-blue-700">{inv.name || inv.bank || inv.scheme_name || 'Unnamed Investment'}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{inv.category || inv.type || 'Investment'}</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.min_amount || 0)}</p>
                   <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ================= MAIN DREAM COMPONENT =================
export default function DreamComponent({ userId }) {
  const [dreams, setDreams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [linkDream, setLinkDream] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  useEffect(() => {
    fetchDreams();
  }, [userId]);

  // Fetch investments from Firestore when Modal opens
  useEffect(() => {
    if (linkDream) {
      const fetchInvestments = async () => {
        try {
          // Using the same path logic as InvestmentComponent
          // Path: artifacts/{appId}/users/{userId}/investments
         const ref = collection(db, 'users', userId, 'investments');

          const snap = await getDocs(ref);
          const invList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setInvestments(invList);
        } catch (err) {
          console.error("Failed to load investments", err);
        }
      };
      fetchInvestments();
    }
  }, [linkDream, userId, appId]);

  const fetchDreams = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/dreams/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setDreams(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch dreams:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveDream = async (dream) => {
    setSaving(true);
    try {
      const method = (selected && selected.id) ? 'PUT' : 'POST';
      const url = (selected && selected.id) 
        ? `http://localhost:8000/dreams/${userId}/${selected.id}`
        : `http://localhost:8000/dreams`;
      
      const payload = { userId, ...dream };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSelected(null);
        fetchDreams();
      }
    } catch (err) {
      console.error("Failed to save dream", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteDream = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dream?")) return;
    try {
      await fetch(`http://localhost:8000/dreams/${userId}/${id}`, { method: 'DELETE' });
      fetchDreams();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const linkInvestment = async (dream, investment) => {
    try {
      await fetch(`http://localhost:8000/dreams/${userId}/${dream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linked_investment: {
            name: investment.name || investment.bank || investment.bond_name,
            min_amount: investment.min_amount || investment.min_investment,
          },
        })
      });

      setLinkDream(null);
      fetchDreams();
    } catch (err) {
      console.error("Failed to link investment", err);
    }
  };

  return (
    <div className="bg-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Goals</h2>
          <p className="text-sm text-gray-500">Track and fund your future.</p>
        </div>
        <button
          onClick={() => setSelected({})}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow active:scale-95 duration-200"
        >
          <Plus size={18} />
          <span>New Dream</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 size={32} className="animate-spin mb-3 text-blue-600" />
          <p>Loading dreams...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {dreams.length > 0 ? dreams.map((d) => (
            <DreamCard
              key={d.id}
              dream={d}
              onEdit={setSelected}
              onDelete={deleteDream}
              onLink={(dream) => setLinkDream(dream)}
            />
          )) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Target className="text-blue-500 h-8 w-8" />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">No dreams yet</h3>
              <p className="text-gray-500 text-sm mb-4">Start by adding a financial goal you want to achieve.</p>
              <button 
                onClick={() => setSelected({})}
                className="text-blue-600 font-medium hover:underline"
              >
                Create your first dream
              </button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <DreamModal
          dream={selected.title ? selected : null}
          onClose={() => setSelected(null)}
          onSave={saveDream}
          isSaving={saving}
        />
      )}

      {linkDream && (
        <LinkInvestmentModal
          dream={linkDream}
          investments={investments}
          onClose={() => setLinkDream(null)}
          onLink={linkInvestment}
        />
      )}
    </div>
  );
}