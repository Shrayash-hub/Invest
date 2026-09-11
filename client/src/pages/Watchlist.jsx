import { Link } from "react-router-dom";
import { TrendingUp, Trash2, BookMarked, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useWatchlist } from "../hooks/useWatchlist.js";

const VERDICT_CONFIG = {
  INVEST: {
    badge: "bg-green-100 text-green-800 border border-green-200",
    dot: "bg-green-500",
  },
  PASS: {
    badge: "bg-red-100 text-red-800 border border-red-200",
    dot: "bg-red-500",
  },
  WATCH: {
    badge: "bg-amber-100 text-amber-800 border border-amber-200",
    dot: "bg-amber-500",
  },
};

export default function Watchlist() {
  const { currentUser } = useAuth();
  const { watchlist, loading, removeFromWatchlist } = useWatchlist();

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() ?? "U";

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
              to="/"
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-finto-text transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> New Research
            </Link>
            <Link
              to="/settings"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="Account settings"
            >
              <span className="text-xs font-bold text-finto-text">{initials}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 py-12">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-gray-400 mb-1 tracking-widest uppercase">Your Portfolio</p>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <BookMarked className="w-7 h-7 text-finto-primary" />
              Watchlist
            </h1>
          </div>
          <Link
            to="/"
            className="bg-finto-primary text-finto-dark text-sm font-bold px-5 py-2.5 rounded-full hover:bg-finto-primary-hover transition-colors shadow-sm flex items-center gap-2"
          >
            New Research <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>

        ) : watchlist.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
              <BookMarked className="w-7 h-7 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-finto-text">No companies saved yet</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              Run a research report and click "Save to Watchlist" on any result to track it here.
            </p>
            <Link
              to="/"
              className="bg-finto-primary text-finto-dark font-bold px-6 py-3 rounded-full hover:bg-finto-primary-hover transition-colors shadow-sm inline-flex items-center gap-2"
            >
              Start Researching <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
              {["Company", "Ticker", "Exchange", "Verdict", "AI Score", ""].map((h) => (
                <span key={h} className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                  {h}
                </span>
              ))}
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-50">
              {watchlist.map((item) => {
                const vc = VERDICT_CONFIG[item.verdict] ?? VERDICT_CONFIG.WATCH;
                return (
                  <div
                    key={item.$id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Company */}
                    <span className="font-semibold text-sm text-finto-text truncate">
                      {item.companyName}
                    </span>

                    {/* Ticker */}
                    <span className="font-mono text-sm font-bold text-finto-dark">
                      {item.symbol || "—"}
                    </span>

                    {/* Exchange */}
                    <span className="text-sm text-gray-400">
                      {item.exchange || "—"}
                    </span>

                    {/* Verdict badge */}
                    <div>
                      {item.verdict ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${vc.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${vc.dot}`} />
                          {item.verdict}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </div>

                    {/* AI Score */}
                    <span className="font-mono text-sm font-bold text-finto-dark">
                      {item.confidenceScore ? `${item.confidenceScore}%` : "—"}
                    </span>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromWatchlist(item.$id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer count */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 font-medium">
                {watchlist.length} {watchlist.length === 1 ? "company" : "companies"} tracked
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
