import { useEffect, useState } from "react";
import { cn } from "../lib/utils.js";

function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function scoreColor(score) {
  if (score >= 70) return "#4E5944";
  if (score >= 40) return "#B7791F";
  return "#C53030";
}

function calcFinancialHealth(fd) {
  if (!fd) return 50;
  let s = 50;
  const pm = fd.profitMargin;
  const de = fd.debtToEquity;
  const pe = fd.peRatio;
  if (pm != null) { if (pm > 0.2) s += 20; else if (pm > 0.1) s += 10; }
  if (de != null) { if (de < 1) s += 15; else if (de < 2) s += 5; else if (de > 3) s -= 15; }
  if (pe != null) { if (pe < 25) s += 15; else if (pe < 40) s += 5; else if (pe > 60) s -= 15; }
  return clamp(s);
}

function calcSentiment(score) {
  if (score === null || score === undefined) return 50;
  return clamp(((score + 1) / 2) * 100);
}

function calcMoat(ca) {
  if (!ca) return 50;
  let s = 50;
  const adv = ca.competitiveAdvantages ?? [];
  const dis = ca.competitiveDisadvantages ?? [];
  s += Math.min(adv.length * 10, 30);
  s -= Math.min(dis.length * 8, 25);
  return clamp(s);
}

function calcGrowth(fd) {
  if (!fd) return 50;
  let s = 50;
  const cur = fd.currentPrice;
  const tgt = fd.analystTargetPrice;
  const rg = fd.revenueGrowth;
  if (cur && tgt) {
    if (tgt > cur * 1.2) s += 30;
    else if (tgt > cur * 1.1) s += 15;
    else if (tgt < cur) s -= 20;
  }
  if (rg != null) { if (rg > 0.2) s += 20; else if (rg > 0.1) s += 10; }
  return clamp(s);
}

function calcRiskLevel(riskFactors, positiveFactors) {
  let s = 70;
  s -= Math.min((riskFactors?.length ?? 0) * 8, 40);
  s += Math.min((positiveFactors?.length ?? 0) * 6, 30);
  return clamp(s);
}

function ScoreBar({ label, score, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const color = scoreColor(score);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 100 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B6B6B", fontWeight: 700 }}>
          {label}
        </span>
        <span style={{ fontFamily: "Courier New, monospace", fontSize: 11, color: "#2C2C2C", fontWeight: 700 }}>
          {Math.round(score)}
        </span>
      </div>
      <div style={{ height: 6, background: "#E8E8E8", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            backgroundColor: color,
            width: `${width}%`,
            transition: "width 1s ease-out",
          }}
        />
      </div>
    </div>
  );
}

export default function InvestmentScoreCard({
  financialData,
  sentimentScore,
  competitorAnalysis,
  riskFactors,
  positiveFactors,
}) {
  const dimensions = [
    { label: "Financial Health", score: calcFinancialHealth(financialData) },
    { label: "Market Sentiment", score: calcSentiment(sentimentScore) },
    { label: "Competitive Moat", score: calcMoat(competitorAnalysis) },
    { label: "Growth Potential", score: calcGrowth(financialData) },
    { label: "Risk Level", score: calcRiskLevel(riskFactors, positiveFactors) },
  ];

  const overall = Math.round(dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length);
  const overallColor = scoreColor(overall);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (overall / 100) * circumference;

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #C8C8C8", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", padding: "16px 16px 14px" }}>
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 12px", textAlign: "center" }}>
        Research Score
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", width: 90, height: 90 }}>
          <svg className="-rotate-90" viewBox="0 0 88 88" style={{ width: "100%", height: "100%" }}>
            <circle cx="44" cy="44" r="36" fill="none" stroke="#E8E8E8" strokeWidth="6" />
            <circle
              cx="44" cy="44" r="36"
              fill="none"
              stroke={overallColor}
              strokeWidth="6"
              strokeLinecap="butt"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "Courier New, monospace", fontSize: 22, fontWeight: 700, color: "#2C2C2C" }}>
              {overall}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {dimensions.map((d, i) => (
          <ScoreBar key={d.label} label={d.label} score={d.score} delay={i * 80} />
        ))}
      </div>
    </div>
  );
}
