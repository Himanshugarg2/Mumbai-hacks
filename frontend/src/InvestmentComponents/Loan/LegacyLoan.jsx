import React, { useState, useEffect } from "react";
import { 
  Banknote, 
  Building2, 
  Percent, 
  CalendarClock, 
  FileCheck, 
  AlertTriangle, 
  Info, 
  Search,
  Filter,
  CheckCircle2,
  X,
  Loader2,
  Wallet
} from "lucide-react";
import { auth, db } from "../../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp
} from "firebase/firestore";

// ==================== LOAN CARD ====================
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

// ==================== LOAN MODAL ====================
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

// ==================== MAIN LOAN COMPONENT ====================
export default function LoanComponent() {
  const [loans, setLoans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Filters
  const [filterType, setFilterType] = useState("");
  const [filterRisk, setFilterRisk] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    fetchLoans();
  }, [filterType, filterRisk]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      // Build Query Params
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterRisk) params.append("risk", filterRisk);
      
      const response = await fetch(`http://localhost:8000/loans?${params.toString()}`);
      
      if (!response.ok) throw new Error("API Failed");
      
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (err) {
      console.warn("Failed to fetch loans (using mock):", err);
      // Fallback filtering on mock data
      let mock = MOCK_LOANS;
      if (filterType) mock = mock.filter(l => l.type.toLowerCase().includes(filterType.toLowerCase()));
      if (filterRisk) mock = mock.filter(l => l.risk.toLowerCase() === filterRisk.toLowerCase());
      setLoans(mock);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (loan) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        userId: user.uid,
        loan_type: loan.type,
        bank: loan.bank,
        interest_rate: loan.interest_rate,
        max_tenure: loan.max_tenure,
        status: "Applied",
        applied_at: serverTimestamp()
      };

      // Save to private user collection: artifacts/{appId}/users/{userId}/loans
      const ref = collection(db, 'users', user.uid, 'loans');

      await addDoc(ref, payload);

      setSelected(null);
      // Optional: Add toast notification here
      alert(`Application sent for ${loan.bank} ${loan.type}`);
    } catch (error) {
      console.error("Application failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Available Loans</h2>
          <p className="text-sm text-gray-500">Compare rates and apply instantly</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search type..." 
              className="w-full sm:w-40 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
          
          <select 
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-orange-500 cursor-pointer"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="">All Risks</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={32} className="animate-spin mb-3 text-orange-500" />
          <p>Finding best rates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loans.length > 0 ? (
            loans.map((loan, index) => (
              <LoanCard key={index} loan={loan} onSelect={setSelected} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Filter className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p className="text-gray-500">No loans found matching your criteria.</p>
              <button 
                onClick={() => {setFilterType(""); setFilterRisk("");}}
                className="mt-2 text-sm text-orange-600 font-medium hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      <LoanModal
        selected={selected}
        onClose={() => setSelected(null)}
        onApply={handleApply}
        isProcessing={processing}
      />
    </div>
  );
}