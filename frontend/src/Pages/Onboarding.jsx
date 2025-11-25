import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { 
  Bike, 
  Car, 
  Laptop, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  IndianRupee, 
  Wallet, 
  TrendingDown, 
  Loader2 
} from "lucide-react";

import { auth, db } from "../firebase";


// Visual configuration for Gig Types
const gigTypes = [
  {
    id: "delivery",
    title: "Delivery Partner",
    icon: Bike,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "group-hover:border-orange-200",
    desc: "Swiggy, Zomato, Blinkit, Zepto",
  },
  {
    id: "ride",
    title: "Ride / Transport",
    icon: Car,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "group-hover:border-blue-200",
    desc: "Uber, Ola, Rapido, BluSmart",
  },
  {
    id: "freelancer",
    title: "Freelancer",
    icon: Laptop,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "group-hover:border-purple-200",
    desc: "Designer, Dev, Creator, Writer",
  },
  {
    id: "local",
    title: "Local Services",
    icon: Wrench,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "group-hover:border-emerald-200",
    desc: "Electrician, Urban Company, Tutor",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedGig, setSelectedGig] = useState(null);
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Wait for auth to initialize
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleFinish = async () => {
    if (!user) {
      alert("Please log in to continue.");
      return;
    }

    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          gigType: selectedGig,
          monthlyIncome: Number(income),
          monthlyExpense: Number(expense),
          onboardingCompleted: true,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      // Smooth redirect
      window.location.href = "/";
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Progress Bar Width
  const progressWidth = ((step) / 3) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-100 w-full">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Step {step} of 3</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              {step === 1 && "What describes you best?"}
              {step === 2 && "What's your monthly income?"}
              {step === 3 && "What are your expenses?"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 && "Select the category that fits your work."}
              {step === 2 && "An estimate helps us plan your budget."}
              {step === 3 && "Rent, food, EMI, and other costs."}
            </p>
          </div>

          {/* STEP 1: GIG SELECTION */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {gigTypes.map((g) => {
                const isSelected = selectedGig === g.title;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGig(g.title)}
                    className={`group relative p-4 rounded-2xl border-2 text-left transition-all duration-200 outline-none
                      ${isSelected 
                        ? "border-blue-600 bg-blue-50/30 shadow-sm" 
                        : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${isSelected ? "bg-white shadow-sm" : g.bg}`}>
                      <g.icon className={`h-6 w-6 ${g.color}`} />
                    </div>
                    <div className="absolute top-4 right-4">
                       {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                    </div>
                    <h3 className={`font-semibold ${isSelected ? "text-blue-700" : "text-gray-900"}`}>{g.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2: INCOME INPUT */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center mb-6">
                 <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Wallet size={32} />
                 </div>
                 <div className="relative w-full max-w-xs">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 text-3xl font-bold text-center text-gray-900 bg-white border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:ring-0 outline-none placeholder:text-gray-300 transition-all"
                      autoFocus
                    />
                 </div>
                 <p className="text-xs text-gray-500 mt-3">Enter your average monthly earnings</p>
              </div>
            </div>
          )}

          {/* STEP 3: EXPENSE INPUT */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 flex flex-col items-center justify-center mb-6">
                 <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <TrendingDown size={32} />
                 </div>
                 <div className="relative w-full max-w-xs">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={expense}
                      onChange={(e) => setExpense(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 text-3xl font-bold text-center text-gray-900 bg-white border-2 border-red-100 rounded-xl focus:border-red-500 focus:ring-0 outline-none placeholder:text-gray-300 transition-all"
                      autoFocus
                    />
                 </div>
                 <p className="text-xs text-gray-500 mt-3">Includes rent, food, transport, EMIs</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
            {step > 1 && (
              <button
                onClick={prevStep}
                disabled={saving}
                className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={nextStep}
                disabled={(step === 1 && !selectedGig) || (step === 2 && !income)}
                className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                Next Step <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!expense || saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : "Finish Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}