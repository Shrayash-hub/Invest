import { getEmitter } from "../../lib/helpers.js";

/**
 * Build structured report sections from final state.
 * @param {object} state
 * @param {object} config
 */
export async function reportBuilderNode(state, config) {
  const emitter = getEmitter(config);
  const nodeName = "reportBuilder";
  const streamEvents = [];

  const emit = (type, message, data = null) => {
    if (emitter) emitter.emitEvent(type, nodeName, message, data);
    streamEvents.push({ type, node: nodeName, message, data, timestamp: Date.now() });
  };

  try {
    emit("node_start", "Building research report");

    const executiveSummary =
      state.analystSummary?.executiveSummary ??
      `Research report for ${state.companyName}.`;

    const reportSections = [
      {
        id: "overview",
        title: "Company Overview",
        type: "overview",
        content: executiveSummary,
        data: {
          companyName: state.companyName,
          ticker: state.ticker,
          exchange: state.exchange,
        },
      },
      {
        id: "financial",
        title: "Financial Health",
        type: "financial",
        content: state.financialData
          ? `Financial metrics for ${state.ticker ?? state.companyName}.`
          : "Financial data was unavailable for this company.",
        data: state.financialData,
      },
      {
        id: "sentiment",
        title: "News & Sentiment",
        type: "sentiment",
        content:
          state.analystSummary?.executiveSummary ??
          "Recent news and sentiment analysis.",
        data: {
          newsResults: state.newsResults,
          sentimentScore: state.sentimentScore,
        },
      },
      {
        id: "competitors",
        title: "Competitive Analysis",
        type: "competitors",
        content: state.competitorAnalysis?.competitorSummary ?? "Competitive analysis unavailable.",
        data: state.competitorAnalysis,
      },
      {
        id: "factors",
        title: "Risk Assessment",
        type: "factors",
        content: "Key positive factors and risk factors identified during analysis.",
        data: {
          positiveFactors: state.positiveFactors ?? [],
          riskFactors: state.riskFactors ?? [],
        },
      },
      {
        id: "thesis",
        title: "Investment Thesis",
        type: "thesis",
        content:
          state.analystSummary?.analystCommentary ??
          "Detailed investment thesis unavailable.",
        data: null,
      },
    ];

    emit("node_complete", `Report built with ${reportSections.length} sections`);

    return {
      reportSections,
      currentStep: "reportComplete",
      streamEvents,
    };
  } catch (error) {
    const msg = `Report builder error: ${error.message}`;
    emit("error", msg);
    return {
      reportSections: [],
      currentStep: "reportBuilderError",
      errors: [msg],
      streamEvents,
    };
  }
}
