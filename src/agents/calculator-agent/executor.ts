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
import * as path from "path";

export class CalculatorAgentExecutor implements AgentExecutor {
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
      temperature: 0,
    });
  }


  // Initialize MCP connection to our custom Math server
  private async initializeMcpAgent() {
    if (this.agent) return this.agent;

    console.log(
      "[Calculator Agent] Initializing MCP connection to custom Math server..."
    );

    this.mcpClient = new Client(
      {
        name: "calculator-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    // Connect to OUR custom Math MCP server
    const serverPath = path.join(
      process.cwd(),
      "dist",
      "mcp-servers",
      "math-server.js"
    );

    const transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
    });

    await this.mcpClient.connect(transport);
    console.log("[Calculator Agent] MCP connected to custom Math server");

    // Load tools from our custom server
    const tools = await loadMcpTools("custom-math", this.mcpClient); // loadMcpTools is provided by langchain
    console.log(
      `[Calculator Agent] Loaded ${tools.length} math tools from custom MCP server`
    );

    // Create LangChain agent with math tools
    this.agent = createReactAgent({
      llm: this.model,
      tools: tools,
    });

    console.log("[Calculator Agent] Agent initialized with custom Math MCP");
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

    // Publish initial task
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

    // Update to working
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

      console.log(`[Calculator Agent] Processing: ${userText}`);

      // Initialize agent with our custom MCP tools
      const agent = await this.initializeMcpAgent();

      // Invoke agent
      // it will decide which math tool to use automatically thanks to langchain and gemini AI
      const result = await agent.invoke({
        messages: [{ role: "user", content: userText }],
      });

      const agentResponse = result.messages[result.messages.length - 1].content;

      console.log(`[Calculator Agent] Calculation completed`);

      // Publish response
      const responseMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: `${agentResponse}`,
          },
        ],
        contextId: contextId,
        taskId: taskId,
      };
      eventBus.publish(responseMessage);

      // Complete task
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
      console.error("[Calculator Agent] Error:", error);

      const errorMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: `Calculation error: ${error.message}`,
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
    console.log("[Calculator Agent] Cancel requested");
    if (this.mcpClient) {
      await this.mcpClient.close();
    }
  }
}
