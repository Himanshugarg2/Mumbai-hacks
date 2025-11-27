import { 
  Building2, 
  Percent, 
  CalendarClock, 
  FileCheck, 
  Info, 
  Wallet
} from "lucide-react";



export function LoanCard({ loan, onSelect }) {
  const riskColors = {
    low: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="p-5 flex justify-between items-start bg-gradient-to-br from-gray-50 to-white border-b border-gray-50">
        <div className="flex gap-3">
          <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{loan.type}</h3>
            <p className="text-sm text-gray-500 font-medium">{loan.bank}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${riskColors[loan.risk.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
          {loan.risk} Risk
        </span>
      </div>

      <div className="p-5 space-y-4 flex-grow">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Percent size={12}/> Interest Rate</p>
            <p className="font-semibold text-gray-900">{loan.interest_rate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><CalendarClock size={12}/> Max Tenure</p>
            <p className="font-semibold text-gray-900">{loan.max_tenure}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-50 space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Wallet size={14} className="mt-0.5 text-gray-400 shrink-0" />
            <span>Fee: <span className="text-gray-900 font-medium">{loan.processing_fee}</span></span>
          </div>
          {loan.eligibility && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FileCheck size={14} className="mt-0.5 text-gray-400 shrink-0" />
              <span>{loan.eligibility}</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Info size={14} className="mt-0.5 text-gray-400 shrink-0" />
            <span className="italic">{loan.use_case}</span>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 mt-auto">
        <button
          onClick={() => onSelect(loan)}
          className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
