import { searchTavily } from "../tools/tavilySearch.js";
import { callFastLLM, safeParseJSON } from "../../lib/llm.js";
import {
  callWithRetry,
  getResponseText,
  getEmitter,
} from "../../lib/helpers.js";

const NEWS_SENTIMENT_SYSTEM_PROMPT = `You are a financial news analyst. Analyze these news items about a company and return a sentiment analysis.
Respond ONLY with raw JSON — no markdown, no backticks, no extra text:
{
  "overallSentiment": <number from -1 to 1>,
  "summary": "<2-3 sentence overall summary>",
  "newsItems": [
    {
      "headline": "<string>",
      "sentiment": <number from -1 to 1>,
      "significance": "high" or "medium" or "low",
      "url": "<source url>"
    }
  ]
}`;

/**
 * Analyze news sentiment for a company.
 * @param {object} state
 * @param {object} config
 */
export async function newsSentimentNode(state, config) {
  const emitter = getEmitter(config);
  const nodeName = "newsSentiment";
  const streamEvents = [];

  const emit = (type, message, data = null) => {
    if (emitter) emitter.emitEvent(type, nodeName, message, data);
    streamEvents.push({ type, node: nodeName, message, data, timestamp: Date.now() });
  };

  try {
    emit("node_start", `Analyzing news sentiment for ${state.companyName}`);

    const query1 = `${state.companyName} news last 30 days`;
    const query2 = `${state.companyName} earnings results announcement`;

    emit("tool_call", `Searching: ${query1}`);
    emit("tool_call", `Searching: ${query2}`);

    const [results1, results2] = await Promise.all([
      searchTavily(query1, 5),
      searchTavily(query2, 5),
    ]);

    const allResults = [...results1, ...results2];
    const seen = new Set();
    const newsResults = [];

    for (const item of allResults) {
      const key = item.url || item.title;
      if (!seen.has(key)) {
        seen.add(key);
        newsResults.push(item);
      }
      if (newsResults.length >= 10) break;
    }

    emit("tool_call", `Collected ${newsResults.length} news articles`);

    const newsContext = newsResults
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.url}`)
      .join("\n\n");

    emit("llm_thinking", "Analyzing news sentiment with AI");

    const response = await callWithRetry(() =>
      callFastLLM([
        { role: "system", content: NEWS_SENTIMENT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Company: ${state.companyName}\n\nNews Items:\n${newsContext || "No news found."}`,
        },
      ])
    );

    const parsed = safeParseJSON(getResponseText(response));
    const sentimentScore = parsed?.overallSentiment ?? null;

    const enrichedNews = parsed?.newsItems?.length
      ? parsed.newsItems
      : newsResults.map((r) => ({
        headline: r.title,
        sentiment: 0,
        significance: "medium",
        url: r.url,
      }));

    emit("node_complete", `Sentiment score: ${sentimentScore ?? "N/A"}`, { sentimentScore });

    return {
      newsResults: enrichedNews,
      sentimentScore,
      currentStep: "newsSentimentComplete",
      streamEvents,
      errors: parsed ? [] : ["Failed to parse news sentiment JSON response"],
    };
  } catch (error) {
    const msg = `News sentiment error: ${error.message}`;
    emit("error", msg);
    return {
      newsResults: [],
      sentimentScore: null,
      currentStep: "newsSentimentError",
      errors: [msg],
      streamEvents,
    };
  }
}
