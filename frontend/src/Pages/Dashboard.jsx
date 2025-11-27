import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// Dashboard Components (each will lazy-load its own data)
import QuickSnapshotCard from "../DashboardComponents/QuickSnapshotCard";
import OpportunityScoutCard from "../DashboardComponents/OpportunityScoutCard";
import SmartSpendGuardianCard from "../DashboardComponents/SmartSpendCard";
import CashflowCard from "../DashboardComponents/CashflowCard";
import WeeklySummaryCard from "../DashboardComponents/WeeklySummaryCard";
import CashflowTrendGraph from "../DashboardComponents/CashflowTrendGraph";
import SpendingPieChart from "../DashboardComponents/SpendingPieChart";
import RecommendedActionsFeed from "../DashboardComponents/RecommendedActionsFeed";
import TodayLogCard from "../DashboardComponents/TodayLogCard";

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

      // load user profile
      const snap = await getDoc(doc(db, "users", u.uid));
      setProfile(snap.data() || {});
      setLoadingProfile(false);
    });

    return () => unsub();
  }, []);

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please log in to view the dashboard.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user.displayName || "Rider"}
          </h1>
          <div className="text-sm text-gray-500">
            {profile?.gigType || "Delivery Partner"}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border p-2 rounded">+ Add Expense</button>
          <button className="bg-white border p-2 rounded">+ Add Income</button>
        </div>
      </div>

      {/* QUICK SNAPSHOT + OPPORTUNITY */}
      <div className="grid md:grid-cols-2 gap-6">
        <QuickSnapshotCard profile={profile} user={user} />
        <OpportunityScoutCard user={user} /> {/* loads itself */}
      </div>

      {/* SMART SPEND + CASHFLOW */}
      <div className="grid md:grid-cols-2 gap-6">
        <SmartSpendGuardianCard user={user} /> {/* loads itself */}
        <CashflowCard user={user} /> {/* loads itself */}
      </div>

      {/* TODAY LOG + WEEKLY SUMMARY */}
      <div className="grid md:grid-cols-2 gap-6">
        <TodayLogCard user={user} />
        <WeeklySummaryCard user={user} />
      </div>

      {/* CHARTS & RECOMMENDATIONS */}
      <div className="grid md:grid-cols-3 gap-6">
        <CashflowTrendGraph user={user} /> {/* loads itself */}
        <SpendingPieChart user={user} /> {/* loads itself */}
        <RecommendedActionsFeed user={user} /> {/* loads itself */}
      </div>
    </div>
  );
}
