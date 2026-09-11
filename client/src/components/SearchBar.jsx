import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useResearch } from "../hooks/useResearch.js";

const EXAMPLES = ["Apple", "Tesla", "Nvidia", "Infosys", "Reliance"];
const RISK_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function SearchBar({ compact = false }) {
  const { state, startResearch } = useResearch();
  const [company, setCompany] = useState("");
  const [riskAppetite, setRiskAppetite] = useState("medium");

  const isLoading = state.status === "loading";

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = company.trim();
    if (!name || isLoading) return;
    startResearch(name, riskAppetite);
  };

  const handleChipClick = (name) => {
    if (isLoading) return;
    setCompany(name);
    startResearch(name, riskAppetite);
  };

  return (
    <motion.div layout className="w-full relative z-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company name (e.g. Apple, Tesla, Infosys)"
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-finto-primary focus:border-transparent transition-all disabled:opacity-60 shadow-sm"
          />
        </div>

        {/* Risk appetite row */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">
            Risk Appetite
          </span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            {RISK_LEVELS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                disabled={isLoading}
                onClick={() => setRiskAppetite(value)}
                className={`px-4 py-1.5 text-xs font-semibold border-r last:border-r-0 border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  riskAppetite === value
                    ? "bg-finto-dark text-white"
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !company.trim()}
          className="w-full flex items-center justify-center gap-2 bg-finto-primary text-finto-dark font-bold text-sm px-5 py-3.5 rounded-xl hover:bg-finto-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Researching…
            </>
          ) : (
            "Start Research"
          )}
        </button>
      </form>

      {/* Example chips */}
      {!compact && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="text-[11px] text-gray-500 self-center uppercase tracking-wide">
            Try:
          </span>
          {EXAMPLES.map((name) => (
            <button
              key={name}
              type="button"
              disabled={isLoading}
              onClick={() => handleChipClick(name)}
              className="px-3 py-1 text-xs font-semibold bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
