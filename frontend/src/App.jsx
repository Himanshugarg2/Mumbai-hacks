import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import "./App.css";

import Auth from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard";
import AdminAddTransaction from "./Components/AdminComponent";
import Onboarding from "./Pages/Onboarding";

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

          if (snap.exists()) {
            setOnboarded(snap.data().onboardingCompleted || false);
          } else {
            setOnboarded(false);
          }
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

  // still checking auth
  if (user === undefined || onboarded === null) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!user) return <Auth />;

  if (!onboarded) return <Onboarding />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/adt" element={<AdminAddTransaction />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
