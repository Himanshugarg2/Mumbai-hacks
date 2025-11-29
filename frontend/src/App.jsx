import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import "./App.css";

import Landing from "./Pages/Landing";
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → Show landing page with routes to auth
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

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
