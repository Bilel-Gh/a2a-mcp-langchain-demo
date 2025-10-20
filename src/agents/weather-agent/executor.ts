import { v4 as uuidv4 } from "uuid";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type {
  Message,
  Task,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
} from "@a2a-js/sdk";
import { getWeatherData } from "../../utils/weather-api.js";

export class WeatherAgentExecutor implements AgentExecutor {
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const userMessage = requestContext.userMessage;
    const existingTask = requestContext.task;

    const taskId = existingTask?.id || uuidv4();
    const contextId =
      userMessage.contextId || existingTask?.contextId || uuidv4();

    // publish the initial task
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

    // Update status to "working"
    const workingUpdate: TaskStatusUpdateEvent = {
      kind: "status-update",
      taskId: taskId,
      contextId: contextId,
      status: { state: "working", timestamp: new Date().toISOString() },
      final: false,
    };
    eventBus.publish(workingUpdate);

    try {
      // Extract city from user message
      const userText =
        userMessage.parts.find((p) => p.kind === "text")?.text || "";
      const city = this.extractCity(userText);

      if (!city) {
        throw new Error("Unable to extract city name from message");
      }

      console.log(`[Weather Agent] Getting weather for ${city}`);

      // Call weather API
      const weatherData = await getWeatherData(city);

      // Create artifact with weather data
      const weatherArtifact: TaskArtifactUpdateEvent = {
        kind: "artifact-update",
        taskId: taskId,
        contextId: contextId,
        artifact: {
          artifactId: uuidv4(),
          name: `weather_${city.toLowerCase()}.json`,
          description: `Weather data for ${city}`,
          parts: [
            {
              kind: "text",
              text:
                `Current weather in ${city}:\n` +
                `Temperature: ${weatherData.temperature}°C\n` +
                `Conditions: ${weatherData.description}\n` +
                `Humidity: ${weatherData.humidity}%\n` +
                `Wind: ${weatherData.windSpeed} m/s`,
            },
          ],
        },
      };
      eventBus.publish(weatherArtifact);

      // Response message
      const responseMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text:
              `Weather data retrieved for ${city}. ` +
              `It's currently ${weatherData.temperature}°C with ${weatherData.description}.`,
          },
        ],
        contextId: contextId,
        taskId: taskId,
      };
      eventBus.publish(responseMessage);

      // Complete the task
      const completedUpdate: TaskStatusUpdateEvent = {
        kind: "status-update",
        taskId: taskId,
        contextId: contextId,
        status: { state: "completed", timestamp: new Date().toISOString() },
        final: true,
      };
      eventBus.publish(completedUpdate);
      eventBus.finished();
    } catch (error) {
      console.error("[Weather Agent] Error:", error);

      // Error
      const errorMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: `Error retrieving weather data: ${error}`,
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
    console.log("[Weather Agent] Task cancelled");
  }

  private extractCity(text: string): string | null {
    const patterns = [
      /météo (?:à|a|pour) ([a-zàâäéèêëïîôöùûüÿæœç\s-]+)/i,
      /weather (?:in|for) ([a-z\s-]+)/i,
      /([a-zàâäéèêëïîôöùûüÿæœç\s-]+)\s*météo/i,
      /^([a-zàâäéèêëïîôöùûüÿæœç\s-]+)$/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }
}
