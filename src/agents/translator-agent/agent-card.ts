import type { AgentCard } from "@a2a-js/sdk";

export const translatorAgentCard: AgentCard = {
  name: "Translator Agent",
  description: "Translates text into different languages using Google Gemini",
  protocolVersion: "0.3.0",
  version: "1.0.0",
  url: `http://localhost:${process.env.TRANSLATOR_AGENT_PORT || 4001}/`,

  skills: [
    {
      id: "translate_text",
      name: "Translate Text",
      description: "Translates text into the specified target language",
      tags: ["translation", "language", "localization"],
      examples: [
        "Traduire en français",
        "Translate to English",
        "Traducir al español",
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
    organization: "A2A Tutorial",
    url: "https://a2a.dev",
  },
};
