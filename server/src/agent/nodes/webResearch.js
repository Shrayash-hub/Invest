import { searchTavily } from "../tools/tavilySearch.js";
import { getEmitter } from "../../lib/helpers.js";

const SEARCH_QUERIES = [
  (company) => `${company} business model revenue streams 2024`,
  (company) => `${company} competitive advantages moat`,
  (company) => `${company} risks challenges problems 2024`,
  (company) => `${company} growth prospects future outlook`,
];

/**
 * Run parallel web research searches.
 * @param {object} state
 * @param {object} config
 */
export async function webResearchNode(state, config) {
  const emitter = getEmitter(config);
  const nodeName = "webResearch";
  const streamEvents = [];

  const emit = (type, message, data = null) => {
    if (emitter) emitter.emitEvent(type, nodeName, message, data);
    streamEvents.push({ type, node: nodeName, message, data, timestamp: Date.now() });
  };

  try {
    emit("node_start", `Running web research for ${state.companyName}`);

    const queries = SEARCH_QUERIES.map((fn) => fn(state.companyName));

    const searchPromises = queries.map(async (query) => {
      emit("tool_call", `Searching: ${query}`);
      const results = await searchTavily(query, 5);
      return { query, results };
    });

    const searchResults = await Promise.all(searchPromises);

    const webResearch = searchResults.flatMap(({ query, results }) =>
      results.map((r) => ({
        query,
        title: r.title,
        snippet: r.snippet,
        url: r.url,
      }))
    );

    emit("node_complete", `Collected ${webResearch.length} web research results`, {
      count: webResearch.length,
    });

    return {
      webResearch,
      currentStep: "webResearchComplete",
      streamEvents,
    };
  } catch (error) {
    const msg = `Web research error: ${error.message}`;
    emit("error", msg);
    return {
      webResearch: [],
      currentStep: "webResearchError",
      errors: [msg],
      streamEvents,
    };
  }
}
