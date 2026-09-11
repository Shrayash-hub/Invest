import { motion } from "framer-motion";
import { Copy, Check, BookMarked, Loader2 } from "lucide-react";
import { useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { useWatchlist } from "../hooks/useWatchlist.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCountUp } from "../hooks/useCountUp.js";

const VERDICT_CONFIG = {
  INVEST: {
    bg: "#f0fdf4",
    border: "#86efac",
    accentBorder: "#16a34a",
    text: "#15803d",
    ring: "#22c55e",
    badge: "bg-green-100 text-green-800",
  },
  PASS: {
    bg: "#fff1f2",
    border: "#fecdd3",
    accentBorder: "#e11d48",
    text: "#be123c",
    ring: "#f43f5e",
    badge: "bg-red-100 text-red-800",
  },
  WATCH: {
    bg: "#fffbeb",
    border: "#fde68a",
    accentBorder: "#d97706",
    text: "#b45309",
    ring: "#f59e0b",
    badge: "bg-amber-100 text-amber-800",
  },
};

export default function VerdictCard({ report }) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const { addToWatchlist, watchlist } = useWatchlist();
  const { currentUser } = useAuth();

  if (!report) return null;

  const { verdict, confidenceScore, reasoning, companyName, ticker, exchange } = report;
  const config = VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG.WATCH;

  const isSaved = watchlist.some(
    (item) => (ticker && item.symbol === ticker) || item.companyName === companyName
  );

  const animatedScore = useCountUp({ end: confidenceScore ?? 0, duration: 1500, enabled: true });

  const chartData = [{ name: "confidence", value: confidenceScore ?? 0, fill: config.ring }];

  const handleCopy = async () => {
    const text = `Verdict: ${verdict}\nConfidence: ${confidenceScore}%\n\n${reasoning}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (isSaved || saving || !currentUser) return;
    setSaving(true);
    await addToWatchlist(report);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <div
        className="rounded-2xl p-8"
        style={{
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderLeft: `4px solid ${config.accentBorder}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">

          {/* Left — verdict label */}
          <div className="flex-shrink-0">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Verdict</p>
            <h2
              className="text-5xl font-extrabold tracking-tight leading-none mb-3"
              style={{ color: config.text }}
            >
              {verdict}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {companyName}
              {ticker && (
                <span className="font-mono ml-2 text-gray-400">
                  · {ticker}{exchange ? ` (${exchange})` : ""}
                </span>
              )}
            </p>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px self-stretch bg-gray-200" />

          {/* Middle — reasoning + actions */}
          <div className="flex-1">
            <p className="text-gray-600 text-sm leading-relaxed italic mb-6">{reasoning}</p>
            <div className="flex flex-wrap items-center gap-3">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Summary"}
              </button>

              {/* Save to Watchlist button */}
              {currentUser && (
                <button
                  onClick={handleSave}
                  disabled={isSaved || saving}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm ${
                    isSaved
                      ? "bg-finto-primary text-finto-dark border border-finto-primary cursor-default"
                      : "bg-finto-dark text-white hover:bg-opacity-90 border border-finto-dark"
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isSaved ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <BookMarked className="w-3.5 h-3.5" />
                  )}
                  {isSaved ? "Saved to Watchlist" : saving ? "Saving…" : "Save to Watchlist"}
                </button>
              )}
            </div>
          </div>

          {/* Right — confidence ring */}
          <div className="flex flex-col items-center flex-shrink-0">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Confidence</p>
            <div className="relative w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="72%" outerRadius="100%"
                  barSize={7}
                  data={chartData}
                  startAngle={90} endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background={{ fill: "#e5e7eb" }}
                    dataKey="value"
                    cornerRadius={4}
                    fill={config.ring}
                    isAnimationActive
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-extrabold font-mono text-finto-text">
                  {animatedScore}%
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
