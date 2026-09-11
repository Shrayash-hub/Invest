/**
 * Parse SSE chunks into event objects with buffering for partial messages.
 */
export function useStreamParser() {
  /**
   * @param {string} rawText
   * @param {string} buffer
   * @returns {{ events: object[], buffer: string }}
   */
  function parseChunk(rawText, buffer) {
    const combined = buffer + rawText;
    const parts = combined.split("\n\n");
    const newBuffer = parts.pop() ?? "";
    const events = [];

    for (const part of parts) {
      const lines = part.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            events.push(JSON.parse(data));
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    }

    return { events, buffer: newBuffer };
  }

  return { parseChunk };
}
