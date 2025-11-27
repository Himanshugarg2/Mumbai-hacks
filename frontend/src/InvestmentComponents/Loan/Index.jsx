import { LoanCard } from "../Loan/Components/LoanCard";
import {LoanModal} from "../Loan/Components/LoanModal";


import  { useState, useEffect } from "react";
import { 
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { auth, db } from "../../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp
} from "firebase/firestore";


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