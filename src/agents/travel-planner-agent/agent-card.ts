import type { AgentCard } from "@a2a-js/sdk";

export const travelPlannerAgentCard: AgentCard = {
  name: "Travel Planner Agent",
  description:
    "Master AI agent that plans complete trips by coordinating multiple specialized agents via A2A protocol",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: `http://localhost:${process.env.TRAVEL_PLANNER_AGENT_PORT || 4002}/`,

  skills: [
    {
      id: "plan_trip",
      name: "Plan Complete Trip",
      description:
        "Plan a complete trip including activities, weather, budget, and translation. Orchestrates multiple agents.",
      tags: ["travel", "planning", "orchestration", "a2a", "langgraph"],
      examples: [
        "Plan a trip to Tokyo from Paris in French",
        "I want to visit New York from London, report in English",
        "Plan my vacation to Barcelona from Berlin, report in Spanish",
      ],
    },
  ],

  capabilities: {
    streaming: true,
    pushNotifications: true,
    stateTransitionHistory: true,
  },

  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],

  provider: {
    organization: "A2A + MCP Tutorial",
    url: "https://a2a.dev",
  },
};
