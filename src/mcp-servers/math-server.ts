// Simple MCP server for mathematical operations
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "math-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "add",
        description: "Add two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" },
          },
          required: ["a", "b"],
        },
      },
      {
        name: "multiply",
        description: "Multiply two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" },
          },
          required: ["a", "b"],
        },
      },
      {
        name: "calculate_trip_budget",
        description:
          "Calculate total budget for a trip (hotel per night × number of nights)",
        inputSchema: {
          type: "object",
          properties: {
            hotel_per_night: {
              type: "number",
              description: "Hotel cost per night",
            },
            nights: { type: "number", description: "Number of nights" },
            meals_per_day: {
              type: "number",
              description:
                "Estimated meals cost per day in USD (optional, default 25)",
            },
          },
          required: ["hotel_per_night", "nights"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "add") {
    const { a, b } = args as { a: number; b: number };
    return {
      content: [
        {
          type: "text",
          text: `${a + b}`,
        },
      ],
    };
  } 
  
  if (name === "multiply") {
    const { a, b } = args as { a: number; b: number };
    return {
      content: [
        {
          type: "text",
          text: `${a * b}`,
        },
      ],
    };
  } 
  
  if (name === "calculate_trip_budget") {
    const {
      hotel_per_night,
      nights,
      meals_per_day = 25,
    } = args as {
      hotel_per_night: number;
      nights: number;
      meals_per_day?: number;
    };

    const hotelTotal = hotel_per_night * nights;
    const mealsTotal = meals_per_day * nights;
    const grandTotal = hotelTotal + mealsTotal;

    console.error(
      `[Math MCP] Budget calculation: Hotel=${hotelTotal}, Meals=${mealsTotal}, Total=${grandTotal}`
    );

    const breakdown = [
      `Hotel: $${hotel_per_night}/night × ${nights} nights = $${hotelTotal}`,
      `Meals: $${meals_per_day}/day × ${nights} days = $${mealsTotal}`,
      `Total Budget: $${grandTotal}`,
    ].join("\n");

    return {
      content: [
        {
          type: "text",
          text: breakdown,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${name}`,
      },
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport(); // Use stdio for simplicity
  await server.connect(transport);
  console.error("Math MCP Server running on stdio");
}

main().catch(console.error);
