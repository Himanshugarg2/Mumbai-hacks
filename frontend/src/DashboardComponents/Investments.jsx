import { auth, db } from "../firebase";
import { 
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken 
} from "firebase/auth";

import { 
  collection, 
  addDoc, 
  serverTimestamp , getDocs
} from "firebase/firestore";

import { 
  Shield, 
  TrendingUp,   
  Landmark, 
  PiggyBank, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Loader2,
  Wallet
} from "lucide-react";


import React, { useState, useEffect, useMemo } from "react";


// Helper to format currency
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};





const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 
      ${active 
        ? 'border-blue-600 text-blue-600 bg-blue-50' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const InfoRow = ({ label, value, highlight = false }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-500 text-xs">{label}</span>
    <span className={`text-sm font-medium ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);




const RiskBadge = ({ level }) => {
  const colors = {
    'low': 'bg-green-100 text-green-700',
    'safe': 'bg-green-100 text-green-700',
    'Low': 'bg-green-100 text-green-700',
    'Safe': 'bg-green-100 text-green-700',
    'medium': 'bg-yellow-100 text-yellow-700',
    'Moderate': 'bg-yellow-100 text-yellow-700',
    'high': 'bg-orange-100 text-orange-700',
    'High': 'bg-orange-100 text-orange-700',
    'Very High': 'bg-red-100 text-red-700',
  };
  // Normalize checking
  const normalizedLevel = level ? level.toLowerCase() : 'unknown';
  const displayClass = Object.keys(colors).find(k => k.toLowerCase() === normalizedLevel) 
    ? colors[Object.keys(colors).find(k => k.toLowerCase() === normalizedLevel)] 
    : 'bg-gray-100 text-gray-600';

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${displayClass}`}>
      {level || 'Unknown'}
    </span>
  );
};

const InvestmentCard = ({ data, type, onSelect }) => {
  // Fields have been normalized during fetch, but we keep safe fallbacks here
  // Backend Mapping: 
  // FDs -> name constructed from bank + type
  // Bonds -> bond_name
  // Savings -> scheme
  // MF -> scheme_name
  const title = data.name || data.scheme_name || data.bond_name || data.scheme;
  
  // Dynamic Label Logic based on type
  let rateLabel = 'Interest';
  let rateValue = data.interest_rate;
  let timeLabel = 'Tenure';
  let timeValue = data.tenure;

  if (type === 'mutual-funds') {
    rateLabel = 'NAV';
    rateValue = data.nav;
    timeLabel = 'Category';
    timeValue = data.category;
  } else if (type === 'bonds') {
    rateLabel = 'Coupon';
    rateValue = data.coupon; 
    timeLabel = 'Maturity';
    timeValue = data.maturity;
  } else if (type === 'savings') {
    timeLabel = 'Lock-in/Maturity';
    timeValue = data.lock_in || data.maturity;
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
          {type === 'fds' && <Landmark size={20} />}
          {type === 'bonds' && <Shield size={20} />}
          {type === 'savings' && <PiggyBank size={20} />}
          {type === 'mutual-funds' && <TrendingUp size={20} />}
        </div>
        <RiskBadge level={data.risk} />
      </div>
      
      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">{type.replace('-', ' ')}</p>
      
      <div className="space-y-2 mb-6 flex-grow">
        <InfoRow label={rateLabel} value={rateValue} highlight />
        <InfoRow label={timeLabel} value={timeValue} />
        <InfoRow label="Min Investment" value={formatCurrency(data.min_amount)} />
      </div>

      <button 
        onClick={() => onSelect(data, type)}
        className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        View & Invest
      </button>
    </div>
  );
};

const ConfirmationModal = ({ investment, type, onClose, onConfirm, isProcessing, amount, setAmount }) => {
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

// --- Main App Component ---

export default function InvestmentComponent() {
 const user = auth.currentUser;

  const [activeTab, setActiveTab] = useState('fds');
  const [data, setData] = useState({ fds: [], bonds: [], savings: [], mutualFunds: [] });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [amount, setAmount] = useState("");
const [myInvestments, setMyInvestments] = useState([]);

const currentList = useMemo(() => {
  if (activeTab === "fds") return data.fds;
  if (activeTab === "bonds") return data.bonds;
  if (activeTab === "savings") return data.savings;
  if (activeTab === "mutual-funds") return data.mutualFunds;
  return [];
}, [activeTab, data]);


useEffect(() => {
  const fetchMyInvestments = async () => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "investments");
    const snap = await getDocs(ref);
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMyInvestments(list);
  };

  if (activeTab === "my-investments") {
    fetchMyInvestments();
  }
}, [activeTab, user]);


  // 2. Data Fetching (Real Backend with Normalization)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch from actual endpoints
        // Note: Using a short timeout to catch failure quickly if localhost is unreachable
        const fetchWithTimeout = (url) => Promise.race([
            fetch(url),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
        ]);

        const [fdsRes, bondsRes, savingsRes, mfRes] = await Promise.allSettled([
          fetchWithTimeout('http://localhost:8000/fds'),
          fetchWithTimeout('http://localhost:8000/bonds'),
          fetchWithTimeout('http://localhost:8000/savings'),
          fetchWithTimeout('http://localhost:8000/mutual-funds?limit=20')
        ]);

        // Helper to get JSON or empty object
        const getJson = async (res) => (res.status === 'fulfilled' && res.value.ok) ? await res.value.json() : null;

        const fdsData = await getJson(fdsRes);
        const bondsData = await getJson(bondsRes);
        const savingsData = await getJson(savingsRes);
        const mfData = await getJson(mfRes);

        // If EVERYTHING failed (likely environment issue), fallback to mock
        if (!fdsData && !bondsData && !savingsData && !mfData) {
  console.warn("API unreachable. Using empty data.");
  setData({ fds: [], bonds: [], savings: [], mutualFunds: [] });
  setLoading(false);
  return;
}


        // --- Data Normalization ---
        // Normalizing data to ensure consistent keys (name, min_amount) for the UI
        
        const normalizedFDs = (fdsData?.fds || []).map(item => ({
          ...item,
          name: `${item.bank} - ${item.type}`,
          min_amount: item.min_amount 
        }));

        const normalizedBonds = (bondsData?.bonds || []).map(item => ({
          ...item,
          name: item.bond_name,
          min_amount: item.min_investment // Python uses 'min_investment'
        }));

        const normalizedSavings = (savingsData?.schemes || []).map(item => ({
          ...item,
          name: item.scheme,
          min_amount: item.min_investment // Python uses 'min_investment'
        }));

        const normalizedMFs = (mfData?.results || []).map(item => ({
          ...item,
          name: item.scheme_name,
          min_amount: 500, // API doesn't return min amount for MFs, defaulting to 500
          interest_rate: null // MFs use NAV, handled in Card
        }));

        setData({
          fds: normalizedFDs,
          bonds: normalizedBonds,
          savings: normalizedSavings,
          mutualFunds: normalizedMFs
        });

      } catch (error) {
        console.error("Failed to fetch investment data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  // 3. Investment Handler (Firebase)
  const handleInvest = async () => {
  if (!user || !selectedItem) return;

  // Validate amount
  if (!amount || Number(amount) < selectedItem.min_amount) {
    setToast({
      type: "error",
      message: `Amount must be at least ₹${selectedItem.min_amount}`,
    });
    return;
  }

  setProcessing(true);
  try {
    const payload = {
      userId: user.uid,
      name: selectedItem.name || selectedItem.scheme_name,
      type: activeTab,
      category: selectedItem.category || activeTab,
      interest_rate: selectedItem.interest_rate || selectedItem.coupon || null,
      nav: selectedItem.nav || null,
      tenure: selectedItem.tenure || selectedItem.maturity || selectedItem.lock_in || null,
      min_amount: selectedItem.min_amount,
      amountInvested: Number(amount),   // ⭐ save user amount
      risk: selectedItem.risk || "Unknown",
      created_at: serverTimestamp(),
    };

    const investRef = collection(db, "users", user.uid, "investments");
    await addDoc(investRef, payload);

    setSelectedItem(null);
    setAmount(""); // reset
    setToast({ type: "success", message: `Invested ₹${amount} in ${payload.name}` });

  } catch (error) {
    console.error("Investment failed", error);
    setToast({ type: "error", message: "Investment failed. Please try again." });
  } finally {
    setProcessing(false);
  }
};


const MyInvestmentCard = ({ inv }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-gray-900">{inv.name}</h3>
      <RiskBadge level={inv.risk} />
    </div>

    <p className="text-xs text-gray-500 uppercase mt-1">{inv.type.replace('-', ' ')}</p>

    <div className="mt-4 space-y-2">
      <InfoRow label="Amount Invested" value={formatCurrency(inv.amountInvested)} highlight />
      <InfoRow label="Minimum Required" value={formatCurrency(inv.min_amount)} />
      {inv.interest_rate && <InfoRow label="Interest/Coupon" value={inv.interest_rate} />}
      {inv.nav && <InfoRow label="NAV" value={inv.nav} />}
      {inv.tenure && <InfoRow label="Tenure" value={inv.tenure} />}

      <InfoRow 
        label="Date"
        value={inv.created_at?.toDate ? inv.created_at.toDate().toLocaleDateString() : "—"}
      />
    </div>
  </div>
);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        
        
        {/* Scrollable Tabs */}
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            <TabButton 
              active={activeTab === 'fds'} 
              onClick={() => setActiveTab('fds')} 
              icon={Landmark} 
              label="Fixed Deposits" 
            />
            <TabButton 
              active={activeTab === 'bonds'} 
              onClick={() => setActiveTab('bonds')} 
              icon={Shield} 
              label="Govt Bonds" 
            />
            <TabButton 
              active={activeTab === 'savings'} 
              onClick={() => setActiveTab('savings')} 
              icon={PiggyBank} 
              label="Small Savings" 
            />
            <TabButton 
              active={activeTab === 'mutual-funds'} 
              onClick={() => setActiveTab('mutual-funds')} 
              icon={TrendingUp} 
              label="Mutual Funds" 
            />
            <TabButton
  active={activeTab === "my-investments"}
  onClick={() => setActiveTab("my-investments")}
  icon={Wallet}
  label="My Investments"
/>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'fds' && 'Secure Returns with FDs'}
            {activeTab === 'bonds' && 'Government & Corporate Bonds'}
            {activeTab === 'savings' && 'Government Savings Schemes'}
            {activeTab === 'mutual-funds' && 'Grow Wealth with Mutual Funds'}
          </h2>
          <p className="text-gray-500 mt-1">Explore top rated options curated for you.</p>
        </div>

        {loading ? (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
  </div>
) : (

  activeTab === "my-investments" ? (

    myInvestments.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {myInvestments.map(inv => (
          <MyInvestmentCard inv={inv} key={inv.id} />
        ))}
      </div>
    ) : (
      <div className="text-center py-16 text-gray-500 border border-dashed border-gray-300 rounded-xl">
        <Wallet className="mx-auto h-10 w-10 mb-2 text-gray-300" />
        <p>No investments yet.</p>
      </div>
    )

  ) : (
    // existing grid for FDs, Bonds, Savings, MFs
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentList.length > 0 ? (
        currentList.map((item, idx) => (
          <InvestmentCard 
            key={item.id || idx} 
            data={item} 
            type={activeTab} 
            onSelect={() => setSelectedItem(item)} 
          />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400">
          <AlertCircle size={48} className="mb-4 text-gray-200" />
          <p>No investment options found.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-sm text-blue-600 underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )

)}

      </main>

      {/* Confirmation Modal */}
      {selectedItem && (
        <ConfirmationModal
  investment={selectedItem}
  type={activeTab}
  onClose={() => setSelectedItem(null)}
  onConfirm={handleInvest}
  isProcessing={processing}
  amount={amount}
  setAmount={setAmount}
/>

      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}