export default function QuickSnapshotCard({ profile }) {
  const income = profile?.monthlyIncome || 0;
  const expense = profile?.monthlyExpense || 0;
  const savings = income - expense;

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
      <h2 className="text-lg font-semibold mb-3">Quick Snapshot</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Monthly Income</p>
          <p className="text-xl font-bold">₹{income}</p>
        </div>
        <div>
          <p className="text-gray-500">Monthly Expenses</p>
          <p className="text-xl font-bold">₹{expense}</p>
        </div>
        <div>
          <p className="text-gray-500">Savings</p>
          <p className="text-xl font-bold">
            ₹{savings}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Gig Type</p>
          <p className="text-base font-semibold">{profile?.gigType}</p>
        </div>
      </div>
    </div>
  );
}
