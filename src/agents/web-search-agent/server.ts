import express from "express";
import { config } from "dotenv";
import { webSearchAgentCard } from "./agent-card.js";
import { WebSearchAgentExecutor } from "./executor.js";
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";
import { MockWebSearchAgentExecutor } from './mock-executor.js';

config();

const PORT = process.env.WEB_SEARCH_AGENT_PORT || 4003;
const USE_MOCK = process.env.USE_MOCK_DATA === "true";

const agentExecutor = USE_MOCK 
  ? new MockWebSearchAgentExecutor() // temporary
  : new WebSearchAgentExecutor();

const requestHandler = new DefaultRequestHandler(
  webSearchAgentCard,
  new InMemoryTaskStore(),
  agentExecutor
);

const appBuilder = new A2AExpressApp(requestHandler);
const expressApp = appBuilder.setupRoutes(express());

expressApp.get("/", (req, res) => {
  res.json({
    agent: webSearchAgentCard.name,
    status: "running",
    version: webSearchAgentCard.version,
    agentCard: `http://localhost:${PORT}/.well-known/agent-card.json`,
    mcp: "Brave Search (STDIO)",
  });
});

expressApp.listen(PORT, () => {
  console.log(`Web Search Agent started on http://localhost:${PORT}`);
  console.log(
    `Agent Card: http://localhost:${PORT}/.well-known/agent-card.json`
  );
  console.log(`🔌 MCP: Brave Search`);
});
