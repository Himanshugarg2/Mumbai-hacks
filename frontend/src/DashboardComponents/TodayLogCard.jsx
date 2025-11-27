import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Calendar } from "lucide-react";

export default function TodayLogCard({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [log, setLog] = useState(null);
  const [editing, setEditing] = useState(false);

  const dateKey = selectedDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const emptyLog = {
    income: "",
    hoursWorked: "",
    platform: "",
    expenses: {
      food: "",
      fuel: "",
      misc: "",
    },
    notes: "",
  };

  const [form, setForm] = useState(emptyLog);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --------------------------
  // LOAD LOG FOR SELECTED DATE
  // --------------------------
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const snap = await getDoc(
        doc(db, "users", user.uid, "transactions", dateKey)
      );

      if (snap.exists()) {
        const data = snap.data();
        setLog(data);
        setForm({ ...emptyLog, ...data });
      } else {
        setLog(null);
        setForm(emptyLog);
      }
    };

    load();
  }, [user, dateKey]);

  // --------------------------
  // SAVE LOG
  // --------------------------
  const saveLog = async () => {
    await setDoc(
      doc(db, "users", user.uid, "transactions", dateKey),
      form,
      { merge: true }
    );

    setLog(form);
    setEditing(false);
  };

  const totalExpenses = (form.expenses)
    ? Object.values(form.expenses).reduce(
        (sum, v) => sum + (Number(v) || 0),
        0
      )
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">
          Log — {dateKey}
        </h2>

        {/* Calendar Icon */}
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="p-2 rounded-xl border hover:bg-gray-100"
        >
          <Calendar size={20} />
        </button>
      </div>

      {/* Date Picker */}
      {showDatePicker && (
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setShowDatePicker(false);
            setEditing(false);
          }}
          maxDate={new Date()} // user cannot pick future
          inline
        />
      )}

      {/* VIEW MODE */}
      {!editing ? (
        <>
          {log ? (
            <div className="text-sm space-y-1">
              <p>
                <span className="font-semibold">Income:</span> ₹{log.income}
              </p>
              <p>
                <span className="font-semibold">Total Expenses:</span> ₹
                {Object.values(log.expenses || {}).reduce(
                  (sum, v) => sum + (Number(v) || 0),
                  0
                )}
              </p>
              <p>
                <span className="font-semibold">Hours Worked:</span>{" "}
                {log.hoursWorked} hrs
              </p>
              <p>
                <span className="font-semibold">Platform:</span> {log.platform}
              </p>
              {log.notes && (
                <p className="text-gray-500 text-xs mt-1">
                  Note: {log.notes}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-3">
              No log for this date. Add your income & expenses.
            </p>
          )}

          <button
            className="mt-4 w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold"
            onClick={() => setEditing(true)}
          >
            Add / Edit Log
          </button>
        </>
      ) : (
        <>
          {/* EDIT MODE */}
          <div className="space-y-3 text-sm">
            <div>
              <label>Income (₹)</label>
              <input
                type="number"
                value={form.income}
                onChange={(e) => setForm({ ...form, income: e.target.value })}
                className="w-full border rounded-xl p-2 mt-1"
              />
            </div>

            <div>
              <label>Hours Worked</label>
              <input
                type="number"
                value={form.hoursWorked}
                onChange={(e) =>
                  setForm({ ...form, hoursWorked: e.target.value })
                }
                className="w-full border rounded-xl p-2 mt-1"
              />
            </div>

            <div>
              <label>Platform (Zomato / Swiggy / Rapido)</label>
              <input
                type="text"
                value={form.platform}
                onChange={(e) =>
                  setForm({ ...form, platform: e.target.value })
                }
                className="w-full border rounded-xl p-2 mt-1"
              />
            </div>

            <div>
              <label className="font-semibold">Expenses</label>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {["food", "fuel", "misc"].map((cat) => (
                  <div key={cat}>
                    <label className="text-xs capitalize">{cat}</label>
                    <input
                      type="number"
                      value={form.expenses[cat]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          expenses: {
                            ...form.expenses,
                            [cat]: e.target.value,
                          },
                        })
                      }
                      className="w-full border rounded-xl p-2 mt-1"
                    />
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Total today: ₹{totalExpenses}
              </p>
            </div>

            <div>
              <label>Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border rounded-xl p-2 mt-1"
              />
            </div>
          </div>

          <button
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold"
            onClick={saveLog}
          >
            Save Log
          </button>

          <button
            className="mt-2 w-full bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-semibold"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
