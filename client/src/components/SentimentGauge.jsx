import { ExternalLink } from "lucide-react";
import { getSentimentLabel, cn } from "../lib/utils.js";
import SentimentTimeline from "./SentimentTimeline.jsx";

function scoreToAngle(score) {
  if (score === null || score === undefined) return 90;
  const pct = ((score + 1) / 2) * 100;
  return 180 - (pct / 100) * 180;
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function getArcColor(score) {
  if (score === null || score === undefined) return "#C8C8C8";
  if (score <= -0.3) return "#C53030";
  if (score <= 0.1) return "#B7791F";
  return "#4E5944";
}

function borderLeftColor(sentiment) {
  if (sentiment > 0.2) return "#4E5944";
  if (sentiment < -0.2) return "#C53030";
  return "#B7791F";
}

function sigBadgeStyle(sig) {
  const s = (sig ?? "medium").toLowerCase();
  if (s === "high") return { background: "#FDF0F0", color: "#9B2C2C", border: "1px solid #E8B0B0" };
  if (s === "low") return { background: "#F5F5F5", color: "#6B6B6B", border: "1px solid #C8C8C8" };
  return { background: "#FFFBF0", color: "#92620A", border: "1px solid #E8D0A0" };
}

export default function SentimentGauge({ data }) {
  const sentimentScore = data?.sentimentScore ?? null;
  const newsResults = data?.newsResults ?? [];
  const label = getSentimentLabel(sentimentScore);
  const color = getArcColor(sentimentScore);
  const needleAngle = scoreToAngle(sentimentScore);
  const needleTip = polarToCartesian(120, 100, 70, needleAngle);
  const filledEnd = scoreToAngle(sentimentScore ?? 0);
  const topNews = newsResults.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Gauge */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width="240" height="130" viewBox="0 0 240 130" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="gaugeGradCorp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C53030" />
              <stop offset="50%" stopColor="#B7791F" />
              <stop offset="100%" stopColor="#4E5944" />
            </linearGradient>
          </defs>
          {/* Track */}
          <path
            d={arcPath(120, 100, 80, 0, 180)}
            fill="none"
            stroke="#D8D8D8"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {sentimentScore !== null && (
            <path
              d={arcPath(120, 100, 80, filledEnd, 180)}
              fill="none"
              stroke="url(#gaugeGradCorp)"
              strokeWidth="14"
              strokeLinecap="round"
            />
          )}
          {/* Needle */}
          <line
            x1="120" y1="100"
            x2={needleTip.x} y2={needleTip.y}
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="120" cy="100" r="5" fill="#2C2C2C" />
        </svg>
        <div style={{ marginTop: -4, textAlign: "center" }}>
          <p style={{ fontFamily: "Courier New, monospace", fontSize: 32, fontWeight: 700, color: "#2C2C2C", margin: 0 }}>
            {sentimentScore !== null ? sentimentScore.toFixed(2) : "N/A"}
          </p>
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, fontWeight: 600, color, margin: "4px 0 0" }}>
            {label}
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: 208, marginTop: 12 }}>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B6B" }}>Negative</span>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B6B" }}>Positive</span>
        </div>
      </div>

      <SentimentTimeline newsItems={newsResults} />

      {/* News list */}
      {topNews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B6B", fontWeight: 700, margin: 0 }}>
            Recent News
          </p>
          {topNews.map((item, i) => {
            const headline = item.headline ?? item.title ?? "Untitled";
            const sentiment = item.sentiment ?? 0;
            const url = item.url ?? "";
            const sig = item.significance ?? "medium";
            const badgeStyle = sigBadgeStyle(sig);

            const inner = (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "10px 14px",
                  background: "#FFFFFF",
                  border: "1px solid #D0D0D0",
                  borderLeft: `3px solid ${borderLeftColor(sentiment)}`,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F8F8F8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#2C2C2C", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {headline}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span
                    style={{
                      fontFamily: "Courier New, monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: sentiment > 0.2 ? "#2d5a27" : sentiment < -0.2 ? "#9B2C2C" : "#92620A",
                    }}
                  >
                    {sentiment >= 0 ? "+" : ""}{sentiment.toFixed(1)}
                  </span>
                  <span
                    style={{
                      fontFamily: "Arial, sans-serif",
                      fontSize: 9,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      padding: "1px 6px",
                      fontWeight: 700,
                      ...badgeStyle,
                    }}
                  >
                    {sig}
                  </span>
                </div>
              </div>
            );

            if (url) {
              return (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none" }}>
                  {inner}
                  <ExternalLink style={{ display: "none" }} />
                </a>
              );
            }
            return <div key={i}>{inner}</div>;
          })}
        </div>
      )}
    </div>
  );
}
