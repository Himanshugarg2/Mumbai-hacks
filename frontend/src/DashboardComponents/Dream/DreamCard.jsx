import React from "react";
import { Pencil, Trash2, Link as LinkIcon, Target, Calendar, PiggyBank, TrendingUp } from "lucide-react";
import { formatCurrency, calculateProgress } from "./helpers";


export  default function DreamCard({ dream, onEdit, onDelete, onLink }) {
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