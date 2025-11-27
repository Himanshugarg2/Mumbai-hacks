import React, { useState } from "react";
import { Pencil, Plus, X, Save, Loader2 } from "lucide-react";

export default function DreamModal({ dream, onClose, onSave, isSaving }) {
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