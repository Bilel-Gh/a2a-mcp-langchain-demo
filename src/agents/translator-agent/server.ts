import express from "express";
import { config } from "dotenv";
import { translatorAgentCard } from "./agent-card.js";
import { TranslatorAgentExecutor } from "./executor.js";
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";

config();

const PORT = process.env.TRANSLATOR_AGENT_PORT || 4001;

// Créer l'exécuteur et le handler
const agentExecutor = new TranslatorAgentExecutor();
const requestHandler = new DefaultRequestHandler(
  translatorAgentCard,
  new InMemoryTaskStore(),
  agentExecutor
);

// Configure Express app with A2A
// the A2AExpressApp sets up the necessary routes for the agent
const appBuilder = new A2AExpressApp(requestHandler);
const expressApp = appBuilder.setupRoutes(express());

// Additional routes
expressApp.get("/", (req, res) => {
  res.json({
    agent: translatorAgentCard.name,
    status: "running",
    version: translatorAgentCard.version,
    agentCard: `http://localhost:${PORT}/.well-known/agent-card.json`,
  });
});

expressApp.listen(PORT, () => {
  console.log(`🌍 Translator Agent running on http://localhost:${PORT}`);
  console.log(
    `Agent Card available: http://localhost:${PORT}/.well-known/agent-card.json`
  );
});
