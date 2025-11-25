import React from "react";
import { Landmark, Shield, PiggyBank, TrendingUp } from "lucide-react";
import InfoRow from "./InfoRow";
import RiskBadge from "./RiskBadge";
import { formatCurrency } from "../helpers/formatters";

export default function InvestmentCard({ data, type, onSelect }) {
  const title =
    data.name || data.scheme_name || data.bond_name || data.scheme;

  let rateLabel = "Interest";
  let rateValue = data.interest_rate;
  let timeLabel = "Tenure";
  let timeValue = data.tenure;

  if (type === "mutual-funds") {
    rateLabel = "NAV";
    rateValue = data.nav;
    timeLabel = "Category";
    timeValue = data.category;
  } else if (type === "bonds") {
    rateLabel = "Coupon";
    rateValue = data.coupon;
    timeLabel = "Maturity";
    timeValue = data.maturity;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col h-full">
      <div className="flex justify-between mb-4">
        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
          {type === "fds" && <Landmark size={20} />}
          {type === "bonds" && <Shield size={20} />}
          {type === "savings" && <PiggyBank size={20} />}
          {type === "mutual-funds" && <TrendingUp size={20} />}
        </div>

        <RiskBadge level={data.risk} />
      </div>

      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
        {title}
      </h3>

      <p className="text-xs text-gray-400 mb-4 uppercase">
        {type.replace("-", " ")}
      </p>

      <div className="space-y-2 mb-6 flex-grow">
        <InfoRow label={rateLabel} value={rateValue} highlight />
        <InfoRow label={timeLabel} value={timeValue} />
        <InfoRow label="Min Investment" value={formatCurrency(data.min_amount)} />
      </div>

      <button
        onClick={onSelect}
        className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
      >
        View & Invest
      </button>
    </div>
  );
}
