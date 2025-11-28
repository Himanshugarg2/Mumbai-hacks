import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Bell, 
  UserCircle 
} from "lucide-react";

// Dashboard Components
import QuickSnapshotCard from "../DashboardComponents/QuickSnapshotCard";
import OpportunityScoutCard from "../DashboardComponents/OpportunityScoutCard";
import SmartSpendGuardianCard from "../DashboardComponents/SmartSpendCard";
import CashflowCard from "../DashboardComponents/CashflowCard";
import WeeklySummaryCard from "../DashboardComponents/WeeklySummaryCard";
import CashflowTrendGraph from "../DashboardComponents/CashflowTrendGraph";
import SpendingPieChart from "../DashboardComponents/SpendingPieChart";
import TodayLogCard from "../DashboardComponents/TodayLogCard";
import DreamsCard from "../DashboardComponents/DreamsCard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // -------------------------------
  // AUTH + PROFILE
  // -------------------------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        setUser(null);
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      setUser(u);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile(snap.data() || {});
      } catch (e) {
        console.error("Profile load error", e);
      } finally {
        setLoadingProfile(false);
      }
    });

    return () => unsub();
  }, []);

  // Loading Screen
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-500 mb-4">Please log in to view your dashboard.</p>
          <a href="/login" className="text-indigo-600 font-bold hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50/50">
      
      {/* --------------------
          TOP NAVIGATION 
      -------------------- */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Hello, {user.displayName ? user.displayName.split(' ')[0] : "Partner"}
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                {profile?.gigType || "Gig Partner"} Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600">
              <CalendarDays size={14} />
              {currentDate}
            </div>
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
              <UserCircle size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* --------------------
          MAIN GRID CONTENT
      -------------------- */}
      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* ROW 1: HERO METRICS (Snapshot + Opportunity) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Snapshot (Wider) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <QuickSnapshotCard profile={profile} user={user} />
          </div>
          
          {/* Opportunity Scout (Side) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
            <OpportunityScoutCard user={user} />
          </div>
        </section>

        {/* ROW 2: OPERATIONS & CASHFLOW */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Input Focus */}
          <div className="h-full min-h-[400px]">
             <TodayLogCard user={user} />
          </div>
          
          {/* Financial Guardians */}
          <div className="space-y-6">
             <SmartSpendGuardianCard user={user} />
          </div>
          
          <div className="space-y-6">
             <CashflowCard user={user} />
          </div>
        </section>

        {/* ROW 3: ANALYTICS (Charts) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <CashflowTrendGraph user={user} />
          </div>
          <div className="lg:col-span-4 h-full">
            <SpendingPieChart user={user} />
          </div>
        </section>

        {/* ROW 4: REVIEW & GOALS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          <div className="h-full">
             <WeeklySummaryCard user={user} />
          </div>
          <div className="h-full">
             <DreamsCard user={user} />
          </div>
        </section>

      </main>
    </div>
  );
}