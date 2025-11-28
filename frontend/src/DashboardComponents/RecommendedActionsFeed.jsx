import React, { useState, useEffect } from "react";
import { 
  Lightbulb, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from "lucide-react";

// Configuration for styling based on the source of the tip
const sourceConfig = {
  Cashflow: {
    color: "blue",
    icon: TrendingUp,
    label: "Financial Health",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-500"
  },
  SmartSpend: {
    color: "emerald",
    icon: Lightbulb,
    label: "Smart Savings",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-500"
  },
  Opportunity: {
    color: "amber",
    icon: Zap,
    label: "Earning Boost",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-500"
  }
};

export default function RecommendedActionsFeed({ aiTips = [], tip, aiAdvice }) {
  const [items, setItems] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  // Consolidate props into a single list on load
  useEffect(() => {
    const newItems = [];
    
    if (Array.isArray(aiTips)) {
      newItems.push(...aiTips.map((t, i) => ({ id: `cf-${i}`, source: "Cashflow", text: t })));
    }
    if (tip) {
      newItems.push({ id: "ss-1", source: "SmartSpend", text: tip });
    }
    if (aiAdvice) {
      newItems.push({ id: "opp-1", source: "Opportunity", text: aiAdvice });
    }
    
    setItems(newItems);
  }, [aiTips, tip, aiAdvice]);

  const handleDismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
  };

  const visibleItems = items.filter(item => !dismissed.includes(item.id));

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-violet-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">AI Action Plan</h3>
          <p className="text-xs text-gray-500">Personalized steps to improve finances</p>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {visibleItems.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-100 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-400">All caught up!</p>
            <p className="text-xs text-gray-400">No pending actions right now.</p>
          </div>
        ) : (
          visibleItems.map((item) => {
            const style = sourceConfig[item.source] || sourceConfig.Cashflow;
            const Icon = style.icon;

            return (
              <div 
                key={item.id} 
                className={`group relative bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden pl-4 border-l-4 ${style.border}`}
              >
                {/* Background Hover Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${style.bg}`} />

                <div className="relative z-10">
                  {/* Badge */}
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2 ${style.text}`}>
                    <Icon className="w-3 h-3" />
                    <span>{style.label}</span>
                  </div>

                  {/* Content */}
                  <div className="flex justify-between items-start gap-3">
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                      {item.text}
                    </p>
                    
                    {/* Action Button */}
                    <button 
                      onClick={() => handleDismiss(item.id)}
                      className="text-gray-300 hover:text-emerald-500 transition-colors pt-1"
                      title="Mark as Done"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / CTA */}
      {visibleItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <button className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center justify-center gap-1 transition-all hover:gap-2">
            View Analysis Details <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}