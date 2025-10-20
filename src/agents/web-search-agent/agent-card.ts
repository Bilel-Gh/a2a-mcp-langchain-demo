import type { AgentCard } from "@a2a-js/sdk";

export const webSearchAgentCard: AgentCard = {
  name: "Web Search Agent",
  description:
    "AI agent that searches the web using Brave Search API via existing MCP server",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: `http://localhost:${process.env.WEB_SEARCH_AGENT_PORT || 4003}/`,

  skills: [
    {
      id: "search_travel_info",
      name: "Search Travel Info",
      description:
        "Search the web for travel information, attractions, activities, hotels, restaurants",
      tags: ["search", "brave", "travel", "web", "mcp"],
      examples: [
        "Search for best things to do in Tokyo",
        "Find top attractions in Paris",
        "What are popular activities in London",
        "Search for hotels in Barcelona",
      ],
    },
  ],

  capabilities: {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true,
  },

  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain"],

  provider: {
    organization: "A2A + MCP Tutorial",
    url: "https://a2a.dev",
  },
};
