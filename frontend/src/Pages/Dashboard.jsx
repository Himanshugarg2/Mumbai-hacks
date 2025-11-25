import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import Stats from "../DashboardComponents/Stats";
import InvestmentComponent from "../DashboardComponents/Investments";
import LoanComponent from "../DashboardComponents/Loan";
import DreamComponent from "../DashboardComponents/Dream";
import { 
  LayoutDashboard, 
  Sparkles, 
  TrendingUp, 
  Wallet, 
  PieChart 
} from "lucide-react";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const ref = doc(db, "users", user.uid);
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

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading financial data...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Profile Found</h2>
          <p className="text-gray-500">We couldn't retrieve your financial data. Please try refreshing or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
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

        {/* Stats Overview */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Stats income={profile.monthlyIncome} expense={profile.monthlyExpense} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Financial Tools (Wider) */}
          {/* Left Column: Financial Tools (Wider) */}
<div className="xl:col-span-2 space-y-8">

  {/* Investments Card (Now First) */}
  <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-transparent">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          <TrendingUp size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Investments</h2>
      </div>
      <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">New</span>
    </div>
    <div className="p-1 flex-grow">
      <InvestmentComponent />
    </div>
  </section>

  {/* Loans Card (Now Second) */}
  <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
    <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-orange-50/50 to-transparent">
      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
        <Wallet size={20} />
      </div>
      <h2 className="text-lg font-bold text-gray-800">Loan Options</h2>
    </div>
    <div className="p-6">
      <LoanComponent />
    </div>
  </section>

</div>

          {/* Right Column: Dreams (Narrower) */}
          <div className="space-y-8">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-blue-50/50 to-transparent">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Your Dreams</h2>
              </div>
              <div className="p-6">
                <DreamComponent userId={auth.currentUser.uid} />
              </div>
            </section>

            {/* Placeholder for future features or charts */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden hidden md:block">
               <div className="relative z-10">
                 <h3 className="text-2xl font-bold mb-2">Unlock Premium Insights</h3>
                 <p className="text-indigo-100 max-w-lg mb-6">Get detailed analytics on your spending habits.</p>
                 <button className="bg-white text-indigo-600 px-5 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                   View Plans
                 </button>
               </div>
               <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                 <PieChart size={180} />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}