import { TrendingUp, TrendingDown, Scale, Target } from "lucide-react";
import { formatCurrency, formatPercent, getSentimentLabel, cn } from "../lib/utils.js";

function InsightCard({ icon: Icon, iconColor, label, value, sub, valueStyle }) {
  return (
    <div
      style={{
        flex: "1 1 200px",
        background: "#FFFFFF",
        border: "1px solid #C8C8C8",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: "20px 20px 18px",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.13)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
    >
      <Icon style={{ width: 16, height: 16, marginBottom: 8, color: iconColor }} />
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 4px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "Courier New, monospace", fontSize: 20, fontWeight: 700, color: "#2C2C2C", margin: "0 0 4px", ...valueStyle }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6B6B6B", margin: 0 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function KeyInsightsPanel({
  financialData,
  sentimentScore,
  riskFactors = [],
  positiveFactors = [],
}) {
  const currency = financialData?.currency ?? "USD";
  const current = financialData?.currentPrice;
  const target = financialData?.analystTargetPrice;

  let valuationValue = "N/A";
  let valuationSub = "Insufficient data";
  let valuationStyle = { color: "#6B6B6B" };
  let ValuationIcon = Target;

  if (current && target) {
    const pct = ((target - current) / current) * 100;
    valuationValue = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
    valuationSub = `Target ${formatCurrency(target, currency)} vs ${formatCurrency(current, currency)}`;
    valuationStyle = { color: pct >= 0 ? "#2d5a27" : "#9B2C2C" };
    ValuationIcon = pct >= 0 ? TrendingUp : TrendingDown;
  }

  const sentimentLabel = getSentimentLabel(sentimentScore);
  const sentimentDisplay =
    sentimentScore !== null && sentimentScore !== undefined
      ? sentimentScore.toFixed(2)
      : "N/A";

  const sentimentColor =
    sentimentScore > 0.2 ? "#2d5a27" :
      sentimentScore < -0.2 ? "#9B2C2C" :
        "#92620A";

  const pos = positiveFactors.length;
  const risk = riskFactors.length;
  const total = pos + risk || 1;
  const posPct = Math.round((pos / total) * 100);

  let consensusValue = "N/A";
  let consensusSub = "No analyst target";
  if (target) {
    consensusValue = formatCurrency(target, currency);
    consensusSub = current
      ? `${((target / current - 1) * 100).toFixed(1)}% vs current`
      : "Analyst consensus target";
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto 24px", padding: "0 24px" }}>
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 12px" }}>
        Key Insights
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <InsightCard
          icon={ValuationIcon}
          iconColor={valuationStyle.color}
          label="Valuation Signal"
          value={valuationValue}
          sub={valuationSub}
          valueStyle={valuationStyle}
        />
        <InsightCard
          icon={TrendingUp}
          iconColor={sentimentColor}
          label="Sentiment Signal"
          value={sentimentDisplay}
          sub={sentimentLabel}
          valueStyle={{ color: sentimentColor }}
        />

        {/* Risk / Reward */}
        <div
          style={{
            flex: "1 1 200px",
            background: "#FFFFFF",
            border: "1px solid #C8C8C8",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "20px 20px 18px",
          }}
        >
          <Scale style={{ width: 16, height: 16, marginBottom: 8, color: "#4E5944" }} />
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 8px" }}>
            Risk / Reward Balance
          </p>
          <div style={{ height: 8, display: "flex", overflow: "hidden", background: "#E8E8E8", marginBottom: 8 }}>
            <div style={{ background: "#4E5944", width: `${posPct}%`, transition: "width 0.5s" }} />
            <div style={{ background: "#C53030", flex: 1 }} />
          </div>
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 12, color: "#6B6B6B", margin: 0 }}>
            {pos} positive · {risk} risk factors
          </p>
        </div>

        <InsightCard
          icon={Target}
          iconColor="#4E5944"
          label="Analyst Consensus"
          value={consensusValue}
          sub={consensusSub}
          valueStyle={{ color: "#2C2C2C" }}
        />
      </div>
    </div>
  );
}
