import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

import QuickSnapshotCard from "../DashboardComponents/QuickSnapshotCard";
import SmartSpendCard from "../DashboardComponents/SmartSpendCard";
import CashflowCard from "../DashboardComponents/CashflowCard";
import TodayLogCard from "../DashboardComponents/TodayLogCard";
import WeeklySummaryCard from "../DashboardComponents/WeeklySummaryCard";
import FinancialCoachCard from "../DashboardComponents/FinancialCoachCard";
import OpportunityScoutCard from "../DashboardComponents/OpportunityScoutCard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(u);

      // Load user profile
      const snap = await getDoc(doc(db, "users", u.uid));
      const data = snap.data();
      setProfile(data);

      // Trigger backend AI agents (Cashflow + SmartSpend)
    // Trigger backend AI agents (Cashflow + SmartSpend) in background
Promise.all([
  fetch(`http://localhost:8000/cashflow/predict/${u.uid}`),
  fetch(`http://localhost:8000/ai/smart-spend/${u.uid}`),
]).catch((err) => {
  console.error("Error triggering agents:", err);
});

setLoading(false);

    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your personalized dashboard…
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Please log in to see your dashboard.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
           Welcome back, {user.displayName || "User"}
        </h1>
      </div>

      {/* Top row: Quick Snapshot (left) + OpportunityScout (right) */}
      <div className="grid gap-6 md:grid-cols-2">
        <QuickSnapshotCard profile={profile} />
        <OpportunityScoutCard user={user} />
      </div>

      {/* SmartSpend + Cashflow */}
      <div className="grid gap-6 md:grid-cols-2">
        <SmartSpendCard user={user} />
        <CashflowCard user={user} profile={profile} />
      </div>

      {/* Financial Coach AI (3 tips) */}
      <div>
        <FinancialCoachCard user={user} />
      </div>

      {/* Today Log + Weekly Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <TodayLogCard user={user} />
        <WeeklySummaryCard user={user} />
      </div>
    </div>
  );
}
