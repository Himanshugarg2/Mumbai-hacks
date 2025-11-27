
import { 
  Banknote, 
  AlertTriangle, 
  X,
  Loader2,
} from "lucide-react";



export function LoanModal({ selected, onClose, onApply, isProcessing }) {
  if (!selected) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Confirm Application</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-start gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm text-orange-600">
              <Banknote size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">You are applying for</p>
              <h3 className="text-lg font-bold text-gray-900">{selected.type}</h3>
              <p className="text-orange-700 font-medium">{selected.bank}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm border-t border-b border-gray-100 py-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Interest Rate</span>
              <span className="font-semibold text-gray-900">{selected.interest_rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Processing Fee</span>
              <span className="font-semibold text-gray-900">{selected.processing_fee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tenure</span>
              <span className="font-semibold text-gray-900">{selected.max_tenure}</span>
            </div>
          </div>
          
          <div className="flex gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <p>This will submit your interest to the bank. They will contact you for documentation.</p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(selected)}
            disabled={isProcessing}
            className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}