import express from "express";
import { config } from "dotenv";
import { travelPlannerAgentCard } from "./agent-card.js";
import { TravelPlannerAgentExecutor } from "./executor.js";
import {
  DefaultRequestHandler,
  InMemoryTaskStore,
  InMemoryPushNotificationStore,
  DefaultPushNotificationSender,
} from "@a2a-js/sdk/server";
import { A2AExpressApp } from "@a2a-js/sdk/server/express";

config();

const PORT = process.env.TRAVEL_PLANNER_AGENT_PORT || 4002;
const taskStore = new InMemoryTaskStore();
const pushStore = new InMemoryPushNotificationStore();
const pushSender = new DefaultPushNotificationSender(pushStore);

const agentExecutor = new TravelPlannerAgentExecutor();
const requestHandler = new DefaultRequestHandler(
  travelPlannerAgentCard,
  taskStore,
  agentExecutor,
  undefined,
  pushStore,
  pushSender
);

const appBuilder = new A2AExpressApp(requestHandler);
const expressApp = appBuilder.setupRoutes(express());

expressApp.get("/", (req, res) => {
  res.json({
    agent: travelPlannerAgentCard.name,
    status: "running",
    version: travelPlannerAgentCard.version,
    agentCard: `http://localhost:${PORT}/.well-known/agent-card.json`,
    pushNotifications: "ENABLED",
  });
});

expressApp.listen(PORT, () => {
  console.log(`[Travel Planner] Server started on port ${PORT}`);
});
