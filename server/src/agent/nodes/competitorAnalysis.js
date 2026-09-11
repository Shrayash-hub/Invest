import { searchTavily } from "../tools/tavilySearch.js";
import { callSmartLLM, safeParseJSON } from "../../lib/llm.js";
import {
  callWithRetry,
  getResponseText,
  getEmitter,
} from "../../lib/helpers.js";

const COMPETITOR_SYSTEM_PROMPT = `You are a competitive intelligence analyst. Analyze this company's competitive positioning from the search results.
Respond ONLY with raw JSON — no markdown, no backticks, no extra text:
{
  "mainCompetitors": ["<name>", "<name>", "<name>"],
  "competitiveAdvantages": ["<string>", "<string>"],
  "competitiveDisadvantages": ["<string>", "<string>"],
  "competitorSummary": "<3-4 paragraph analysis>"
}`;

/**
 * Analyze competitive landscape for a company.
 * @param {object} state
 * @param {object} config
 */
export async function competitorAnalysisNode(state, config) {
  const emitter = getEmitter(config);
  const nodeName = "competitorAnalysis";
  const streamEvents = [];

  const emit = (type, message, data = null) => {
    if (emitter) emitter.emitEvent(type, nodeName, message, data);
    streamEvents.push({ type, node: nodeName, message, data, timestamp: Date.now() });
  };

  try {
    emit("node_start", `Analyzing competitors for ${state.companyName}`);

    const query = `${state.companyName} main competitors market share`;
    emit("tool_call", `Searching: ${query}`);

    const searchResults = await searchTavily(query, 8);

    const searchContext = searchResults
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.url}`)
      .join("\n\n");

    emit("llm_thinking", "Analyzing competitive landscape with AI");

    const response = await callWithRetry(() =>
      callSmartLLM([
        { role: "system", content: COMPETITOR_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Company: ${state.companyName}\n\nSearch Results:\n${searchContext || "No results found."}`,
        },
      ])
    );

    const competitorAnalysis = safeParseJSON(getResponseText(response));

    if (competitorAnalysis) {
      emit("node_complete", `Identified ${competitorAnalysis.mainCompetitors?.length ?? 0} main competitors`);
    } else {
      emit("error", "Failed to parse competitor analysis response");
      emit("node_complete", "Competitor analysis completed with limited data");
    }

    return {
      competitorAnalysis,
      currentStep: "competitorAnalysisComplete",
      streamEvents,
      errors: competitorAnalysis ? [] : ["Failed to parse competitor analysis JSON"],
    };
  } catch (error) {
    const msg = `Competitor analysis error: ${error.message}`;
    emit("error", msg);
    return {
      competitorAnalysis: null,
      currentStep: "competitorAnalysisError",
      errors: [msg],
      streamEvents,
    };
  }
}
