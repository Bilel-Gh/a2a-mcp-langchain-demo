import type { AgentCard } from "@a2a-js/sdk";

export const calculatorAgentCard: AgentCard = {
  name: "Calculator Agent",
  description:
    "AI agent that performs mathematical calculations via custom MCP server",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: `http://localhost:${process.env.CALCULATOR_AGENT_PORT || 4004}/`,

  skills: [
    {
      id: "calculate",
      name: "Calculate",
      description:
        "Perform math operations and budget calculations for travel planning",
      tags: ["math", "calculator", "budget", "mcp"],
      examples: [
        "Calculate 150 times 7",
        "What is 50 + 75?",
        "Calculate trip budget for 7 nights at $150/night",
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
