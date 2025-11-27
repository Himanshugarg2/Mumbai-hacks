// ================= LINK INVESTMENT MODAL =================
import { X } from "lucide-react";
import { PiggyBank } from "lucide-react";
import { formatCurrency } from "./helpers";


export  default function LinkInvestmentModal({ dream, investments, onClose, onLink }) {
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