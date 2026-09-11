import { createContext, useContext, useReducer } from "react";

const initialState = {
  status: "idle",
  companyName: null,
  streamEvents: [],
  currentStep: null,
  report: null,
  error: null,
  startTime: null,
};

function researchReducer(state, action) {
  switch (action.type) {
    case "RESEARCH_START":
      return {
        ...initialState,
        status: "loading",
        companyName: action.payload.companyName,
        startTime: Date.now(),
      };

    case "STREAM_EVENT":
      return {
        ...state,
        streamEvents: [...state.streamEvents, action.payload],
        currentStep: action.payload.node ?? state.currentStep,
      };

    case "RESEARCH_COMPLETE":
      return {
        ...state,
        status: "complete",
        report: action.payload,
      };

    case "RESEARCH_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

const ResearchContext = createContext(null);

export function ResearchProvider({ children }) {
  const [state, dispatch] = useReducer(researchReducer, initialState);

  return (
    <ResearchContext.Provider value={{ state, dispatch }}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearchContext() {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error("useResearchContext must be used within ResearchProvider");
  }
  return context;
}
