import { searchTavily } from "../tools/tavilySearch.js";
import { callFastLLM, safeParseJSON } from "../../lib/llm.js";
import {
  callWithRetry,
  getResponseText,
  getEmitter,
} from "../../lib/helpers.js";

const TICKER_SYSTEM_PROMPT = `You are a financial data assistant. Extract the stock ticker symbol and exchange from the search results provided.
Respond ONLY with raw JSON — no markdown, no backticks, no extra text:
{ "ticker": "AAPL", "exchange": "NASDAQ" }
If not found, return: { "ticker": null, "exchange": null }`;

/**
 * Resolve company name to ticker symbol and exchange.
 * @param {object} state
 * @param {object} config
 */
export async function tickerResolverNode(state, config) {
  const emitter = getEmitter(config);
  const nodeName = "tickerResolver";
  const streamEvents = [];

  const emit = (type, message, data = null) => {
    if (emitter) emitter.emitEvent(type, nodeName, message, data);
    streamEvents.push({ type, node: nodeName, message, data, timestamp: Date.now() });
  };

  try {
    emit("node_start", `Resolving ticker for ${state.companyName}`);

    const query = `${state.companyName} stock ticker symbol exchange`;
    emit("tool_call", `Searching: ${query}`);

    const searchResults = await searchTavily(query, 5);
    emit("tool_call", `Found ${searchResults.length} search results`, { count: searchResults.length });

    const searchContext = searchResults
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.url}`)
      .join("\n\n");

    const response = await callWithRetry(() =>
      callFastLLM([
        { role: "system", content: TICKER_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Company: ${state.companyName}

Important: Return the primary publicly listed ticker for "${state.companyName}" only. The ticker must match this exact company (e.g. Zomato is listed as ETERNAL on NSE, Apple as AAPL on NASDAQ). For Indian NSE listings use the current NSE symbol. For Yahoo Finance, NSE tickers use the base symbol without suffix.

Search Results:
${searchContext}`,
        },
      ])
    );

    emit("llm_thinking", "Extracting ticker and exchange from search results");

    const parsed = safeParseJSON(getResponseText(response));
    const ticker = parsed?.ticker ?? null;
    const exchange = parsed?.exchange ?? null;

    if (!ticker) {
      emit("error", `Could not resolve ticker for "${state.companyName}"`, { companyName: state.companyName });
    } else {
      emit("node_complete", `Resolved: ${ticker} on ${exchange ?? "Unknown exchange"}`, { ticker, exchange });
    }

    return {
      ticker,
      exchange,
      currentStep: "tickerResolved",
      streamEvents,
    };
  } catch (error) {
    const msg = `Ticker resolver error: ${error.message}`;
    emit("error", msg);
    return {
      ticker: null,
      exchange: null,
      currentStep: "tickerResolverError",
      errors: [msg],
      streamEvents,
    };
  }
}
