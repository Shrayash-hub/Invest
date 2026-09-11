import { Clock, Activity, Cpu } from "lucide-react";
import InvestmentScoreCard from "./InvestmentScoreCard.jsx";
import { formatCurrency, formatPercent, formatNumber, cn } from "../lib/utils.js";
import { useCountUp } from "../hooks/useCountUp.js";

const VERDICT_STYLES = {
  INVEST: { background: "#F0F7F0", border: "1px solid #A8C0A0", borderLeft: "4px solid #4E5944", color: "#2d5a27" },
  PASS: { background: "#FDF0F0", border: "1px solid #E8B0B0", borderLeft: "4px solid #C53030", color: "#9B2C2C" },
  WATCH: { background: "#FFFBF0", border: "1px solid #E8D0A0", borderLeft: "4px solid #D69E2E", color: "#92620A" },
};

function QuickMetric({ label, value }) {
  return (
    <div style={{ background: "#F5F5F5", border: "1px solid #D0D0D0", padding: "10px 12px" }}>
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 3px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 700, color: "#2C2C2C", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </p>
    </div>
  );
}

export default function ResearchSidebar({ report, streamEvents = [] }) {
  if (!report) return null;

  const {
    verdict,
    confidenceScore,
    companyName,
    ticker,
    exchange,
    financialData,
    sentimentScore,
    competitorAnalysis,
    riskFactors,
    positiveFactors,
  } = report;

  const currency = financialData?.currency ?? "USD";
  const animatedConfidence = useCountUp({
    end: confidenceScore ?? 0,
    duration: 1200,
    enabled: true,
  });

  const verdictStyle = VERDICT_STYLES[verdict] ?? VERDICT_STYLES.WATCH;

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80 }}>
      {/* Verdict badge */}
      <div style={{ padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", ...verdictStyle }}>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 4px" }}>
          Verdict
        </p>
        <p style={{ fontFamily: "Times New Roman, Times, serif", fontSize: 26, fontWeight: 700, color: verdictStyle.color, margin: "0 0 4px", lineHeight: 1 }}>
          {verdict ?? "—"}
        </p>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 12, color: "#6B6B6B", margin: "0 0 12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {companyName}{ticker && ` · ${ticker}`}{exchange && ` (${exchange})`}
        </p>
        {/* Confidence bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Arial, sans-serif", fontSize: 10, color: "#6B6B6B", marginBottom: 4 }}>
            <span>Confidence</span>
            <span style={{ fontFamily: "Courier New, monospace", fontWeight: 700 }}>{animatedConfidence}%</span>
          </div>
          <div style={{ height: 6, background: "#E0E0E0", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                background: verdictStyle.color,
                width: `${confidenceScore ?? 0}%`,
                transition: "width 1s ease-out",
              }}
            />
          </div>
        </div>
      </div>

      <InvestmentScoreCard
        financialData={financialData}
        sentimentScore={sentimentScore}
        competitorAnalysis={competitorAnalysis}
        riskFactors={riskFactors}
        positiveFactors={positiveFactors}
        verdict={verdict}
      />

      {/* Key Numbers */}
      <div style={{ background: "#FFFFFF", border: "1px solid #C8C8C8", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", padding: "16px 16px 14px" }}>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 10px" }}>
          Key Numbers
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <QuickMetric label="Price" value={formatCurrency(financialData?.currentPrice, currency)} />
          <QuickMetric label="Market Cap" value={formatCurrency(financialData?.marketCap, currency)} />
          <QuickMetric label="P/E" value={formatNumber(financialData?.peRatio, 1)} />
          <QuickMetric label="Margin" value={formatPercent(financialData?.profitMargin)} />
        </div>
      </div>

      {/* Meta */}
      <div style={{ background: "#FFFFFF", border: "1px solid #C8C8C8", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6B6B6B" }}>
          <Clock style={{ width: 13, height: 13, color: "#4E5944", flexShrink: 0 }} />
          Researched just now
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6B6B6B" }}>
          <Activity style={{ width: 13, height: 13, color: "#4E5944", flexShrink: 0 }} />
          {streamEvents.length} events processed
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6B6B6B" }}>
          <Cpu style={{ width: 13, height: 13, color: "#4E5944", flexShrink: 0 }} />
          Powered by Groq + Gemini
        </div>
      </div>
    </aside>
  );
}
