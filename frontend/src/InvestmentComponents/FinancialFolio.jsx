import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { User, Wallet, Shield, TrendingUp, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const FinancialFolio = () => {
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Added missing states
  const [editProfile, setEditProfile] = useState({
    risk: "Moderate",
    timeline: "Long Term",
  });
  const [showEdit, setShowEdit] = useState(false);

  // --- 1. Listen for Authentication Changes ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  // --- 2. Fetch Data (Only when userId exists) ---
  const load = async () => {
    if (!userId) return;
    try {
      setLoading(true);

      // Fetch user profile
      const profileRes = await fetch(`http://localhost:8000/user/${userId}`);
      const profile = await profileRes.json();

      setEditProfile({
        risk: profile?.risk || "Moderate",
        timeline: profile?.timeline || "Long Term",
      });

      // Fetch AI portfolio
      const response = await fetch(`http://localhost:8000/ai/portfolio/${userId}`);
      const result = await response.json();

      setData(result);
      parsePortfolioData(result.portfolio);

    } catch (err) {
      setError("Failed to load financial data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [userId]);

  // --- 3. Parse Text for Chart ---
  const parsePortfolioData = (text) => {
    if (!text) return;

    const allocationRegex = /([a-zA-Z\s/]+):\s*(\d+)%/g;
    const extracted = [];
    let match;

    while ((match = allocationRegex.exec(text)) !== null) {
      extracted.push({ name: match[1].trim(), value: parseInt(match[2]) });
    }

    setChartData(extracted);
  };

  // --- 4. UI Helpers ---
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
        {children}
      </div>
    </div>
  );

  // --- STATE HANDLERS ---

  if (!loading && !userId)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="bg-white p-4 rounded-full inline-block shadow-sm">
            <LogIn className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Please Log In</h2>
          <p className="text-gray-500">You need to be authenticated to view your portfolio.</p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Analyzing your finances...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-100 m-4">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        {error}
      </div>
    );

  // --- SUCCESS UI ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Portfolio Agent</h1>
        <p className="text-gray-500 mt-2">Personalized investment strategy based on your profile.</p>

        <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
          <span className="bg-gray-200 px-2 py-1 rounded mr-2">
            ID: {userId.slice(0, 6)}...
          </span>
          Last Updated:
          {data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : "Just now"}
          <button
            className="ml-4 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs"
            onClick={load}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Profile Card */}
          <SectionCard title="User Profile" icon={User}>
            <ul className="space-y-2 mb-4">
              <li className="flex justify-between">
                <span>Risk Appetite:</span>
                <span className="font-medium text-blue-600">{editProfile.risk}</span>
              </li>
              <li className="flex justify-between">
                <span>Timeline:</span>
                <span className="font-medium text-gray-900">{editProfile.timeline}</span>
              </li>
            </ul>

            <button
              onClick={() => setShowEdit(true)}
              className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit
            </button>
          </SectionCard>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Asset Allocation</h3>
            </div>

            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No allocation data parsed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {data?.portfolio ? (
            data.portfolio.split("\n\n").map((section, idx) => {
              if (!section.trim()) return null;

              let Icon = Wallet;
              let title = "Analysis";

              if (section.includes("Insurance")) { Icon = Shield; title = "Insurance Coverage"; }
              else if (section.includes("Mutual Fund")) { Icon = TrendingUp; title = "Fund Recommendations"; }
              else if (section.includes("Allocation")) { Icon = Wallet; title = "Strategic Allocation"; }
              else if (section.includes("Assumptions")) { Icon = AlertCircle; title = "Planning Assumptions"; }

              return (
                <SectionCard key={idx} title={title} icon={Icon}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: section
                        .replace(/\n/g, "<br/>")
                        .replace(/(Rs\.\s?[\d,]+)/g, '<span class="font-bold text-emerald-600">$1</span>')
                        .replace(/(\d+%)/g, '<span class="font-bold text-blue-600">$1</span>')
                    }}
                  />
                </SectionCard>
              );
            })
          ) : (
            <div className="text-gray-500">No portfolio data available.</div>
          )}
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg space-y-4">
            <h2 className="text-xl font-semibold">Edit Profile</h2>

            <label className="text-sm font-medium">Risk Appetite</label>
            <select
              value={editProfile.risk}
              onChange={(e) =>
                setEditProfile({ ...editProfile, risk: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            >
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>

            <label className="text-sm font-medium">Investment Timeline</label>
            <select
              value={editProfile.timeline}
              onChange={(e) =>
                setEditProfile({ ...editProfile, timeline: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            >
              <option>Short Term</option>
              <option>Medium Term</option>
              <option>Long Term</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                onClick={async () => {
                  await fetch(`http://localhost:8000/user/${userId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editProfile),
                  });

                  setShowEdit(false);

                  // Regenerate AI insights
                  const refreshed = await fetch(
                    `http://localhost:8000/ai/portfolio/${userId}`
                  ).then((r) => r.json());

                  setData(refreshed);
                  parsePortfolioData(refreshed.portfolio);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialFolio;
