import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // redirect to auth
  };

  return (
    <nav className="w-full bg-white shadow-md px-5 py-3 flex items-center justify-between">
      {/* Logo */}
      <h1
        className="text-lg font-bold text-gray-800 cursor-pointer"
        onClick={() => navigate("/")}
      >
        FinCoach
      </h1>

      <div className="flex items-center gap-4">

        {/* User profile icon */}
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-semibold">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
