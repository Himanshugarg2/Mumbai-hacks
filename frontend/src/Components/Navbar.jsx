import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // redirect to login
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition ${
      location.pathname === path
        ? "bg-gray-800 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <h1
        className="text-xl font-bold text-gray-900 cursor-pointer"
        onClick={() => navigate("/")}
      >
        FinCoach
      </h1>

      {/* Center Links */}
      <div className="flex items-center gap-4">
        <div
          className={linkClass("/")}
          onClick={() => navigate("/")}
        >
          Dashboard
        </div>

        <div
          className={linkClass("/investment")}
          onClick={() => navigate("/investment")}
        >
          Investments
        </div>
      </div>

      {/* Right User Section */}
      <div className="flex items-center gap-4">
        {/* User profile */}
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-semibold">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>

        {/* Logout */}
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
