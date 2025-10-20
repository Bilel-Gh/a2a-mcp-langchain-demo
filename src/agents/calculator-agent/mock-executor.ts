import { v4 as uuidv4 } from "uuid";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type { Message, Task, TaskStatusUpdateEvent } from "@a2a-js/sdk";

export class MockCalculatorAgentExecutor implements AgentExecutor {
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const userMessage = requestContext.userMessage;
    const taskId = requestContext.task?.id || uuidv4();
    const contextId =
      userMessage.contextId || requestContext.task?.contextId || uuidv4();

    const initialTask: Task = {
      kind: "task",
      id: taskId,
      contextId,
      status: { state: "submitted", timestamp: new Date().toISOString() },
    };
    eventBus.publish(initialTask);

    const workingUpdate: TaskStatusUpdateEvent = {
      kind: "status-update",
      taskId,
      contextId,
      status: { state: "working", timestamp: new Date().toISOString() },
      final: false,
    };
    eventBus.publish(workingUpdate);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResponse = `MOCK CALCULATION:
    
🏨 Hotel: $150/night × 7 nights = $1,050
🍽️  Meals: $25/day × 7 days = $175
💰 Total Budget: $1,225`;

    const responseMessage: Message = {
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [{ kind: "text", text: mockResponse }],
      contextId,
      taskId,
    };
    eventBus.publish(responseMessage);

    const completedUpdate: TaskStatusUpdateEvent = {
      kind: "status-update",
      taskId,
      contextId,
      status: { state: "completed", timestamp: new Date().toISOString() },
      final: true,
    };
    eventBus.publish(completedUpdate);
    eventBus.finished();
  }

  async cancelTask(): Promise<void> {
    console.log("[Mock Calculator] Cancel requested");
  }
}
