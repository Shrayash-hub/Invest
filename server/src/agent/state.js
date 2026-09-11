import { Annotation } from "@langchain/langgraph";

export const ResearchStateAnnotation = Annotation.Root({
  companyName: Annotation({ reducer: (a, b) => b ?? a, default: () => "" }),
  riskAppetite: Annotation({ reducer: (a, b) => b ?? a, default: () => "medium" }),
  ticker: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
  exchange: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
  financialData: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
  newsResults: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  webResearch: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  competitorAnalysis: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
  sentimentScore: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
  analystSummary: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
  riskFactors: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  positiveFactors: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  verdict: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
  confidenceScore: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
  reasoning: Annotation({ reducer: (a, b) => b ?? a, default: () => null }),
  reportSections: Annotation({ reducer: (a, b) => b ?? a, default: () => [] }),
  currentStep: Annotation({ reducer: (a, b) => b ?? a, default: () => "" }),
  streamEvents: Annotation({
    reducer: (a, b) => [...(a ?? []), ...(b ?? [])],
    default: () => [],
  }),
  errors: Annotation({
    reducer: (a, b) => [...(a ?? []), ...(b ?? [])],
    default: () => [],
  }),
});
