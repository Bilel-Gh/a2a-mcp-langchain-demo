import { v4 as uuidv4 } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type { Message, Task, TaskStatusUpdateEvent } from "@a2a-js/sdk";

export class TranslatorAgentExecutor implements AgentExecutor {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required in .env");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });
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

    // "working" status
    const workingUpdate: TaskStatusUpdateEvent = {
      kind: "status-update",
      taskId: taskId,
      contextId: contextId,
      status: { state: "working", timestamp: new Date().toISOString() },
      final: false,
    };
    eventBus.publish(workingUpdate);

    try {
      // Extract text and target language
      const userText = userMessage.parts.find((p) => p.kind === "text")?.text || "";
      const { textToTranslate, targetLanguage } =
        this.parseTranslationRequest(userText);

      if (!textToTranslate) {
        throw new Error("No text to translate found in message");
      }

      console.log(`[Translator Agent] Translating to ${targetLanguage}`);

      // Call Gemini for translation
      const prompt = `Translate the following text to ${targetLanguage}. Provide only the translation without explanations:\n\n${textToTranslate}`;

      const result = await this.model.generateContent(prompt);
      const translatedText = result.response.text();

      // Response message with translation
      const responseMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: `Translation to ${targetLanguage}:\n\n${translatedText}`,
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
      console.error("[Translator Agent] Error:", error);

      const errorMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: `Translation error: ${error instanceof Error ? error.message : String(error)}`,
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
          timestamp: new Date().toISOString()
        },
        final: true,
      };
      eventBus.publish(failedUpdate);
      eventBus.finished();
    }
  }

  async cancelTask(): Promise<void> {
    console.log("[Translator Agent] Task cancellation requested");
  }

  private parseTranslationRequest(text: string): {
    textToTranslate: string;
    targetLanguage: string;
  } {
    // Detect target language
    let targetLanguage = "French";

    const languagePatterns = [
      { pattern: /to french|en français|au français/i, lang: "French" },
      { pattern: /to english|en anglais|in english/i, lang: "English" },
      { pattern: /to spanish|en espagnol|al español/i, lang: "Spanish" },
      { pattern: /to german|en allemand|auf deutsch/i, lang: "German" },
      { pattern: /to italian|en italien|in italiano/i, lang: "Italian" },
      { pattern: /to japanese|en japonais|日本語/i, lang: "Japanese" },
    ];

    for (const { pattern, lang } of languagePatterns) {
      if (pattern.test(text)) {
        targetLanguage = lang;
        break;
      }
    }

    // Extract text to translate
    // Pattern: "Translate to [language]:" or "Traduire en [language]:"
    // We want everything AFTER the language specification
    const separatorMatch = text.match(
      /(?:translate|traduire|translation)\s+(?:to|en|au|in)\s+(?:français|anglais|espagnol|english|spanish|french|german|italian|japanese)\s*:?\s*/i
    );

    let textToTranslate = text;
    if (separatorMatch) {
      // Get everything AFTER the separator (not before!)
      const startIndex = separatorMatch.index! + separatorMatch[0].length;
      textToTranslate = text.substring(startIndex).trim();
    }

    return { textToTranslate, targetLanguage };
  }
}
