import express from "express";
import { config } from "dotenv";
import { calculatorAgentCard } from "./agent-card.js";
import { CalculatorAgentExecutor } from "./executor.js";
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";
import { MockCalculatorAgentExecutor } from './mock-executor.js';

config();

const PORT = process.env.CALCULATOR_AGENT_PORT || 4004;
const USE_MOCK = process.env.USE_MOCK_DATA === "true";

const agentExecutor = USE_MOCK
  ? new MockCalculatorAgentExecutor() // temporary
  : new CalculatorAgentExecutor();
  
const requestHandler = new DefaultRequestHandler(
  calculatorAgentCard,
  new InMemoryTaskStore(),
  agentExecutor
);

const appBuilder = new A2AExpressApp(requestHandler);
const expressApp = appBuilder.setupRoutes(express());

expressApp.get("/", (req, res) => {
  res.json({
    agent: calculatorAgentCard.name,
    status: "running",
    version: calculatorAgentCard.version,
    agentCard: `http://localhost:${PORT}/.well-known/agent-card.json`,
    mcp: "Custom Math Server (STDIO)",
  });
});

expressApp.listen(PORT, () => {
  console.log(`Calculator Agent started on http://localhost:${PORT}`);
  console.log(
    `Agent Card: http://localhost:${PORT}/.well-known/agent-card.json`
  );
  console.log(`using MCP: Custom Math Server (STDIO mode)`);
});
