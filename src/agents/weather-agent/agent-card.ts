import type { AgentCard } from "@a2a-js/sdk";

export const weatherAgentCard: AgentCard = {
  name: "Weather Agent",
  description: "Provides weather information for any city",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: `http://localhost:${process.env.WEATHER_AGENT_PORT || 4000}/`,

  skills: [
    {
      id: "get_weather",
      name: "Get Weather",
      description: "Retrieves current weather forecast for a given city",
      tags: ["weather", "forecast", "temperature"],
      examples: [
        "What's the weather in Paris?",
        "Weather in Tokyo",
        "Forecast for London",
      ],
    },
  ],

  capabilities: {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true,
  },

  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain", "application/json"],

  provider: {
    organization: "A2A Tutorial",
    url: "https://a2a.dev",
  },
};
