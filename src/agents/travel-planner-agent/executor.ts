import { v4 as uuidv4 } from "uuid";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { A2AClient } from "@a2a-js/sdk/client";
import { MessageSendParams } from "@a2a-js/sdk";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type { Message } from "@a2a-js/sdk";
import {
  getMockWebSearch,
  getMockWeather,
  getMockCalculation,
  getMockItinerary,
  getMockTranslation,
} from "./mock-data.js";

export class TravelPlannerAgentExecutor implements AgentExecutor {
  private model: ChatGoogleGenerativeAI | null = null;
  private webSearchClient: A2AClient | null = null;
  private weatherClient: A2AClient | null = null;
  private calculatorClient: A2AClient | null = null;
  private translatorClient: A2AClient | null = null;
  private useMock: boolean;

  constructor() {
    this.useMock = process.env.USE_MOCK_DATA === "true";

    if (!this.useMock) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is required in .env");
      }

      this.model = new ChatGoogleGenerativeAI({
        apiKey: apiKey,
        model: "gemini-2.0-flash-exp",
        temperature: 0.7,
      });
    }

    console.log(`[Travel Planner] Mode: ${this.useMock ? "MOCK" : "LIVE"}`);
  }

  private async initializeA2AClients() {
    if (this.webSearchClient) return;

    const WEB_SEARCH_URL = `http://localhost:${process.env.WEB_SEARCH_AGENT_PORT || 4003}`;
    const WEATHER_URL = `http://localhost:${process.env.WEATHER_AGENT_PORT || 4000}`;
    const CALCULATOR_URL = `http://localhost:${process.env.CALCULATOR_AGENT_PORT || 4004}`;
    const TRANSLATOR_URL = `http://localhost:${process.env.TRANSLATOR_AGENT_PORT || 4001}`;

    try {
      this.webSearchClient = await A2AClient.fromCardUrl(`${WEB_SEARCH_URL}/.well-known/agent-card.json`);
      this.weatherClient = await A2AClient.fromCardUrl(`${WEATHER_URL}/.well-known/agent-card.json`);
      this.calculatorClient = await A2AClient.fromCardUrl(`${CALCULATOR_URL}/.well-known/agent-card.json`);
      this.translatorClient = await A2AClient.fromCardUrl(`${TRANSLATOR_URL}/.well-known/agent-card.json`);

      console.log("[Travel Planner] Connected to all agents");
    } catch (error: any) {
      console.error("[Travel Planner] Failed to connect to agents:", error.message);
      throw new Error(`Failed to connect to agents: ${error.message}`);
    }
  }

  private parseUserInput(text: string): {
    destination: string;
    departure: string;
    language: string;
  } {
    const parts = text.split(",").map((p) => p.trim());
    return {
      destination: parts[0] || "Tokyo",
      departure: parts[1] || "Paris",
      language: parts[2] || "English",
    };
  }

  private async callAgent(client: A2AClient, agentName: string, query: string): Promise<string> {
    console.log(`[Travel Planner] Calling ${agentName}`);

    const params: MessageSendParams = {
      message: {
        messageId: uuidv4(),
        role: "user",
        parts: [{ kind: "text", text: query }],
        kind: "message",
      },
    };

    const stream = client.sendMessageStream(params);
    let finalResponse = "";

    try {
      for await (const event of stream) {
        if (event.kind === "message" && event.role === "agent") {
          const text = event.parts
            .filter((p) => p.kind === "text")
            .map((p) => (p as any).text)
            .join(" ");
          if (text) finalResponse = text;
        }
      }

      console.log(`[Travel Planner] ${agentName} completed`);
      return finalResponse;
    } catch (error: any) {
      console.error(`[Travel Planner] ${agentName} failed:`, error.message);
      throw new Error(`${agentName} failed: ${error.message}`);
    }
  }

  private async getActivitiesInfo(destination: string): Promise<string> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = getMockWebSearch(destination);
      console.log(`[Travel Planner] Activities found: ${result.substring(0, 80)}...`);
      return result;
    }
    const result = await this.callAgent(
      this.webSearchClient!,
      "Web Search Agent",
      `best things to do and top attractions in ${destination}`
    );
    console.log(`[Travel Planner] Activities found: ${result.substring(0, 80)}...`);
    return result;
  }

  private async getWeatherInfo(destination: string): Promise<string> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = getMockWeather(destination);
      console.log(`[Travel Planner] Weather info: ${result.substring(0, 60)}...`);
      return result;
    }
    const result = await this.callAgent(
      this.weatherClient!,
      "Weather Agent",
      `What is the weather in ${destination}?`
    );
    console.log(`[Travel Planner] Weather info: ${result.substring(0, 60)}...`);
    return result;
  }

  private async getBudgetInfo(): Promise<string> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = getMockCalculation();
      console.log(`[Travel Planner] Budget calculated: ${result}`);
      return result;
    }
    const result = await this.callAgent(
      this.calculatorClient!,
      "Calculator Agent",
      `Calculate trip budget for 7 nights at $150 per night with $25 meals per day`
    );
    console.log(`[Travel Planner] Budget calculated: ${result}`);
    return result;
  }

  private async generateItinerary(
    departure: string,
    destination: string,
    activitiesInfo: string,
    weatherInfo: string,
    budgetInfo: string
  ): Promise<string> {
    console.log(`[Travel Planner] Generating itinerary`);

    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return getMockItinerary(departure, destination);
    }

    const itineraryPrompt = `Create a 1-day travel itinerary from ${departure} to ${destination} with maximum 500 characteres.

Context:
- Activities: ${activitiesInfo}
- Weather: ${weatherInfo}
- Budget: ${budgetInfo}

Include morning, afternoon, and evening activities. Keep it simple and concise.`;

    const result = await this.model!.invoke(itineraryPrompt);
    return result.content as string;
  }

  private async translateReport(text: string, language: string): Promise<string> {
    if (language.toLowerCase() === "english") {
      console.log(`[Travel Planner] Translation skipped: already in English`);
      return text;
    }

    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = getMockTranslation(text, language);
      console.log(`[Travel Planner] Translation completed: ${language}`);
      return result;
    }

    const result = await this.callAgent(
      this.translatorClient!,
      "Translator Agent",
      `Translate to ${language}:\n\n${text}`
    );
    console.log(`[Travel Planner] Translation completed: ${language}`);
    return result;
  }

  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const userMessage = requestContext.userMessage;
    const existingTask = requestContext.task;
    const taskId = existingTask?.id || uuidv4();
    const contextId = userMessage.contextId || existingTask?.contextId || uuidv4();

    try {
      const userText = userMessage.parts.find((p) => p.kind === "text")?.text || "";
      if (!userText) throw new Error("No text content in message");

      console.log(`[Travel Planner] Planning trip: ${userText}`);

      const { destination, departure, language } = this.parseUserInput(userText);

      if (!this.useMock) {
        await this.initializeA2AClients();
      }

      const activitiesInfo = await this.getActivitiesInfo(destination);
      const weatherInfo = await this.getWeatherInfo(destination);
      const budgetInfo = await this.getBudgetInfo();
      const itinerary = await this.generateItinerary(
        departure,
        destination,
        activitiesInfo,
        weatherInfo,
        budgetInfo
      );
      const finalReport = await this.translateReport(itinerary, language);

      const responseMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: `Travel Plan: ${departure} to ${destination}\n\n${finalReport}`,
          },
        ],
        contextId,
        taskId,
      };

      eventBus.publish(responseMessage);
      eventBus.finished();

      console.log("[Travel Planner] Trip planning completed");
    } catch (error: any) {
      console.error("[Travel Planner] Error:", error);

      const errorMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{ kind: "text", text: `Error: ${error.message}` }],
        contextId: contextId,
        taskId: taskId,
      };

      eventBus.publish(errorMessage);
      eventBus.finished();
    }
  }

  async cancelTask(): Promise<void> {
    console.log("[Travel Planner] Task cancelled");
  }
}
