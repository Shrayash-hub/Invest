import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, AlertCircle, FileText, BarChart3,
  Brain, Shield, Zap, Globe, TrendingUp,
  BookMarked, Download, Loader2,
  ArrowRight, Target, Activity, Scale
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { useAuth } from "../context/AuthContext.jsx";
import SearchBar from "../components/SearchBar.jsx";
import AgentProgress from "../components/AgentProgress.jsx";
import VerdictCard from "../components/VerdictCard.jsx";
import ReportSection from "../components/ReportSection.jsx";
import ReasoningTrace from "../components/ReasoningTrace.jsx";
import KeyInsightsPanel from "../components/KeyInsightsPanel.jsx";
import ResearchSidebar from "../components/ResearchSidebar.jsx";
import { useResearch } from "../hooks/useResearch.js";

const FEATURES = [
  {
    icon: <Brain className="w-5 h-5 text-finto-primary" />,
    title: "AI-Powered Analysis",
    desc: "Multi-agent system orchestrates ticker resolution, financial data, news sentiment, and competitor analysis in parallel.",
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-finto-primary" />,
    title: "Live Financial Metrics",
    desc: "Real-time P/E, EPS, revenue growth, debt ratios, and more — pulled directly from market data feeds.",
  },
  {
    icon: <Activity className="w-5 h-5 text-finto-primary" />,
    title: "News Sentiment Scoring",
    desc: "Scans hundreds of recent articles and scores market sentiment so you know what the street is feeling right now.",
  },
  {
    icon: <Scale className="w-5 h-5 text-finto-primary" />,
    title: "Competitive Intelligence",
    desc: "Benchmarks the company against its top competitors across valuation, growth, and moat dimensions.",
  },
  {
    icon: <Target className="w-5 h-5 text-finto-primary" />,
    title: "Price Target & Verdict",
    desc: "Clear Invest / Watch / Pass verdict with a confidence score and a justified price target range.",
  },
  {
    icon: <Shield className="w-5 h-5 text-finto-primary" />,
    title: "Risk Factor Breakdown",
    desc: "Explicit bull-case drivers and bear-case risks surfaced from filings, news, and macro context.",
  },
];

export default function Home() {
  const { state, reset, startResearch } = useResearch();
  const { currentUser } = useAuth();
  const { status, report } = state;
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (downloading || !report) return;
    setDownloading(true);
    try {
      const element =
        document.getElementById("pdf-report-content") ??
        document.getElementById("pdf-report-container");
      const origWidth = element.style.width;
      const origMaxWidth = element.style.maxWidth;
      const origMargin = element.style.margin;
      element.style.width = "1100px";
      element.style.maxWidth = "1100px";
      element.style.margin = "0 auto";

      const opt = {
        margin: [8, 8, 8, 8],
        filename: `${report.ticker || report.companyName || "Research"}_Report.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#FFFFFF",
          windowWidth: 1100,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: "avoid-all" },
      };

      await html2pdf().set(opt).from(element).save();

      element.style.width = origWidth;
      element.style.maxWidth = origMaxWidth;
      element.style.margin = origMargin;
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-finto-bg flex flex-col font-sans text-finto-text">
      {status === "loading" && <div className="progress-bar-top" />}

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={reset}
          >
            <div className="w-8 h-8 rounded-full bg-finto-text flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">ARIA</span>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-4">
            {status === "complete" && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-finto-text transition-colors no-print"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {downloading ? "Generating…" : "Download PDF"}
              </button>
            )}

            {status !== "idle" && (
              <button
                onClick={reset}
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-finto-text transition-colors no-print"
              >
                <RotateCcw className="w-4 h-4" /> New Research
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/watchlist"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-finto-text transition-colors"
                >
                  <BookMarked className="w-4 h-4" /> Watchlist
                </Link>
                <Link
                  to="/settings"
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  title="Account settings"
                >
                  <span className="text-xs font-bold text-finto-text">
                    {(currentUser.name ?? currentUser.email ?? "U")
                      .substring(0, 2)
                      .toUpperCase()}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-finto-text hover:text-gray-500 transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-finto-primary text-finto-dark text-sm font-bold px-5 py-2.5 rounded-full hover:bg-finto-primary-hover transition-colors shadow-sm"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════
              IDLE STATE — LANDING PAGE
          ══════════════════════════════════════════ */}
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >

              {/* 1 ── HERO */}
              <section className="pt-24 pb-16 px-6 text-center max-w-[860px] mx-auto flex flex-col items-center">
                {/* Live badge */}
                <div className="bg-green-50 text-green-800 text-xs font-bold px-4 py-1.5 rounded-full mb-8 flex items-center gap-2 border border-green-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Powered by live market data &amp; AI agents
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-[70px] font-extrabold tracking-tight text-finto-text leading-[1.06] mb-6">
                  Institutional Research,<br />in Seconds
                </h1>
                <p className="text-gray-500 text-lg md:text-xl max-w-[600px] mb-10 leading-relaxed font-medium">
                  Type a company name. ARIA's multi-agent system fetches live financials, scans the news, benchmarks competitors, and delivers an analyst-grade report with a clear verdict.
                </p>

                {/* Hero SearchBar */}
                <div className="w-full max-w-xl mb-6">
                  <SearchBar />
                </div>

                <p className="text-xs text-gray-400 font-medium">
                  Works for any publicly traded company globally — NSE, BSE, NYSE, NASDAQ and more.
                </p>
              </section>

              {/* 2 ── WHAT ARIA DOES (Bento grid) */}
              <section className="py-20 px-6 bg-white border-y border-gray-100">
                <div className="max-w-[1200px] mx-auto">
                  <div className="mb-12">
                    <p className="text-xs font-bold text-gray-400 mb-3 tracking-widest uppercase">Platform Capabilities</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                      Everything You Need to Evaluate a Stock
                    </h2>
                    <p className="text-gray-500 max-w-2xl text-lg">
                      ARIA chains together six specialised AI agents — each with access to real-time tools — so you get a complete picture, not a summary.
                    </p>
                  </div>

                  {/* Bento: 2-col left big + 4-card right grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left tall card */}
                    <div className="lg:col-span-1 bg-gray-50 rounded-[24px] p-8 border border-gray-100 flex flex-col gap-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                          <Brain className="w-5 h-5 text-finto-dark" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Multi-Agent Pipeline</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          Six agents run in sequence: Ticker Resolver → Financial Data → News Sentiment → Competitor Analysis → Decision Engine → Report Builder. Every step is streamed live to your screen.
                        </p>
                      </div>
                      {/* Agent step visualisation */}
                      <div className="flex flex-col gap-2 mt-auto">
                        {["Ticker Resolver", "Financial Data", "News Sentiment", "Competitor Analysis", "Decision Engine", "Report Builder"].map((step, i) => (
                          <div key={step} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i < 3 ? "bg-finto-primary text-finto-dark" : "bg-gray-200 text-gray-500"}`}>
                              {i + 1}
                            </div>
                            <span className="text-xs font-semibold text-gray-600">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right 2×2 grid */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {FEATURES.slice(1).map((f) => (
                        <div
                          key={f.title}
                          className="bg-gray-50 rounded-[20px] p-6 border border-gray-100 flex flex-col gap-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]"
                        >
                          <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
                            {f.icon}
                          </div>
                          <h4 className="font-bold text-finto-text">{f.title}</h4>
                          <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* 3 ── GLOBAL COVERAGE */}
              <section className="py-20 px-6 bg-finto-bg">
                <div className="max-w-[1200px] mx-auto">
                  <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Text */}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-400 mb-3 tracking-widest uppercase">Global Coverage</p>
                      <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                        Research Any Stock,<br />Anywhere in the World
                      </h2>
                      <p className="text-gray-500 text-lg mb-8 max-w-md leading-relaxed">
                        Whether it's Apple on NASDAQ, Reliance on NSE, or HSBC on the LSE — ARIA resolves tickers, normalises currencies, and delivers consistent reports across 135+ exchanges.
                      </p>
                      <button
                        onClick={() => startResearch("Infosys", "medium")}
                        className="bg-finto-primary text-finto-dark font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-finto-primary-hover transition-colors shadow-sm"
                      >
                        Try with Infosys <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Visual */}
                    <div className="flex-1 flex justify-center">
                      <div className="relative w-80 h-80 bg-white rounded-full border border-gray-200 shadow-xl overflow-hidden flex items-center justify-center">
                        <Globe className="w-64 h-64 text-gray-100 absolute" strokeWidth={0.5} />
                        {[
                          { code: "US", bg: "bg-blue-100", pos: "top-1/4 left-1/4" },
                          { code: "IN", bg: "bg-orange-100", pos: "top-1/3 right-1/4" },
                          { code: "UK", bg: "bg-red-100", pos: "bottom-1/3 right-1/3" },
                          { code: "JP", bg: "bg-pink-100", pos: "bottom-1/4 left-1/3" },
                        ].map(({ code, bg, pos }) => (
                          <div
                            key={code}
                            className={`absolute ${pos} w-9 h-9 ${bg} rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-gray-700`}
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3-col stat cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                    {[
                      { icon: <Globe className="w-5 h-5 text-gray-600" />, title: "135+ Exchanges", desc: "Covers major global exchanges including NSE, BSE, NYSE, NASDAQ, LSE, and more." },
                      { icon: <Zap className="w-5 h-5 text-gray-600" />, title: "Under 60 Seconds", desc: "Full multi-agent research pipeline completes in under a minute from query to verdict." },
                      { icon: <FileText className="w-5 h-5 text-gray-600" />, title: "PDF Export", desc: "Download a professionally formatted PDF report to share with your team or save for later." },
                    ].map((c) => (
                      <div key={c.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                          {c.icon}
                        </div>
                        <h4 className="font-bold mb-2">{c.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 4 ── DARK CTA BANNER */}
              <section className="py-20 px-6 bg-finto-bg">
                <div className="max-w-[960px] mx-auto bg-finto-dark rounded-[32px] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-green-400 opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-400 opacity-10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                  <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold mb-6 relative z-10 tracking-tight leading-tight">
                    Stop Guessing.<br />Start Researching.
                  </h2>
                  <p className="text-green-100/75 mb-10 max-w-xl mx-auto relative z-10 text-lg font-medium">
                    Get a complete institutional-grade research report on any stock in the world — for free, in under a minute.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                    <button
                      onClick={() => startResearch("Apple", "medium")}
                      className="bg-finto-primary text-finto-dark font-bold px-8 py-3.5 rounded-full hover:bg-finto-primary-hover transition-colors shadow-lg w-full sm:w-auto"
                    >
                      Research Apple Now
                    </button>
                    <Link
                      to="/signup"
                      className="bg-white text-finto-dark font-bold px-8 py-3.5 rounded-full hover:bg-gray-50 transition-colors shadow-lg w-full sm:w-auto text-center"
                    >
                      Create Free Account
                    </Link>
                  </div>
                </div>
              </section>

            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              LOADING STATE
          ══════════════════════════════════════════ */}
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 bg-finto-bg flex-1"
            >
              <div className="max-w-[800px] mx-auto mb-8 px-6">
                <SearchBar compact />
              </div>
              <div className="max-w-[800px] mx-auto px-6">
                <AgentProgress />
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              COMPLETE STATE
          ══════════════════════════════════════════ */}
          {status === "complete" && report && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 bg-finto-bg flex-1"
            >
              <div className="max-w-[1200px] mx-auto mb-8 px-6 no-print">
                <SearchBar compact />
              </div>
              <div className="max-w-[1200px] mx-auto px-6 mb-8 no-print">
                <AgentProgress />
              </div>

              <div id="pdf-report-container" className="max-w-[1200px] mx-auto px-6">
                <div
                  id="pdf-report-content"
                  className="flex flex-col lg:flex-row gap-6"
                >
                  <div className="flex-1 flex flex-col gap-6 lg:max-w-[800px]">
                    <VerdictCard report={report} />
                    <KeyInsightsPanel
                      financialData={report.financialData}
                      sentimentScore={report.sentimentScore}
                      riskFactors={report.riskFactors}
                      positiveFactors={report.positiveFactors}
                    />
                    {(report.reportSections ?? []).map((s, i) => (
                      <ReportSection key={s.id} section={s} index={i} />
                    ))}
                  </div>

                  <div className="w-full lg:w-[320px] flex-shrink-0 print:hidden">
                    <div className="sticky top-24">
                      <ResearchSidebar
                        report={report}
                        streamEvents={state.streamEvents}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-[1200px] mx-auto px-6 mt-12 no-print">
                <ReasoningTrace />
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              ERROR STATE
          ══════════════════════════════════════════ */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center flex-1 py-20 px-6"
            >
              <div className="max-w-md w-full bg-white border border-red-100 rounded-3xl p-10 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Research Failed
                </h2>
                <p className="text-gray-500 mb-8">{state.error}</p>
                <button
                  onClick={reset}
                  className="w-full bg-red-50 text-red-600 font-bold px-6 py-3 rounded-xl hover:bg-red-100 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={reset}
            >
              <div className="w-6 h-6 rounded-full bg-finto-text flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <span className="font-extrabold text-lg">ARIA</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI Research Intelligence Agent — institutional-grade stock analysis for everyone. For informational purposes only; not financial advice.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 flex-wrap">
            <div>
              <h4 className="font-bold mb-4 text-sm">Platform</h4>
              <div className="flex flex-col gap-3 text-sm text-gray-500">
                <Link to="/" className="hover:text-finto-text transition-colors">Home</Link>
                <Link to="/watchlist" className="hover:text-finto-text transition-colors">Watchlist</Link>
                <Link to="/settings" className="hover:text-finto-text transition-colors">Settings</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Account</h4>
              <div className="flex flex-col gap-3 text-sm text-gray-500">
                <Link to="/login" className="hover:text-finto-text transition-colors">Sign In</Link>
                <Link to="/signup" className="hover:text-finto-text transition-colors">Sign Up Free</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-10 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} ARIA. All rights reserved.</p>
          <p className="text-xs">Not financial advice. Always do your own due diligence.</p>
        </div>
      </footer>
    </div>
  );
}
