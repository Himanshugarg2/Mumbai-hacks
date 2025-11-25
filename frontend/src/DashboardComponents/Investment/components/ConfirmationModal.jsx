export const ConfirmationModal = ({ investment, type, onClose, onConfirm, isProcessing, amount, setAmount }) => {
  if (!investment) return null;

  const title = investment.name || investment.scheme_name || investment.bond_name || investment.scheme;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">

        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Confirm Investment</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">You are investing in</p>
              <p className="font-bold text-gray-900">{title}</p>
            </div>
          </div>

          <div className="space-y-3 py-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Minimum Amount</span>
              <span className="font-medium">₹ {investment.min_amount}</span>
            </div>

            {/* 📌 NEW INPUT FIELD */}
            <div>
              <label className="text-gray-700 text-sm font-medium">Enter Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="Enter amount"
                min={investment.min_amount}
              />
            </div>
          </div>

          <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg flex gap-2 items-start">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>Please review documents before investing.</p>
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
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Invest'}
          </button>
        </div>
      </div>
    </div>
  );
};