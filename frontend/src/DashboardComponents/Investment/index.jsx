import TabButton from "./components/TabButton";
import RiskBadge from "./components/RiskBadge";
import InfoRow from "./components/InfoRow";
import InvestmentCard from "./components/InvestmentCard";
import MyInvestmentCard from "./components/MyInvestmentCard";
import ConfirmationModal from "./components/ConfirmationModal";
import { formatCurrency } from "./helpers/formatters";

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