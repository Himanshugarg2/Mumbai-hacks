import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// --- Components ---
import FinancialFolio from "../InvestmentComponents/FinancialFolio"; 
import ChatBot from "../Components/Chatbot";

// --- Icons ---
import { 
  LayoutDashboard, 
  Bot, 
  Loader2,
  PieChart
} from "lucide-react";

export default function InvestmentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 1. Auth Listener to get User ID safely
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch User Profile
  const fetchProfile = async (uid) => {
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 space-y-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading financial data...</p>
      </div>
    );
  }

  // --- Render No Profile State ---
  if (!profile && !loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Profile Found</h2>
          <p className="text-gray-500">Please complete your onboarding to see your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-blue-600" />
              Dashboard
            </h1>
            <p className="mt-1 text-gray-500">
              Welcome back! Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">Live Updates</span>
          </div>
        </div>

        {/* --- Main Content --- */}
        <div className="w-full">
            {/* AI Portfolio Strategy */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-indigo-50/50 to-transparent">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Bot size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">AI Portfolio Strategy</h2>
                <span className="ml-auto text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                   Beta
                </span>
              </div>
              <div className="p-0"> 
                 <FinancialFolio userId={currentUser?.uid} />
              </div>
            </section>
        </div>
      </main>
      {/* Floating ChatBot Widget */}
      <ChatBot userId={currentUser?.uid} />
    </div>
  );
}