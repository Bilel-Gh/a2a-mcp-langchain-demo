import express from "express";
import { config } from "dotenv";
import { weatherAgentCard } from "./agent-card.js";
import { WeatherAgentExecutor } from "./executor.js";
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";

config();

const PORT = process.env.WEATHER_AGENT_PORT || 4000;

const agentExecutor = new WeatherAgentExecutor();
const requestHandler = new DefaultRequestHandler(
  weatherAgentCard,
  new InMemoryTaskStore(),
  agentExecutor
);

const appBuilder = new A2AExpressApp(requestHandler);
const expressApp = appBuilder.setupRoutes(express());

expressApp.get("/", (req, res) => {
  res.json({
    agent: weatherAgentCard.name,
    status: "running",
    version: weatherAgentCard.version,
    agentCard: `http://localhost:${PORT}/.well-known/agent-card.json`,
  });
});

expressApp.listen(PORT, () => {
  console.log(`[Weather Agent] Server started on port ${PORT}`);
});
