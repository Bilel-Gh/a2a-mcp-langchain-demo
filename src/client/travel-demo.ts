import { A2AClient } from "@a2a-js/sdk/client";
import { MessageSendParams } from "@a2a-js/sdk";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";
import * as readline from "readline";

config();

const TRAVEL_PLANNER_URL = `http://localhost:${
  process.env.TRAVEL_PLANNER_AGENT_PORT || 4002
}`;

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(
  rl: readline.Interface,
  question: string
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  const rl = createReadlineInterface();

  console.log("\n" + "=".repeat(70));
  console.log("TRAVEL PLANNER - A2A DEMO");
  console.log("=".repeat(70) + "\n");

  try {
    console.log("Connecting to Travel Planner Agent...");
    const travelClient = await A2AClient.fromCardUrl(
      `${TRAVEL_PLANNER_URL}/.well-known/agent-card.json`
    );
    console.log("Connected\n");

    console.log("Enter your travel details:\n");

    const destination = await askQuestion(
      rl,
      "Destination: "
    );

    if (!destination) {
      console.log("Error: Destination is required");
      rl.close();
      process.exit(1);
    }

    const departure = await askQuestion(
      rl,
      "Departure: "
    );

    if (!departure) {
      console.log("Error: Departure city is required");
      rl.close();
      process.exit(1);
    }

    const language = await askQuestion(
      rl,
      "Language (English/French/Spanish): "
    );

    const reportLanguage = language || "English";
    rl.close();

    console.log("\n" + "-".repeat(70));
    console.log(`Planning trip: ${departure} to ${destination} (${reportLanguage})`);
    console.log("-".repeat(70) + "\n");

    const userInput = `${destination}, ${departure}, ${reportLanguage}`;

    const params: MessageSendParams = {
      message: {
        messageId: uuidv4(),
        role: "user",
        parts: [{ kind: "text", text: userInput }],
        kind: "message",
      },
      configuration: {
        blocking: true,
      },
    };

    console.log("Sending request...\n");

    const response = await travelClient.sendMessage(params);

    if ("error" in response) {
      throw new Error(response.error.message);
    }

    const result = response.result;

    if (result.kind === "message") {
      const text = result.parts
        .filter((p) => p.kind === "text")
        .map((p) => (p as any).text)
        .join("\n");

      console.log("=".repeat(5));
      console.log("TRAVEL REPORT");
      console.log("=".repeat(5) + "\n");
      console.log(text);
      console.log("\n" + "-".repeat(5));
      console.log("Completed successfully");
      console.log("-".repeat(5) + "\n");
    } else {
      console.log("Warning: Unexpected response type:", result.kind);
    }

    process.exit(0);
  } catch (error: any) {
    rl.close();
    console.error("\nError:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  console.log("\nExiting...");
  process.exit(0);
});

main();
