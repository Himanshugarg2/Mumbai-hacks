import { useEffect, useState } from "react";
import axios from "axios";

export default function DreamsCard({ user }) {
  const [dreams, setDreams] = useState([]);
  const [aiPlan, setAiPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    goal_amount: "",
    saved_amount: "",
    deadline: "",
  });

  const API = "http://localhost:8000";

  // ----------------------------
  // Load Dreams + AI Plan (cached)
  // ----------------------------
  useEffect(() => {
    if (!user) return;
    loadDreams();
    loadAIPlan();
  }, [user]);

  // LOAD DREAMS FROM BACKEND
  const loadDreams = async () => {
    try {
      const res = await axios.get(`${API}/dreams/${user.uid}`);
      setDreams(res.data || []);
    } catch (err) {
      console.error("Failed to load dreams", err);
    }
  };

  // LOAD AI PLAN (reads cache; Gemini not called again)
  const loadAIPlan = async () => {
    try {
      const res = await axios.get(`${API}/dreams/plan/${user.uid}`);
      setAiPlan(res.data || null);
    } catch (err) {
      console.log("AI Plan load failed", err);
    }
  };

  // ----------------------------
  // Save a new dream
  // ----------------------------
  const saveDream = async () => {
    if (!form.title || !form.goal_amount || !form.deadline) {
      return alert("Please fill title, goal amount and deadline.");
    }

    const payload = {
      ...form,
      saved_amount: form.saved_amount || "0",
      userId: user.uid,
    };

    await axios.post(`${API}/dreams`, payload);

    // Reset fields
    setForm({
      title: "",
      goal_amount: "",
      saved_amount: "",
      deadline: "",
    });

    setShowModal(false);

    await loadDreams();

    // ❗ IMPORTANT: Clear AI cache after adding dream
    await axios.delete(`${API}/dreams/plan/${user.uid}/cache`).catch(() => {});

    await loadAIPlan(); // Reload updated plan
  };

  // ----------------------------
  // Delete dream
  // ----------------------------
  const deleteDream = async (id) => {
    if (!window.confirm("Delete this dream?")) return;

    await axios.delete(`${API}/dreams/${user.uid}/${id}`);

    await loadDreams();

    // ❗ Clear AI cache after deleting dream
    await axios.delete(`${API}/dreams/plan/${user.uid}/cache`).catch(() => {});

    await loadAIPlan();
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Dreams</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-1 rounded-lg font-bold"
        >
          +
        </button>
      </div>

      {/* Dream List */}
      {dreams.length === 0 ? (
        <p className="text-gray-500">No dreams added yet.</p>
      ) : (
        <div className="space-y-3">
          {dreams.map((d) => {
            // Extract AI plan properly
            let planObj = aiPlan?.aiPlan;

            if (typeof planObj === "string") {
              try {
                planObj = JSON.parse(planObj);
              } catch {
                planObj = null;
              }
            }

            const dreamPlan = planObj?.[d.title];

            return (
              <div
                key={d.id}
                className="p-3 border rounded-lg flex justify-between"
              >
                <div>
                  <p className="font-semibold text-lg">{d.title}</p>
                  <p className="text-sm text-gray-600">
                    Goal: ₹{d.goal_amount} | Saved: ₹{d.saved_amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Deadline: {d.deadline}
                  </p>

                  {/* AI Plan */}
                  {dreamPlan && (
                    <div className="mt-2 bg-blue-50 p-2 rounded text-sm">
                      <p className="font-semibold text-blue-800">AI Plan:</p>
                      <div className="text-gray-700 text-xs mt-1 space-y-1">
                        <p>📅 <b>Monthly:</b> {dreamPlan.monthly_plan}</p>
                        <p>🗓️ <b>Daily:</b> {dreamPlan.daily_plan}</p>
                        <p>⚙️ <b>Adjust:</b> {dreamPlan.adjustments}</p>
                        <p>⭐ <b>Motivation:</b> {dreamPlan.motivation}</p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => deleteDream(d.id)}
                  className="text-red-500 font-bold"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE DREAM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-5 rounded-xl shadow-xl w-80">
            <h3 className="text-lg font-semibold mb-3">Create New Dream</h3>

            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Dream Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              type="number"
              className="border p-2 rounded w-full mb-2"
              placeholder="Goal Amount"
              value={form.goal_amount}
              onChange={(e) =>
                setForm({ ...form, goal_amount: e.target.value })
              }
            />

            <input
              type="number"
              className="border p-2 rounded w-full mb-2"
              placeholder="Saved Amount"
              value={form.saved_amount}
              onChange={(e) =>
                setForm({ ...form, saved_amount: e.target.value })
              }
            />

            <input
              type="date"
              className="border p-2 rounded w-full mb-3"
              value={form.deadline}
              onChange={(e) =>
                setForm({ ...form, deadline: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="text-gray-600"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                onClick={saveDream}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
