import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, User, LogOut, BookMarked, ShieldCheck, Calendar, Hash } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function SettingRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{label}</span>
      </div>
      <span className="font-mono text-sm text-finto-text font-semibold">{value}</span>
    </div>
  );
}

export default function Settings() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch {
      setLoggingOut(false);
    }
  };

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() ?? "U";

  const createdAt = currentUser?.$createdAt
    ? new Date(currentUser.$createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })
    : "—";

  const userId = currentUser?.$id ? currentUser.$id.slice(0, 16) + "…" : "—";

  return (
    <div className="min-h-screen bg-finto-bg flex flex-col font-sans text-finto-text">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-finto-text flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">ARIA</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/watchlist"
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-finto-text transition-colors"
            >
              <BookMarked className="w-4 h-4" /> Watchlist
            </Link>
            <Link
              to="/"
              className="bg-finto-primary text-finto-dark text-sm font-bold px-5 py-2.5 rounded-full hover:bg-finto-primary-hover transition-colors shadow-sm"
            >
              Research
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[640px] w-full mx-auto px-6 py-12">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 mb-1 tracking-widest uppercase">Account</p>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-finto-primary" />
            Settings
          </h1>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Profile</span>
          </div>

          {/* Avatar row */}
          <div className="px-6 py-5 flex items-center gap-4 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-finto-dark flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-extrabold text-finto-primary">{initials}</span>
            </div>
            <div>
              <p className="font-bold text-finto-text text-base">{currentUser?.name ?? "—"}</p>
              <p className="text-sm text-gray-400">{currentUser?.email}</p>
            </div>
          </div>

          {/* Info rows */}
          <div className="px-6 py-2">
            <SettingRow
              icon={<Hash className="w-3.5 h-3.5 text-gray-400" />}
              label="User ID"
              value={userId}
            />
            <SettingRow
              icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />}
              label="Member Since"
              value={createdAt}
            />
          </div>
        </div>

        {/* Sign out card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-finto-text mb-1">Sign Out</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Your session will be cleared and you'll be returned to the login page.
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ml-4"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? "Signing Out…" : "Sign Out"}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
