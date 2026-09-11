import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Trash2 } from "lucide-react";
import { useResearchContext } from "../context/ResearchContext.jsx";
import { formatRelativeTime, cn } from "../lib/utils.js";

const TYPE_CONFIG = {
  node_start: { tag: "NODE_START", color: "#4E5944" },
  node_complete: { tag: "COMPLETE ", color: "#2d5a27" },
  tool_call: { tag: "TOOL_CALL", color: "#B7791F" },
  llm_thinking: { tag: "LLM      ", color: "#6B6B6B" },
  final_report: { tag: "REPORT   ", color: "#4E5944" },
  error: { tag: "ERROR    ", color: "#C53030" },
};

export default function ReasoningTrace() {
  const { state } = useResearchContext();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(false);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);

  const events = state.streamEvents;
  const visibleEvents = hidden ? [] : events;

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length, open]);

  if (events.length === 0) return null;

  const handleCopy = async () => {
    const text = events
      .map(
        (e) =>
          `[${formatRelativeTime(e.timestamp, state.startTime)}] [${TYPE_CONFIG[e.type]?.tag?.trim() ?? e.type}] ${e.message}`
      )
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px" }}>
      <div style={{ border: "1px solid #C8C8C8", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        {/* Toggle header */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: "#F5F5F5",
            border: "none",
            borderBottom: open ? "1px solid #D0D0D0" : "none",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#ECECEC")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F5F5F5")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "Arial, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#2C2C2C" }}>
              Agent Reasoning Trace
            </span>
            <span style={{ fontFamily: "Courier New, monospace", fontSize: 10, background: "#E8E8E8", border: "1px solid #C8C8C8", color: "#6B6B6B", padding: "1px 7px" }}>
              {events.length} events
            </span>
          </div>
          {open ? (
            <ChevronUp style={{ width: 14, height: 14, color: "#6B6B6B" }} />
          ) : (
            <ChevronDown style={{ width: 14, height: 14, color: "#6B6B6B" }} />
          )}
        </button>

        {/* Log panel */}
        {open && (
          <div style={{ position: "relative", background: "#FAFAFA" }}>
            {/* Toolbar */}
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6, zIndex: 10 }}>
              <button
                onClick={() => setHidden(true)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "#FFFFFF", border: "1px solid #C8C8C8", fontFamily: "Courier New, monospace", fontSize: 10, color: "#6B6B6B", cursor: "pointer" }}
              >
                <Trash2 style={{ width: 11, height: 11 }} />
                Clear
              </button>
              <button
                onClick={handleCopy}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "#FFFFFF", border: "1px solid #C8C8C8", fontFamily: "Courier New, monospace", fontSize: 10, color: "#6B6B6B", cursor: "pointer" }}
              >
                {copied ? <Check style={{ width: 11, height: 11 }} /> : <Copy style={{ width: 11, height: 11 }} />}
                {copied ? "Copied" : "Copy All"}
              </button>
            </div>

            {/* Log output */}
            <div
              ref={scrollRef}
              style={{ padding: "12px 16px 12px", paddingTop: 36, maxHeight: 320, overflowY: "auto", fontFamily: "Courier New, monospace", fontSize: 11, lineHeight: 1.7, color: "#4A4A4A" }}
            >
              {visibleEvents.map((event, i) => {
                const config = TYPE_CONFIG[event.type] ?? {
                  tag: (event.type ?? "UNKNOWN").toUpperCase().padEnd(9),
                  color: "#6B6B6B",
                };
                const isLast = i === visibleEvents.length - 1;

                return (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2 }}>
                    <span style={{ color: "#A0A0A0", flexShrink: 0, width: 52 }}>
                      {formatRelativeTime(event.timestamp, state.startTime)}
                    </span>
                    <span style={{ flexShrink: 0, color: config.color, fontWeight: 700 }}>
                      [{config.tag}]
                    </span>
                    <span style={{ color: "#2C2C2C", wordBreak: "break-all" }} className={isLast ? "terminal-cursor" : ""}>
                      {event.message}
                    </span>
                  </div>
                );
              })}
              {hidden && (
                <p style={{ color: "#A0A0A0", fontStyle: "italic" }}>
                  Trace cleared from view. Reload research to see new events.
                </p>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
