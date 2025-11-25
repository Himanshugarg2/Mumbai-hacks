// --- Helpers ---
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateProgress = (saved, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.min(Math.round((saved / goal) * 100), 100);
};