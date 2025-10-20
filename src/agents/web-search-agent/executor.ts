import { v4 as uuidv4 } from "uuid";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type { Message, Task, TaskStatusUpdateEvent } from "@a2a-js/sdk";

export class WebSearchAgentExecutor implements AgentExecutor {
  private model: ChatGoogleGenerativeAI;
  private mcpClient: Client | null = null;
  private agent: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required in .env");
    }

    this.model = new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: "gemini-2.0-flash-exp",
      temperature: 0.3,
    });
  }

  // Initialize MCP connection to EXISTING Brave Search server
  private async initializeMcpAgent() {
    if (this.agent) return this.agent;

    console.log(
      "[Web Search Agent] Initializing MCP connection to Brave Search..."
    );

    this.mcpClient = new Client(
      {
        name: "brave-search-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    // Use EXISTING MCP server from npm
    const transport = new StdioClientTransport({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: {
        ...process.env,
        BRAVE_API_KEY: process.env.BRAVE_SEARCH_API_KEY || "",
      },
    });

    await this.mcpClient.connect(transport);
    console.log("[Web Search Agent] MCP connected to Brave Search");

    // Load tools from existing Brave Search MCP server
    const tools = await loadMcpTools("brave-search", this.mcpClient);
    console.log(`[Web Search Agent] Loaded ${tools.length} Brave Search tools`);

    // Create LangChain agent with Brave tools
    this.agent = createReactAgent({
      llm: this.model,
      tools: tools,
    });

    console.log("[Web Search Agent] Agent initialized with Brave Search");
    return this.agent;
  }

  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const userMessage = requestContext.userMessage;
    const existingTask = requestContext.task;

    const taskId = existingTask?.id || uuidv4();
    const contextId =
      userMessage.contextId || existingTask?.contextId || uuidv4();

    const initialTask: Task = {
      kind: "task",
      id: taskId,
      contextId: contextId,
      status: {
        state: "submitted",
        timestamp: new Date().toISOString(),
      },
    };
    eventBus.publish(initialTask);

    const workingUpdate: TaskStatusUpdateEvent = {
      kind: "status-update",
      taskId: taskId,
      contextId: contextId,
      status: { state: "working", timestamp: new Date().toISOString() },
      final: false,
    };
    eventBus.publish(workingUpdate);

    try {
      const userText =
        userMessage.parts.find((p) => p.kind === "text")?.text || "";

      if (!userText) {
        throw new Error("No text content in message");
      }

      console.log(`[Web Search Agent] Searching Brave: ${userText}`);

      const agent = await this.initializeMcpAgent();

      // Invoke agent - it will use Brave Search tools
      const result = await agent.invoke({
        messages: [{ role: "user", content: userText }],
      });

      const agentResponse = result.messages[result.messages.length - 1].content;

      console.log(`[Web Search Agent] Search completed`);

      const responseMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: agentResponse,
          },
        ],
        contextId: contextId,
        taskId: taskId,
      };
      eventBus.publish(responseMessage);

      const completedUpdate: TaskStatusUpdateEvent = {
        kind: "status-update",
        taskId: taskId,
        contextId: contextId,
        status: { state: "completed", timestamp: new Date().toISOString() },
        final: true,
      };
      eventBus.publish(completedUpdate);
      eventBus.finished();
    } catch (error: any) {
      console.error("[Web Search Agent] Error:", error);

      const errorMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: `Error during web search: ${error.message}`,
          },
        ],
        contextId: contextId,
        taskId: taskId,
      };
      eventBus.publish(errorMessage);

      const failedUpdate: TaskStatusUpdateEvent = {
        kind: "status-update",
        taskId: taskId,
        contextId: contextId,
        status: {
          state: "failed",
          timestamp: new Date().toISOString(),
        },
        final: true,
      };
      eventBus.publish(failedUpdate);
      eventBus.finished();
    }
  }

  async cancelTask(): Promise<void> {
    console.log("[Web Search Agent] Cancel requested");
    if (this.mcpClient) {
      await this.mcpClient.close();
    }
  }
}
