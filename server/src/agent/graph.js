import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchStateAnnotation } from "./state.js";
import { tickerResolverNode } from "./nodes/tickerResolver.js";
import { financialDataNode } from "./nodes/financialData.js";
import { newsSentimentNode } from "./nodes/newsSentiment.js";
import { webResearchNode } from "./nodes/webResearch.js";
import { competitorAnalysisNode } from "./nodes/competitorAnalysis.js";
import { analystNode } from "./nodes/analyst.js";
import { decisionNode } from "./nodes/decision.js";
import { reportBuilderNode } from "./nodes/reportBuilder.js";

const graph = new StateGraph(ResearchStateAnnotation)
  .addNode("ticker_resolver", tickerResolverNode)
  .addNode("financial_data", financialDataNode)
  .addNode("news_sentiment", newsSentimentNode)
  .addNode("web_research", webResearchNode)
  .addNode("competitor_analysis", competitorAnalysisNode)
  .addNode("analyst", analystNode)
  .addNode("decision", decisionNode)
  .addNode("report_builder", reportBuilderNode)
  .addEdge(START, "ticker_resolver")
  .addEdge("ticker_resolver", "financial_data")
  .addEdge("ticker_resolver", "news_sentiment")
  .addEdge("ticker_resolver", "web_research")
  .addEdge("ticker_resolver", "competitor_analysis")
  .addEdge("financial_data", "analyst")
  .addEdge("news_sentiment", "analyst")
  .addEdge("web_research", "analyst")
  .addEdge("competitor_analysis", "analyst")
  .addEdge("analyst", "decision")
  .addEdge("decision", "report_builder")
  .addEdge("report_builder", END);

export const researchGraph = graph.compile();
