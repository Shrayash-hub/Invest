import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatCurrency, formatPercent, formatNumber, cn } from "../lib/utils.js";
import { useCountUp } from "../hooks/useCountUp.js";

const METRICS = [
  { key: "marketCap", label: "Market Cap", format: "currency" },
  { key: "peRatio", label: "P/E Ratio", format: "number" },
  { key: "revenue", label: "Revenue (TTM)", format: "currency" },
  { key: "netIncome", label: "Net Income", format: "currency" },
  { key: "debtToEquity", label: "Debt / Equity", format: "number" },
  { key: "profitMargin", label: "Profit Margin", format: "percent" },
  { key: "week52High", label: "52W High", format: "currency" },
  { key: "week52Low", label: "52W Low", format: "currency" },
  { key: "eps", label: "EPS", format: "currency" },
  { key: "analystTargetPrice", label: "Analyst Target", format: "currency" },
];

function formatMetric(value, format, currency) {
  if (value === null || value === undefined) return "N/A";
  switch (format) {
    case "currency": return formatCurrency(value, currency);
    case "percent": return formatPercent(value);
    case "number": return formatNumber(value, 2);
    default: return String(value);
  }
}

function getHealthDot(key, value) {
  if (value === null || value === undefined) return null;
  if (key === "marketCap" && value > 100e9) return "#4E5944";
  if (key === "peRatio" && value > 40) return "#C53030";
  if (key === "peRatio" && value < 25) return "#4E5944";
  if (key === "profitMargin" && value > 0.2) return "#4E5944";
  if (key === "debtToEquity" && value > 2) return "#C53030";
  if (key === "debtToEquity" && value < 1) return "#4E5944";
  return "#C8C8C8";
}

function MetricCard({ label, formatted, isNA, dotColor, rawValue, format, currency }) {
  const numericEnd =
    format === "currency" || format === "number"
      ? rawValue
      : format === "percent" && rawValue != null
        ? rawValue * 100
        : null;

  const animated = useCountUp({
    end: numericEnd ?? 0,
    duration: 1200,
    decimals: format === "percent" ? 1 : format === "number" ? 1 : 0,
    enabled: !isNA && numericEnd != null,
  });

  let display = formatted;
  if (!isNA && numericEnd != null) {
    if (format === "currency") display = formatCurrency(animated, currency);
    else if (format === "percent") display = `${animated.toFixed(1)}%`;
    else if (format === "number") display = animated.toFixed(1);
  }

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #C8C8C8",
        padding: "16px 16px 14px",
        transition: "box-shadow 0.15s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.11)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
        {dotColor && (
          <span style={{ width: 6, height: 6, background: dotColor, display: "inline-block", flexShrink: 0 }} />
        )}
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B6B", fontWeight: 700, margin: 0 }}>
          {label}
        </p>
      </div>
      <p style={{ fontFamily: "Courier New, monospace", fontSize: 20, fontWeight: 700, color: isNA ? "#AAAAAA" : "#2C2C2C", margin: 0 }}>
        {display}
      </p>
    </div>
  );
}

function ChartTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #C8C8C8", padding: "8px 12px", fontFamily: "Courier New, monospace", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <p style={{ color: "#6B6B6B", margin: "0 0 4px" }}>{payload[0].payload.name}</p>
      <p style={{ color: "#2C2C2C", fontWeight: 700, margin: 0 }}>{formatCurrency(payload[0].value, currency)}</p>
    </div>
  );
}

export default function FinancialMetricsGrid({ data }) {
  const currency = data?.currency ?? "USD";

  const chartData = [
    { name: "Revenue", value: data?.revenue ?? 0 },
    { name: "Net Income", value: data?.netIncome ?? 0 },
  ].filter((d) => d.value > 0);

  if (!data) {
    return (
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#6B6B6B", fontStyle: "italic" }}>
        Financial data unavailable for this company.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {METRICS.map(({ key, label, format }) => {
          const value = data[key];
          const formatted = formatMetric(value, format, currency);
          const isNA = formatted === "N/A";
          const dotColor = getHealthDot(key, value);

          return (
            <MetricCard
              key={key}
              label={label}
              formatted={formatted}
              isNA={isNA}
              dotColor={dotColor}
              rawValue={value}
              format={format}
              currency={currency}
            />
          );
        })}
      </div>

      {chartData.length > 0 && (
        <div style={{ height: 240, background: "#FAFAFA", border: "1px solid #D0D0D0", padding: "16px 16px 8px" }}>
          <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 12px" }}>
            Revenue vs Net Income
          </p>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid stroke="#E0E0E0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6B6B6B", fontSize: 11, fontFamily: "Arial, sans-serif" }}
                axisLine={{ stroke: "#C8C8C8" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B6B6B", fontSize: 10, fontFamily: "Arial, sans-serif" }}
                tickFormatter={(v) => formatCurrency(v, currency)}
                axisLine={{ stroke: "#C8C8C8" }}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip currency={currency} />} />
              <Bar dataKey="value" radius={[0, 0, 0, 0]} isAnimationActive>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#4E5944" : "#A8C0A0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
