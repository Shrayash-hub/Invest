import { formatCurrency, cn } from "../lib/utils.js";

export default function PriceTargetVisualizer({
  currentPrice,
  analystTargetPrice,
  high52Week,
  low52Week,
  currency = "USD",
}) {
  const low = low52Week ?? currentPrice;
  const high = high52Week ?? currentPrice;
  const current = currentPrice;
  const target = analystTargetPrice;

  if (!current && !target && !low && !high) {
    return (
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#6B6B6B", fontStyle: "italic" }}>
        Price target data unavailable.
      </p>
    );
  }

  const rangeMin = Math.min(
    low ?? current ?? target ?? 0,
    current ?? target ?? 0,
    target ?? current ?? 0,
  );
  const rangeMax = Math.max(
    high ?? current ?? target ?? 0,
    current ?? target ?? 0,
    target ?? current ?? 0,
  );
  const span = rangeMax - rangeMin || 1;

  const pct = (v) => `${Math.min(100, Math.max(0, ((v - rangeMin) / span) * 100))}%`;

  let upsideBadge = null;
  if (current && target) {
    const diff = ((target - current) / current) * 100;
    upsideBadge = {
      text: diff >= 0 ? `Upside: +${diff.toFixed(1)}%` : `Downside: ${diff.toFixed(1)}%`,
      positive: diff >= 0,
    };
  }

  const rangeLeft = low != null ? pct(low) : "0%";
  const rangeWidth =
    low != null && high != null
      ? `${Math.min(100, ((high - low) / span) * 100)}%`
      : "100%";

  return (
    <div style={{ marginTop: 20, padding: "16px 20px", background: "#FAFAFA", border: "1px solid #D0D0D0" }}>
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B6B6B", fontWeight: 700, margin: "0 0 20px" }}>
        Price vs Analyst Target
      </p>

      <div style={{ position: "relative", height: 40, marginBottom: 28 }}>
        {/* Full track */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", height: 8, background: "#E0E0E0" }} />
        {/* 52W range highlight */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            height: 8,
            background: "rgba(78,89,68,0.18)",
            left: rangeLeft,
            width: rangeWidth,
          }}
        />

        {/* Current price dot */}
        {current != null && (
          <div
            style={{ position: "absolute", top: "50%", transform: "translateY(-50%) translateX(-50%)", left: pct(current) }}
            title={`Current: ${formatCurrency(current, currency)}`}
          >
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#2C2C2C", border: "2px solid #6B6B6B", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontFamily: "Courier New, monospace", fontSize: 10, color: "#2C2C2C", fontWeight: 700 }}>
              {formatCurrency(current, currency)}
            </div>
          </div>
        )}

        {/* Target price marker — diamond */}
        {target != null && (
          <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%) translateX(-50%)", left: pct(target) }}>
            {upsideBadge && (
              <div
                style={{
                  position: "absolute",
                  bottom: 18,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  fontFamily: "Courier New, monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 7px",
                  ...(upsideBadge.positive
                    ? { background: "#E8F0E6", color: "#2d5a27", border: "1px solid #A8C0A0" }
                    : { background: "#FDF0F0", color: "#9B2C2C", border: "1px solid #E8B0B0" }),
                }}
              >
                {upsideBadge.text}
              </div>
            )}
            <div
              style={{
                width: 12,
                height: 12,
                transform: "rotate(45deg)",
                border: "2px solid",
                ...(target >= (current ?? 0)
                  ? { background: "#4E5944", borderColor: "#3a4333" }
                  : { background: "#C53030", borderColor: "#9B2C2C" }),
              }}
            />
            <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontFamily: "Courier New, monospace", fontSize: 10, color: "#6B6B6B" }}>
              {formatCurrency(target, currency)}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#6B6B6B", textTransform: "uppercase" }}>
          52W Low {low != null ? formatCurrency(low, currency) : "N/A"}
        </span>
        <span style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#6B6B6B", textTransform: "uppercase" }}>
          52W High {high != null ? formatCurrency(high, currency) : "N/A"}
        </span>
      </div>
    </div>
  );
}
