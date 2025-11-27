import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import "./App.css";

import Auth from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard";
import Onboarding from "./Pages/Onboarding";
import InvestmentDashboard from "./Pages/InvestmentDashboard";
import Navbar from "./Components/Navbar";

export default function App() {
  const [user, setUser] = useState(undefined);
  const [onboarded, setOnboarded] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const ref = doc(db, "users", currentUser.uid);
          const snap = await getDoc(ref);
          setOnboarded(snap.exists() ? snap.data().onboardingCompleted : false);
        } catch (error) {
          console.error("Error fetching onboarding status:", error);
          setOnboarded(false);
        }
      } else {
        setOnboarded(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Still checking auth/onboard state...
  if (user === undefined || onboarded === null) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  // Not logged in → Show login page
  if (!user) return <Auth />;

  // Logged in but not onboarded → Show onboarding
  if (!onboarded) return <Onboarding />;

  // Logged in + onboarded → Show app with Navbar
  return (
    <Router>
      {/* Navbar visible on all authenticated pages */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/investment" element={<InvestmentDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
