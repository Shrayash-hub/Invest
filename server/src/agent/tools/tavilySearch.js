import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";

/**
 * Get all configured Tavily API keys from the environment.
 * Reads: TAVILY_API_KEY, TAVILY_API_KEY_1, ... TAVILY_API_KEY_4
 * @returns {string[]}
 */
function getTavilyKeys() {
  const keys = ["", "_1", "_2", "_3", "_4"]
    .map((suffix) => process.env[`TAVILY_API_KEY${suffix}`]?.trim())
    .filter(Boolean)
    .filter((k) => !k.includes("your_") && !k.endsWith("_here"));
  return [...new Set(keys)];
}

/**
 * Run a Tavily web search, trying multiple keys if rate limited.
 * @param {string} query
 * @param {number} maxResults
 * @returns {Promise<Array<{title: string, snippet: string, url: string}>>}
 */
export async function searchTavily(query, maxResults = 5) {
  const keys = getTavilyKeys();

  if (keys.length === 0) {
    console.warn(`[Tavily] Search skipped — no API keys configured`);
    return [];
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const tag = keys.length > 1 ? ` key ${i + 1}/${keys.length}` : "";
    
    try {
      const tool = new TavilySearchAPIRetriever({
        k: maxResults,
        apiKey: key,
      });

      const docs = await tool.invoke(query);

      if (!Array.isArray(docs)) {
        return [];
      }

      console.log(`[Tavily] Search${tag} ✓`);
      
      return docs.slice(0, maxResults).map((doc) => ({
        title: doc.metadata?.title ?? "Untitled",
        snippet: doc.pageContent ?? "",
        url: doc.metadata?.source ?? doc.metadata?.url ?? "",
      }));
    } catch (error) {
      console.warn(`[Tavily] Search${tag} failed: ${error.message}`);
      // Continue to the next key if available
    }
  }

  console.warn(`[Tavily] All ${keys.length} key(s) exhausted`);
  return [];
}
