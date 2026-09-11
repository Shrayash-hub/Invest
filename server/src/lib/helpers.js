import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Returns a configured Gemini 2.5 Flash LLM instance.
 * @param {object} [options]
 * @returns {ChatGoogleGenerativeAI}
 */
export function getLLM(options = {}) {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.3,
    maxOutputTokens: 8192,
    apiKey: process.env.GOOGLE_API_KEY,
    ...options,
  });
}

/**
 * LLM configured for structured JSON responses.
 * @returns {ChatGoogleGenerativeAI}
 */
export function getJsonLLM() {
  return getLLM({ json: true, maxOutputTokens: 8192 });
}

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff delay.
 * @param {Function} fn
 * @param {number} retries
 */
export async function callWithRetry(fn, retries = 2) {
  try {
    return await fn();
  } catch (e) {
    if (retries > 0) {
      await sleep(1000);
      return callWithRetry(fn, retries - 1);
    }
    throw e;
  }
}

/**
 * Attempt to close a truncated JSON string so it can be parsed.
 * @param {string} partial
 * @returns {string}
 */
function closePartialJson(partial) {
  let result = partial.trim();

  const openBrace = result.indexOf("{");
  if (openBrace > 0) {
    result = result.slice(openBrace);
  }

  const quoteCount = (result.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    result += '"';
  }

  result = result.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, "");
  result = result.replace(/,\s*$/, "");

  let braces = 0;
  let brackets = 0;
  for (const ch of result) {
    if (ch === "{") braces++;
    if (ch === "}") braces--;
    if (ch === "[") brackets++;
    if (ch === "]") brackets--;
  }

  while (brackets > 0) {
    result += "]";
    brackets--;
  }
  while (braces > 0) {
    result += "}";
    braces--;
  }

  return result;
}

/**
 * Extract known fields from malformed JSON text as a last resort.
 * @param {string} text
 * @returns {object|null}
 */
function extractJsonFields(text) {
  const result = {};

  const stringField = (key) => {
    const match = text.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "s"));
    return match ? match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n") : null;
  };

  const arrayField = (key) => {
    const match = text.match(new RegExp(`"${key}"\\s*:\\s*(\\[[\\s\\S]*?\\])`));
    if (!match) return null;
    try {
      return JSON.parse(match[1]);
    } catch {
      const items = [...match[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) =>
        m[1].replace(/\\"/g, '"')
      );
      return items.length ? items : null;
    }
  };

  const executiveSummary = stringField("executiveSummary");
  const analystCommentary = stringField("analystCommentary");
  const reasoning = stringField("reasoning");
  const competitorSummary = stringField("competitorSummary");
  const summary = stringField("summary");
  const verdict = stringField("verdict");
  const positiveFactors = arrayField("positiveFactors");
  const riskFactors = arrayField("riskFactors");
  const mainCompetitors = arrayField("mainCompetitors");

  const sentimentMatch = text.match(/"overallSentiment"\s*:\s*(-?\d+(?:\.\d+)?)/);
  const confidenceMatch = text.match(/"confidenceScore"\s*:\s*(\d+)/);

  if (executiveSummary) result.executiveSummary = executiveSummary;
  if (analystCommentary) result.analystCommentary = analystCommentary;
  if (reasoning) result.reasoning = reasoning;
  if (competitorSummary) result.competitorSummary = competitorSummary;
  if (summary) result.summary = summary;
  if (verdict) result.verdict = verdict;
  if (positiveFactors) result.positiveFactors = positiveFactors;
  if (riskFactors) result.riskFactors = riskFactors;
  if (mainCompetitors) result.mainCompetitors = mainCompetitors;
  if (sentimentMatch) result.overallSentiment = Number(sentimentMatch[1]);
  if (confidenceMatch) result.confidenceScore = Number(confidenceMatch[1]);

  const tickerMatch = text.match(/"ticker"\s*:\s*"([^"]+)"/);
  const exchangeMatch = text.match(/"exchange"\s*:\s*"([^"]+)"/);
  if (tickerMatch) result.ticker = tickerMatch[1];
  if (exchangeMatch) result.exchange = exchangeMatch[1];

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Parse JSON from LLM response, stripping markdown fences if needed.
 * @param {string} raw
 * @returns {object|null}
 */
export function parseJsonResponse(raw) {
  if (!raw) return null;

  const text = typeof raw === "string" ? raw : raw.content ?? String(raw);
  const clean = text.replace(/```json|```/g, "").trim();

  const attempts = [text.trim(), clean, closePartialJson(clean)];

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch {
      // try next strategy
    }
  }

  const extracted = extractJsonFields(clean);
  if (extracted) {
    console.warn("JSON partially recovered from truncated LLM response");
    return extracted;
  }

  console.error("JSON parse failed:", clean.slice(0, 500));
  return null;
}

/**
 * Extract text content from an LLM response.
 * @param {import("@langchain/core/messages").AIMessage} response
 * @returns {string}
 */
export function getResponseText(response) {
  if (typeof response.content === "string") {
    return response.content;
  }
  if (Array.isArray(response.content)) {
    return response.content.map((c) => c.text ?? c).join("");
  }
  return String(response.content ?? "");
}

/**
 * Get emitter from LangGraph runnable config.
 * @param {object} config
 */
export function getEmitter(config) {
  return config?.configurable?.emitter ?? null;
}
