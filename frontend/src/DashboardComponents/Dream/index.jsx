import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

// Subcomponents
import DreamCard from "./DreamCard";
import DreamModal from "./DreamModal";
import LinkInvestmentModal from "./LinkInvestmentModal";

// Helpers
import { formatCurrency, calculateProgress } from "./helpers";

// Icons
import { Plus, Target, Loader2 } from "lucide-react";



export default function DreamComponent({ userId }) {
  const [dreams, setDreams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [linkDream, setLinkDream] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  useEffect(() => {
    fetchDreams();
  }, [userId]);

  // Fetch investments from Firestore when Modal opens
  useEffect(() => {
    if (linkDream) {
      const fetchInvestments = async () => {
        try {
          // Using the same path logic as InvestmentComponent
          // Path: artifacts/{appId}/users/{userId}/investments
         const ref = collection(db, 'users', userId, 'investments');

          const snap = await getDocs(ref);
          const invList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setInvestments(invList);
        } catch (err) {
          console.error("Failed to load investments", err);
        }
      };
      fetchInvestments();
    }
  }, [linkDream, userId, appId]);

  const fetchDreams = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/dreams/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setDreams(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch dreams:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveDream = async (dream) => {
    setSaving(true);
    try {
      const method = (selected && selected.id) ? 'PUT' : 'POST';
      const url = (selected && selected.id) 
        ? `http://localhost:8000/dreams/${userId}/${selected.id}`
        : `http://localhost:8000/dreams`;
      
      const payload = { userId, ...dream };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSelected(null);
        fetchDreams();
      }
    } catch (err) {
      console.error("Failed to save dream", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteDream = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dream?")) return;
    try {
      await fetch(`http://localhost:8000/dreams/${userId}/${id}`, { method: 'DELETE' });
      fetchDreams();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const linkInvestment = async (dream, investment) => {
    try {
      await fetch(`http://localhost:8000/dreams/${userId}/${dream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linked_investment: {
            name: investment.name || investment.bank || investment.bond_name,
            min_amount: investment.min_amount || investment.min_investment,
          },
        })
      });

      setLinkDream(null);
      fetchDreams();
    } catch (err) {
      console.error("Failed to link investment", err);
    }
  };

  return (
    <div className="bg-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Goals</h2>
          <p className="text-sm text-gray-500">Track and fund your future.</p>
        </div>
        <button
          onClick={() => setSelected({})}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow active:scale-95 duration-200"
        >
          <Plus size={18} />
          <span>New Dream</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 size={32} className="animate-spin mb-3 text-blue-600" />
          <p>Loading dreams...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {dreams.length > 0 ? dreams.map((d) => (
            <DreamCard
              key={d.id}
              dream={d}
              onEdit={setSelected}
              onDelete={deleteDream}
              onLink={(dream) => setLinkDream(dream)}
            />
          )) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Target className="text-blue-500 h-8 w-8" />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">No dreams yet</h3>
              <p className="text-gray-500 text-sm mb-4">Start by adding a financial goal you want to achieve.</p>
              <button 
                onClick={() => setSelected({})}
                className="text-blue-600 font-medium hover:underline"
              >
                Create your first dream
              </button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <DreamModal
          dream={selected.title ? selected : null}
          onClose={() => setSelected(null)}
          onSave={saveDream}
          isSaving={saving}
        />
      )}

      {linkDream && (
        <LinkInvestmentModal
          dream={linkDream}
          investments={investments}
          onClose={() => setLinkDream(null)}
          onLink={linkInvestment}
        />
      )}
    </div>
  );
}