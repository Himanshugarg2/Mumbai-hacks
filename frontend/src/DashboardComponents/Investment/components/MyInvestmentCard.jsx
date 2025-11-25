import React from "react";
import RiskBadge from "./RiskBadge";
import InfoRow from "./InfoRow";
import { formatCurrency } from "../helpers/formatters";

export default function MyInvestmentCard({ inv }) {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">{inv.name}</h3>
        <RiskBadge level={inv.risk} />
      </div>

      <p className="text-xs text-gray-500 uppercase mt-1">
        {inv.type.replace("-", " ")}
      </p>

      <div className="mt-4 space-y-2">
        <InfoRow
          label="Amount Invested"
          value={formatCurrency(inv.amountInvested)}
          highlight
        />

        {inv.interest_rate && (
          <InfoRow label="Interest" value={inv.interest_rate} />
        )}

        {inv.nav && <InfoRow label="NAV" value={inv.nav} />}
      </div>
    </div>
  );
}
