import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";

const SIG_ORDER = { high: 0, medium: 1, low: 2 };

function dotColor(sentiment) {
  if (sentiment > 0.2) return "#4E5944";
  if (sentiment < -0.2) return "#C53030";
  return "#B7791F";
}

export default function SentimentTimeline({ newsItems = [] }) {
  if (!newsItems.length) return null;

  const sorted = [...newsItems]
    .sort((a, b) => (SIG_ORDER[a.significance] ?? 2) - (SIG_ORDER[b.significance] ?? 2))
    .slice(0, 8)
    .map((item, i) => ({
      idx: i + 1,
      sentiment: item.sentiment ?? 0,
      headline: (item.headline ?? item.title ?? "News").slice(0, 40),
      significance: item.significance ?? "medium",
    }));

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 10px" }}>
        News Sentiment Distribution
      </p>
      <div style={{ height: 140, background: "#FAFAFA", border: "1px solid #D8D8D8" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sorted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#E8E8E8" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="idx"
              tick={{ fill: "#A0A0A0", fontSize: 10, fontFamily: "Arial, sans-serif" }}
              axisLine={{ stroke: "#D0D0D0" }}
              tickLine={false}
            />
            <YAxis
              domain={[-1, 1]}
              ticks={[-1, 0, 1]}
              tick={{ fill: "#A0A0A0", fontSize: 10, fontFamily: "Arial, sans-serif" }}
              axisLine={{ stroke: "#D0D0D0" }}
              tickLine={false}
            />
            <ReferenceLine y={0} stroke="#C8C8C8" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #C8C8C8",
                borderRadius: 0,
                fontFamily: "Courier New, monospace",
                fontSize: 11,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              formatter={(v) => [Number(v).toFixed(2), "Sentiment"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.headline ?? ""}
            />
            <Area
              type="monotone"
              dataKey="sentiment"
              fill="#4E5944"
              fillOpacity={0.06}
              stroke="none"
              baseLine={0}
            />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#4E5944"
              strokeWidth={1.5}
              dot={({ cx, cy, payload }) => (
                <circle
                  key={`dot-${payload.idx}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={dotColor(payload.sentiment)}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              )}
              activeDot={{ r: 5, stroke: "#4E5944", strokeWidth: 1.5 }}
              isAnimationActive
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
