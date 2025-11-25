import { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";


export default function AdminAddTransaction() {
  const [email, setEmail] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!email || !amount) return alert("Email & amount required!");

    try {
      // ✅ STEP 1 — Find user by email
      const q = query(
        collection(db, "users"),
        where("email", "==", email.toLowerCase())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        return alert("❌ No user found with this email!");
      }

      // ✅ Extract UID
      const userId = snap.docs[0].id;

      // ✅ STEP 2 — Save under correct user
      await addDoc(
        collection(db, "users", userId, type === "income" ? "income" : "expenses"),
        {
          amount: Number(amount),
          category,
          note,
          createdAt: serverTimestamp(),
        }
      );

      alert("✅ Data added successfully!");

      setAmount("");
      setCategory("");
      setNote("");

    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">

          <h2 className="text-xl font-bold mb-4 text-center">
            Admin — Add User Record
          </h2>

          <input
            type="email"
            placeholder="User Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg mb-3"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border p-3 rounded-lg mb-3"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="number"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-3 rounded-lg mb-3"
          />

          <input
            type="text"
            placeholder="Category (optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-3 rounded-lg mb-3"
          />

          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            Save Record
          </button>
        </div>
      </div>
    </>
  );
}
