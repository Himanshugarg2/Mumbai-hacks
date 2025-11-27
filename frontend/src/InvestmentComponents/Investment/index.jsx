import TabButton from "./components/TabButton";
import RiskBadge from "./components/RiskBadge";
import InfoRow from "./components/InfoRow";
import InvestmentCard from "./components/InvestmentCard";
import MyInvestmentCard from "./components/MyInvestmentCard";
import ConfirmationModal from "./components/ConfirmationModal";
import { formatCurrency } from "./helpers/formatters";

import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

import {
  Shield,
  TrendingUp,
  Landmark,
  PiggyBank,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Wallet,
} from "lucide-react";

import React, { useState, useEffect, useMemo } from "react";

export default function InvestmentComponent({ investmentData, loading }) {
  const user = auth.currentUser;

  const [activeTab, setActiveTab] = useState("fds");
  const [data, setData] = useState({ fds: [], bonds: [], savings: [], mutualFunds: [] });
  const [selectedItem, setSelectedItem] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [amount, setAmount] = useState("");
  const [myInvestments, setMyInvestments] = useState([]);

  // 🔥 Normalize data ONLY when parent passes new data
  useEffect(() => {
    if (!investmentData) return;

    const normalizedFDs = (investmentData.fds || []).map((item) => ({
      ...item,
      name: `${item.bank} - ${item.type}`,
      min_amount: item.min_amount,
    }));

    const normalizedBonds = (investmentData.bonds || []).map((item) => ({
      ...item,
      name: item.bond_name,
      min_amount: item.min_investment,
    }));

    const normalizedSavings = (investmentData.savings || []).map((item) => ({
      ...item,
      name: item.scheme,
      min_amount: item.min_investment,
    }));

    const normalizedMFs = (investmentData.mutualFunds || []).map((item) => ({
      ...item,
      name: item.scheme_name,
      min_amount: 500,
      interest_rate: null,
    }));

    setData({
      fds: normalizedFDs,
      bonds: normalizedBonds,
      savings: normalizedSavings,
      mutualFunds: normalizedMFs,
    });
  }, [investmentData]);

  // 🔥 Auto load user's saved investments
  useEffect(() => {
    const fetchMyInvestments = async () => {
      if (!user) return;

      const ref = collection(db, "users", user.uid, "investments");
      const snap = await getDocs(ref);
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMyInvestments(list);
    };

    if (activeTab === "my-investments") {
      fetchMyInvestments();
    }
  }, [activeTab, user]);

  // Compute tab data
  const currentList = useMemo(() => {
    if (activeTab === "fds") return data.fds;
    if (activeTab === "bonds") return data.bonds;
    if (activeTab === "savings") return data.savings;
    if (activeTab === "mutual-funds") return data.mutualFunds;
    return [];
  }, [activeTab, data]);

  // Investment Handler
  const handleInvest = async () => {
    if (!user || !selectedItem) return;

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
        name: selectedItem.name,
        type: activeTab,
        min_amount: selectedItem.min_amount,
        amountInvested: Number(amount),
        risk: selectedItem.risk || "Unknown",
        created_at: serverTimestamp(),
      };

      const investRef = collection(db, "users", user.uid, "investments");
      await addDoc(investRef, payload);

      setSelectedItem(null);
      setAmount("");
      setToast({ type: "success", message: `Invested ₹${amount} in ${payload.name}` });
    } catch (error) {
      console.error("Investment failed", error);
      setToast({ type: "error", message: "Investment failed. Please try again." });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Tabs */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            <TabButton active={activeTab === "fds"} onClick={() => setActiveTab("fds")} icon={Landmark} label="Fixed Deposits" />
            <TabButton active={activeTab === "bonds"} onClick={() => setActiveTab("bonds")} icon={Shield} label="Govt Bonds" />
            <TabButton active={activeTab === "savings"} onClick={() => setActiveTab("savings")} icon={PiggyBank} label="Small Savings" />
            <TabButton active={activeTab === "mutual-funds"} onClick={() => setActiveTab("mutual-funds")} icon={TrendingUp} label="Mutual Funds" />
            <TabButton active={activeTab === "my-investments"} onClick={() => setActiveTab("my-investments")} icon={Wallet} label="My Investments" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
          </div>
        ) : activeTab === "my-investments" ? (
          myInvestments.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myInvestments.map((inv) => (
                <MyInvestmentCard inv={inv} key={inv.id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Wallet className="mx-auto h-10 w-10 mb-2" />
              <p>No investments yet.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentList.map((item, idx) => (
              <InvestmentCard key={idx} data={item} type={activeTab} onSelect={() => setSelectedItem(item)} />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
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

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-xl text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
