import { useCallback } from "react";
import { useResearchContext } from "../context/ResearchContext.jsx";
import { useStreamParser } from "./useStreamParser.js";
import { getResearchUrl } from "../api/research.js";

export function useResearch() {
  const { state, dispatch } = useResearchContext();
  const { parseChunk } = useStreamParser();

  const startResearch = useCallback(
    async (companyName, riskAppetite = "medium") => {
      dispatch({
        type: "RESEARCH_START",
        payload: { companyName },
      });

      let buffer = "";
      let reader = null;
      let hasFinished = false;

      try {
        const response = await fetch(getResearchUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyName, riskAppetite }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          dispatch({
            type: "RESEARCH_ERROR",
            payload: errData.error ?? `Request failed (${response.status})`,
          });
          return;
        }

        reader = response.body?.getReader();
        if (!reader) {
          dispatch({
            type: "RESEARCH_ERROR",
            payload: "Connection lost. Please try again.",
          });
          return;
        }

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const { events, buffer: newBuffer } = parseChunk(text, buffer);
          buffer = newBuffer;

          for (const event of events) {
            dispatch({ type: "STREAM_EVENT", payload: event });

            if (event.type === "final_report") {
              hasFinished = true;
              dispatch({ type: "RESEARCH_COMPLETE", payload: event.data });
            } else if (
              event.type === "error" &&
              (event.node === "server" ||
                event.message?.includes("Could not find a stock ticker"))
            ) {
              hasFinished = true;
              dispatch({ type: "RESEARCH_ERROR", payload: event.message });
            }
          }
        }
      } catch (err) {
        hasFinished = true;
        dispatch({
          type: "RESEARCH_ERROR",
          payload: "Connection lost or server restarted. Please try again.",
        });
      } finally {
        if (reader) {
          try {
            reader.releaseLock();
          } catch {
            // Reader may already be released
          }
        }

        // If the stream ended but we didn't get a final payload, mark it as an error
        if (!hasFinished) {
          dispatch({
            type: "RESEARCH_ERROR",
            payload: "Research stream ended unexpectedly before completion.",
          });
        }
      }
    },
    [dispatch, parseChunk]
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

  return { state, startResearch, reset };
}
