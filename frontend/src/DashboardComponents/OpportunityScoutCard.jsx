import React, { useEffect, useState } from "react";
import { 
  MapPin, 
  Clock, 
  Zap, 
  Cloud, 
  Navigation, 
  Search, 
  Info,
  TrendingUp,
  BarChart3
} from "lucide-react";

// Utility to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// A "Scanning" Radar Loader
const RadarLoader = () => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center min-h-[300px] text-center">
    <div className="relative flex items-center justify-center w-16 h-16 mb-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-8 w-8 bg-violet-600">
        <Search className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </span>
    </div>
    <h3 className="text-gray-900 font-semibold">Scouting Opportunities...</h3>
    <p className="text-gray-500 text-sm mt-1">Analyzing traffic, weather, and demand surges.</p>
  </div>
);

export default function OpportunityScoutCard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const fetchData = async (lat, lon) => {
      try {
        let url = `http://localhost:8000/ai/opportunity/${user.uid}`;
        if (lat && lon) {
          url += `?lat=${lat}&lon=${lon}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Opportunity Fetch Error", err);
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      fetchData();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchData(pos.coords.latitude, pos.coords.longitude),
      () => fetchData(), // Fallback if blocked
      { timeout: 5000 }
    );
  }, [user]);

  if (loading || !data) return <RadarLoader />;

  // Destructure for cleaner access
  const { 
    bestTime, 
    bestArea, 
    expectedBoost, 
    aiAdvice, 
    action, 
    confidence, 
    weather, 
    traffic, 
    surgeScore 
  } = data;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
          <Zap size={100} />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-violet-100 text-xs font-bold uppercase tracking-widest border border-violet-400/30 px-2 py-1 rounded-full bg-violet-500/20 backdrop-blur-sm">
              <Zap className="w-3 h-3" />
              <span>Live Scout</span>
            </div>
            
            {/* Confidence Badge */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-violet-200 uppercase font-semibold">Confidence</span>
              <span className="font-bold text-white text-lg">{confidence}%</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold leading-tight mb-1">
            {action || "High Demand Expected"}
          </h2>
          <p className="text-violet-100 text-sm opacity-90 line-clamp-2">
            {aiAdvice}
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="p-6">
        {/* The "Golden Nugget" - Expected Boost */}
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase">Potential Boost</p>
              <p className="text-xl font-extrabold text-amber-900">+{formatCurrency(expectedBoost)}</p>
            </div>
          </div>
          {surgeScore !== undefined && (
            <div className="text-right">
               <p className="text-xs font-bold text-amber-600 uppercase">Surge Score</p>
               <p className="text-lg font-bold text-amber-800">{surgeScore}/10</p>
            </div>
          )}
        </div>

        {/* Location & Time Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase">
              <MapPin className="w-3 h-3" /> Best Area
            </div>
            <p className="font-bold text-gray-800 text-base">{bestArea}</p>
          </div>
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase">
              <Clock className="w-3 h-3" /> Best Time
            </div>
            <p className="font-bold text-gray-800 text-base">{bestTime}</p>
          </div>
        </div>

        {/* Environment Status Bar */}
        <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100 text-sm mb-4 overflow-x-auto whitespace-nowrap">
          {weather && (
            <div className="flex items-center gap-1.5 text-gray-600 pr-3 border-r border-gray-100">
              <Cloud className="w-4 h-4 text-blue-400" />
              <span>{weather.temp}°C, {weather.condition}</span>
            </div>
          )}
          {traffic && (
            <div className="flex items-center gap-1.5 text-gray-600 pr-3">
              <Navigation className="w-4 h-4 text-orange-500" />
              <span>{traffic} Traffic</span>
            </div>
          )}
        </div>

        {/* Reasoning Dropdown/List */}
        {data.reasons && data.reasons.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase">
              <BarChart3 className="w-3 h-3" />
              <span>Why this works</span>
            </div>
            <ul className="space-y-1.5">
              {data.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                  <span className="block w-1 h-1 mt-1.5 rounded-full bg-violet-400 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Footer - Internal Logic Peek */}
      <div className="bg-gray-50 px-6 py-2 border-t border-gray-100 flex justify-between items-center">
         <div className="flex items-center gap-1 text-[10px] text-gray-400">
           <Info className="w-3 h-3" />
           <span>Based on live market conditions</span>
         </div>
         {data.finalHourlyUsed && (
           <div className="text-[10px] text-gray-400 font-mono">
             Base Rate: {formatCurrency(data.finalHourlyUsed)}/hr
           </div>
         )}
      </div>
    </div>
  );
}