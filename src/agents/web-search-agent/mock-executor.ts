import { v4 as uuidv4 } from "uuid";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type { Message, Task, TaskStatusUpdateEvent } from "@a2a-js/sdk";

export class MockWebSearchAgentExecutor implements AgentExecutor {
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

    // Simuler un délai de recherche
    await new Promise((resolve) => setTimeout(resolve, 6000));

    const mockResponse = `MOCK WEB SEARCH RESULTS:
    
Top attractions in the destination:
- Historic old town with beautiful architecture
- Famous local museum with cultural exhibits  
- Scenic waterfront promenade
- Traditional market with local crafts
- Popular viewpoint with panoramic views`;

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
    console.log("[Mock Web Search] Cancel requested");
  }
}
