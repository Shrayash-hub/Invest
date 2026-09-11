import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Building2,
  BarChart3,
  Newspaper,
  Users,
  AlertTriangle,
  FileText,
  Check,
  AlertCircle,
} from "lucide-react";
import FinancialMetricsGrid from "./FinancialMetricsGrid.jsx";
import SentimentGauge from "./SentimentGauge.jsx";
import PriceTargetVisualizer from "./PriceTargetVisualizer.jsx";
import { cn } from "../lib/utils.js";

const SECTION_CONFIG = {
  overview: { icon: Building2, color: "#4E5944" },
  financial: { icon: BarChart3, color: "#2d5a27" },
  sentiment: { icon: Newspaper, color: "#4E5944" },
  competitors: { icon: Users, color: "#6B6B6B" },
  factors: { icon: AlertTriangle, color: "#92620A" },
  thesis: { icon: FileText, color: "#4E5944" },
};

function CompetitorsTable({ data }) {
  if (!data) {
    return <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#6B6B6B", fontStyle: "italic" }}>Competitive analysis unavailable.</p>;
  }

  const competitors = data.mainCompetitors ?? [];
  const advantages = data.competitiveAdvantages ?? [];
  const disadvantages = data.competitiveDisadvantages ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {data.competitorSummary && (
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#4A4A4A", lineHeight: 1.7, whiteSpace: "pre-line", margin: 0 }}>
          {data.competitorSummary}
        </p>
      )}

      {competitors.length > 0 && (
        <div style={{ overflowX: "auto", border: "1px solid #C8C8C8" }}>
          <table className="corp-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>Competitor</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((name, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ display: "inline-flex", width: 24, height: 24, alignItems: "center", justifyContent: "center", background: "#F0F0F0", border: "1px solid #C8C8C8", fontFamily: "Courier New, monospace", fontSize: 11, color: "#4E5944", fontWeight: 700 }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ fontFamily: "Arial, sans-serif", color: "#2C2C2C" }}>{name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {advantages.length > 0 && (
          <div>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#2d5a27", fontWeight: 700, margin: "0 0 8px" }}>
              Advantages
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {advantages.map((item, i) => (
                <li key={i} style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#4A4A4A", display: "flex", gap: 6 }}>
                  <span style={{ color: "#4E5944", fontWeight: 700, flexShrink: 0 }}>+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {disadvantages.length > 0 && (
          <div>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9B2C2C", fontWeight: 700, margin: "0 0 8px" }}>
              Disadvantages
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {disadvantages.map((item, i) => (
                <li key={i} style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#4A4A4A", display: "flex", gap: 6 }}>
                  <span style={{ color: "#C53030", fontWeight: 700, flexShrink: 0 }}>−</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function FactorsSection({ data }) {
  const positives = data?.positiveFactors ?? [];
  const risks = data?.riskFactors ?? [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#2d5a27", fontWeight: 700, margin: "0 0 10px" }}>
          Positive Factors
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {positives.length > 0 ? (
            positives.map((factor, i) => (
              <li
                key={i}
                style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#2C2C2C", display: "flex", gap: 8, background: "#F0F7F0", borderLeft: "3px solid #4E5944", padding: "10px 14px" }}
              >
                <Check style={{ width: 14, height: 14, color: "#4E5944", flexShrink: 0, marginTop: 2 }} />
                {factor}
              </li>
            ))
          ) : (
            <li style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#6B6B6B", fontStyle: "italic" }}>No positive factors identified.</li>
          )}
        </ul>
      </div>
      <div>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9B2C2C", fontWeight: 700, margin: "0 0 10px" }}>
          Risk Factors
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {risks.length > 0 ? (
            risks.map((factor, i) => (
              <li
                key={i}
                style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#2C2C2C", display: "flex", gap: 8, background: "#FDF0F0", borderLeft: "3px solid #C53030", padding: "10px 14px" }}
              >
                <AlertCircle style={{ width: 14, height: 14, color: "#C53030", flexShrink: 0, marginTop: 2 }} />
                {factor}
              </li>
            ))
          ) : (
            <li style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#6B6B6B", fontStyle: "italic" }}>No risk factors identified.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function TextContent({ content, data, type }) {
  if (type === "overview" && data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontFamily: "Courier New, monospace", fontSize: 12, color: "#6B6B6B" }}>
          {data.companyName && (
            <span>Co: <span style={{ color: "#2C2C2C", fontWeight: 700 }}>{data.companyName}</span></span>
          )}
          {data.ticker && (
            <span>Ticker: <span style={{ color: "#2C2C2C", fontWeight: 700 }}>{data.ticker}</span></span>
          )}
          {data.exchange && (
            <span>Ex: <span style={{ color: "#2C2C2C", fontWeight: 700 }}>{data.exchange}</span></span>
          )}
        </div>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#4A4A4A", lineHeight: 1.75, margin: 0 }}>{content}</p>
      </div>
    );
  }

  return (
    <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#4A4A4A", lineHeight: 1.75, whiteSpace: "pre-line", margin: 0 }}>
      {content}
    </p>
  );
}

export default function ReportSection({ section, defaultOpen = true, index = 0 }) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = SECTION_CONFIG[section.type] ?? SECTION_CONFIG.thesis;
  const Icon = cfg.icon;

  const renderContent = () => {
    switch (section.type) {
      case "financial":
        return (
          <>
            <FinancialMetricsGrid data={section.data} />
            <PriceTargetVisualizer
              currentPrice={section.data?.currentPrice}
              analystTargetPrice={section.data?.analystTargetPrice}
              high52Week={section.data?.week52High}
              low52Week={section.data?.week52Low}
              currency={section.data?.currency ?? "USD"}
            />
          </>
        );
      case "sentiment":
        return <SentimentGauge data={section.data} />;
      case "competitors":
        return <CompetitorsTable data={section.data} />;
      case "factors":
        return <FactorsSection data={section.data} />;
      default:
        return (
          <TextContent content={section.content} data={section.data} type={section.type} />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{ background: "#FFFFFF", border: "1px solid #C8C8C8", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflow: "hidden" }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#F5F5F5",
          border: "none",
          borderBottom: open ? "1px solid #D0D0D0" : "none",
          padding: "14px 20px",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#ECECEC")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#F5F5F5")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon style={{ width: 15, height: 15, color: cfg.color }} />
          <h3 style={{ fontFamily: "Arial, sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#2C2C2C", margin: 0 }}>
            {section.title}
          </h3>
        </div>
        <ChevronDown
          style={{
            width: 14, height: 14, color: "#6B6B6B",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.25s",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ background: "#FFFFFF", padding: "20px 20px" }}>
              {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
