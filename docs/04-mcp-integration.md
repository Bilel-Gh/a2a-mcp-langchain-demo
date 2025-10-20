# 04 - MCP + A2A : Création et Intégration

## Table des Matières

1. [Introduction](#introduction)
2. [Créer un Serveur MCP Personnalisé](#créer-un-serveur-mcp-personnalisé)
3. [Intégrer MCP dans un Agent A2A](#intégrer-mcp-dans-un-agent-a2a)
4. [Architecture Hybride A2A + MCP](#architecture-hybride-a2a--mcp)
5. [Avantages de l'Approche](#avantages-de-lapproche)
6. [Résumé et Bonnes Pratiques](#résumé-et-bonnes-pratiques)

---

## Introduction

Ce document explique comment **créer un serveur MCP personnalisé** et **l'intégrer dans un agent A2A**. Nous utilisons le **Calculator Agent** de notre projet comme exemple concret.

### Objectif

Créer un agent A2A qui :

1. ✅ Reçoit des requêtes via le protocole A2A
2. ✅ Utilise un LLM (Gemini) pour comprendre la requête
3. ✅ Appelle des tools MCP pour effectuer des calculs précis
4. ✅ Retourne le résultat via A2A

### Architecture Cible

```
Client A2A
    │
    │ A2A Protocol
    │
    ▼
┌───────────────────────────────────────┐
│      Calculator Agent (A2A)           │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │   LangChain Agent               │ │
│  │   (Gemini LLM + ReAct)          │ │
│  └─────────────┬───────────────────┘ │
│                │                     │
│                │ MCP Protocol        │
│                │                     │
│  ┌─────────────▼───────────────────┐ │
│  │   MCP Client                    │ │
│  │   (LangChain Adapter)           │ │
│  └─────────────┬───────────────────┘ │
└────────────────┼─────────────────────┘
                 │
                 │ stdio
                 │
     ┌───────────▼────────────┐
     │  Math MCP Server       │
     │  - add()               │
     │  - multiply()          │
     │  - calculate_trip_     │
     │    budget()            │
     └────────────────────────┘
```

---

## Créer un Serveur MCP Personnalisé

Nous allons créer un **Math MCP Server** qui expose des outils mathématiques.

### Étape 1 : Installation des Dépendances

```bash
npm install @modelcontextprotocol/sdk
```

### Étape 2 : Structure du Serveur

Fichier : `src/mcp-servers/math-server.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
```

**Imports nécessaires** :

- `Server` : classe de base du serveur MCP
- `StdioServerTransport` : transport stdio pour communication locale
- `CallToolRequestSchema` : schéma pour appels de tools
- `ListToolsRequestSchema` : schéma pour lister les tools

### Étape 3 : Créer le Serveur

```typescript
// Créer une instance du serveur MCP
const server = new Server(
  {
    name: "math-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},  // Ce serveur expose des tools
    },
  }
);

console.log("[Math Server] Server created");
```

**Configuration** :

- `name` : identifiant du serveur
- `version` : version du serveur (utile pour compatibilité)
- `capabilities.tools` : indique que ce serveur expose des tools

### Étape 4 : Définir les Tools

```typescript
// Handler pour lister les tools disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log("[Math Server] Listing available tools");

  return {
    tools: [
      // Tool 1 : Addition
      {
        name: "add",
        description: "Add two numbers together and return the sum",
        inputSchema: {
          type: "object",
          properties: {
            a: {
              type: "number",
              description: "The first number to add",
            },
            b: {
              type: "number",
              description: "The second number to add",
            },
          },
          required: ["a", "b"],
        },
      },

      // Tool 2 : Multiplication
      {
        name: "multiply",
        description: "Multiply two numbers together and return the product",
        inputSchema: {
          type: "object",
          properties: {
            a: {
              type: "number",
              description: "The first number to multiply",
            },
            b: {
              type: "number",
              description: "The second number to multiply",
            },
          },
          required: ["a", "b"],
        },
      },

      // Tool 3 : Calcul de budget de voyage
      {
        name: "calculate_trip_budget",
        description:
          "Calculate the total budget for a trip including accommodation and meals costs",
        inputSchema: {
          type: "object",
          properties: {
            nights: {
              type: "number",
              description: "Number of nights staying",
            },
            pricePerNight: {
              type: "number",
              description: "Price per night for accommodation in dollars",
            },
            mealsPerDay: {
              type: "number",
              description: "Cost of meals per day in dollars",
            },
          },
          required: ["nights", "pricePerNight", "mealsPerDay"],
        },
      },
    ],
  };
});
```

**Points clés** :

- **name** : identifiant unique du tool (pas d'espaces, snake_case)
- **description** : explication détaillée pour que le LLM sache quand utiliser ce tool
- **inputSchema** : schéma JSON Schema définissant les paramètres
  - `properties` : liste des paramètres avec types et descriptions
  - `required` : paramètres obligatoires

### Étape 5 : Implémenter les Handlers de Tools

```typescript
// Handler pour exécuter les tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.log(`[Math Server] Calling tool: ${name} with args:`, args);

  // Tool : add
  if (name === "add") {
    const { a, b } = args as { a: number; b: number };
    const result = a + b;

    console.log(`[Math Server] add(${a}, ${b}) = ${result}`);

    return {
      content: [
        {
          type: "text",
          text: `The sum of ${a} and ${b} is ${result}`,
        },
      ],
    };
  }

  // Tool : multiply
  if (name === "multiply") {
    const { a, b } = args as { a: number; b: number };
    const result = a * b;

    console.log(`[Math Server] multiply(${a}, ${b}) = ${result}`);

    return {
      content: [
        {
          type: "text",
          text: `The product of ${a} and ${b} is ${result}`,
        },
      ],
    };
  }

  // Tool : calculate_trip_budget
  if (name === "calculate_trip_budget") {
    const { nights, pricePerNight, mealsPerDay } = args as {
      nights: number;
      pricePerNight: number;
      mealsPerDay: number;
    };

    // Calculs
    const accommodationCost = nights * pricePerNight;
    const mealsCost = nights * mealsPerDay;
    const totalCost = accommodationCost + mealsCost;

    console.log(
      `[Math Server] calculate_trip_budget(${nights} nights, $${pricePerNight}/night, $${mealsPerDay}/day meals) = $${totalCost}`
    );

    return {
      content: [
        {
          type: "text",
          text: `Total trip budget: $${totalCost} (Accommodation: $${accommodationCost}, Meals: $${mealsCost})`,
        },
      ],
    };
  }

  // Tool inconnu
  throw new Error(`Unknown tool: ${name}`);
});
```

**Structure de la réponse** :

```typescript
{
  content: [
    {
      type: "text",  // Type de contenu (text, data, etc.)
      text: string   // Le texte du résultat
    }
  ]
}
```

### Étape 6 : Démarrer le Serveur

```typescript
// Créer le transport stdio
const transport = new StdioServerTransport();

console.log("[Math Server] Starting server with stdio transport");

// Connecter le serveur au transport
await server.connect(transport);

console.log("[Math Server] Server started and listening");
```

**Transport stdio** :

- Communication via stdin/stdout
- Le serveur attend des commandes sur stdin
- Répond sur stdout
- Logs sur stderr (pour ne pas polluer stdout)

### Fichier Complet : math-server.ts

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "math-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

console.log("[Math Server] Server created");

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log("[Math Server] Listing available tools");
  return {
    tools: [
      {
        name: "add",
        description: "Add two numbers together and return the sum",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "The first number to add" },
            b: { type: "number", description: "The second number to add" },
          },
          required: ["a", "b"],
        },
      },
      {
        name: "multiply",
        description: "Multiply two numbers together and return the product",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "The first number to multiply" },
            b: { type: "number", description: "The second number to multiply" },
          },
          required: ["a", "b"],
        },
      },
      {
        name: "calculate_trip_budget",
        description:
          "Calculate the total budget for a trip including accommodation and meals costs",
        inputSchema: {
          type: "object",
          properties: {
            nights: { type: "number", description: "Number of nights staying" },
            pricePerNight: {
              type: "number",
              description: "Price per night for accommodation in dollars",
            },
            mealsPerDay: {
              type: "number",
              description: "Cost of meals per day in dollars",
            },
          },
          required: ["nights", "pricePerNight", "mealsPerDay"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.log(`[Math Server] Calling tool: ${name} with args:`, args);

  if (name === "add") {
    const { a, b } = args as { a: number; b: number };
    const result = a + b;
    console.log(`[Math Server] add(${a}, ${b}) = ${result}`);
    return {
      content: [
        { type: "text", text: `The sum of ${a} and ${b} is ${result}` },
      ],
    };
  }

  if (name === "multiply") {
    const { a, b } = args as { a: number; b: number };
    const result = a * b;
    console.log(`[Math Server] multiply(${a}, ${b}) = ${result}`);
    return {
      content: [
        { type: "text", text: `The product of ${a} and ${b} is ${result}` },
      ],
    };
  }

  if (name === "calculate_trip_budget") {
    const { nights, pricePerNight, mealsPerDay } = args as {
      nights: number;
      pricePerNight: number;
      mealsPerDay: number;
    };
    const accommodationCost = nights * pricePerNight;
    const mealsCost = nights * mealsPerDay;
    const totalCost = accommodationCost + mealsCost;
    console.log(
      `[Math Server] calculate_trip_budget = $${totalCost}`
    );
    return {
      content: [
        {
          type: "text",
          text: `Total trip budget: $${totalCost} (Accommodation: $${accommodationCost}, Meals: $${mealsCost})`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
console.log("[Math Server] Starting server with stdio transport");
await server.connect(transport);
console.log("[Math Server] Server started and listening");
```

### Tester le Serveur MCP

#### Compilation

```bash
npm run build
```

Cela compile `src/mcp-servers/math-server.ts` → `dist/mcp-servers/math-server.js`

#### Lancement Manuel (pour tester)

```bash
node dist/mcp-servers/math-server.js
```

Le serveur attend des commandes JSON sur stdin. Vous pouvez envoyer :

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

Et le serveur répondra avec la liste des tools.

**Note** : en pratique, le serveur est lancé automatiquement par le Calculator Agent via `connectStdio()`.

---

## Intégrer MCP dans un Agent A2A

Maintenant que nous avons un serveur MCP, intégrons-le dans un agent A2A : le **Calculator Agent**.

### Vue d'Ensemble

Le Calculator Agent :

1. ✅ Reçoit des requêtes A2A (ex: "Calculate trip budget...")
2. ✅ Se connecte au Math MCP Server via stdio
3. ✅ Charge les tools MCP dans LangChain
4. ✅ Utilise un LangChain Agent (ReAct) avec Gemini
5. ✅ Le LLM choisit le bon tool et l'appelle
6. ✅ Retourne le résultat via A2A

### Étape 1 : Installation des Dépendances

```bash
npm install @langchain/google-genai @langchain/mcp @langchain/core
```

### Étape 2 : Structure de l'Executor

Fichier : `src/agents/calculator-agent/executor.ts`

```typescript
import { v4 as uuidv4 } from "uuid";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MCPClient } from "@langchain/mcp";
import { loadMCPTools } from "@langchain/mcp";
import { AgentExecutor as LangChainAgentExecutor, createReactAgent } from "langchain/agents";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type { Message } from "@a2a-js/sdk";
```

**Imports clés** :

- `ChatGoogleGenerativeAI` : LLM Gemini de Google
- `MCPClient` : client MCP de LangChain
- `loadMCPTools` : charger les tools depuis le serveur MCP
- `createReactAgent` : créer un agent ReAct (Reasoning + Acting)

### Étape 3 : Classe Executor

```typescript
export class CalculatorAgentExecutor implements AgentExecutor {
  private model: ChatGoogleGenerativeAI;
  private mcpClient: MCPClient | null = null;
  private langchainExecutor: LangChainAgentExecutor | null = null;

  constructor() {
    // Vérifier la clé API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required in .env");
    }

    // Créer le modèle Gemini
    this.model = new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: "gemini-2.0-flash-exp",
      temperature: 0,  // Température basse pour précision
    });

    console.log("[Calculator Agent] Model initialized");
  }

  async cancelTask(): Promise<void> {
    console.log("[Calculator Agent] Task cancellation requested");
  }
}
```

**Points clés** :

- `model` : instance du LLM Gemini
- `mcpClient` : client MCP (initialisé à la première requête)
- `langchainExecutor` : agent LangChain avec tools (initialisé à la première requête)
- `temperature: 0` : pour des calculs déterministes

### Étape 4 : Initialiser le Client MCP

```typescript
private async initializeMCPClient() {
  // Ne pas réinitialiser si déjà fait
  if (this.mcpClient) {
    console.log("[Calculator Agent] MCP client already initialized");
    return;
  }

  console.log("[Calculator Agent] Initializing MCP client");

  try {
    // Créer le client MCP
    this.mcpClient = new MCPClient({
      name: "calculator-mcp-client",
      version: "1.0.0",
    });

    // Se connecter au Math Server via stdio
    await this.mcpClient.connectStdio({
      command: "node",                              // Commande pour lancer le processus
      args: ["dist/mcp-servers/math-server.js"],   // Chemin vers le serveur compilé
    });

    console.log("[Calculator Agent] Connected to MCP server");

    // Charger les tools depuis le serveur
    const tools = await loadMCPTools({
      client: this.mcpClient,
    });

    console.log(`[Calculator Agent] Loaded ${tools.length} MCP tools:`,
      tools.map(t => t.name).join(", ")
    );
    // → Loaded 3 MCP tools: add, multiply, calculate_trip_budget

    // Créer un prompt pour l'agent ReAct
    const prompt = `You are a helpful calculator assistant with access to mathematical tools.
Use the available tools to solve mathematical problems accurately.
When a user asks for calculations, use the appropriate tool.

Available tools:
- add: Add two numbers
- multiply: Multiply two numbers
- calculate_trip_budget: Calculate total trip budget including accommodation and meals

Think step by step and use the tools when needed.`;

    // Créer l'agent ReAct
    const reactAgent = await createReactAgent({
      llm: this.model,
      tools: tools,
      prompt: prompt,
    });

    // Créer l'executor LangChain
    this.langchainExecutor = new LangChainAgentExecutor({
      agent: reactAgent,
      tools: tools,
    });

    console.log("[Calculator Agent] LangChain agent initialized");

  } catch (error: any) {
    console.error("[Calculator Agent] Failed to initialize MCP:", error);
    throw new Error(`MCP initialization failed: ${error.message}`);
  }
}
```

**Flow d'initialisation** :

1. Créer `MCPClient`
2. Connecter au Math Server via `connectStdio()` (lance le processus)
3. Charger les tools avec `loadMCPTools()`
4. Créer un agent ReAct avec le LLM et les tools
5. Créer un `LangChainAgentExecutor` pour exécuter l'agent

**ReAct Agent** :

- **Re**asoning + **Act**ing
- Le LLM raisonne sur quel tool utiliser
- Appelle le tool
- Raisonne sur le résultat
- Continue jusqu'à résolution

### Étape 5 : Méthode execute()

```typescript
async execute(
  requestContext: RequestContext,
  eventBus: ExecutionEventBus
): Promise<void> {
  const userMessage = requestContext.userMessage;
  const existingTask = requestContext.task;
  const taskId = existingTask?.id || uuidv4();
  const contextId = userMessage.contextId || existingTask?.contextId || uuidv4();

  try {
    // Extraire le texte de la requête
    const userText = userMessage.parts.find((p) => p.kind === "text")?.text || "";
    if (!userText) {
      throw new Error("No text content in message");
    }

    console.log(`[Calculator Agent] Processing: ${userText}`);

    // Initialiser le client MCP et l'agent LangChain
    await this.initializeMCPClient();

    // Exécuter l'agent LangChain
    console.log("[Calculator Agent] Invoking LangChain agent");
    const result = await this.langchainExecutor!.invoke({
      input: userText,
    });

    console.log("[Calculator Agent] Agent completed:", result.output);

    // Publier la réponse
    const responseMessage: Message = {
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [
        {
          kind: "text",
          text: result.output,
        },
      ],
      contextId,
      taskId,
    };

    eventBus.publish(responseMessage);
    eventBus.finished();

    console.log("[Calculator Agent] Request completed");

  } catch (error: any) {
    console.error("[Calculator Agent] Error:", error);

    // Publier l'erreur
    const errorMessage: Message = {
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [
        { kind: "text", text: `Calculation error: ${error.message}` },
      ],
      contextId: contextId,
      taskId: taskId,
    };

    eventBus.publish(errorMessage);
    eventBus.finished();
  }
}
```

**Points clés** :

1. Extraire le texte de la requête utilisateur
2. Initialiser MCP client (si pas déjà fait)
3. Invoquer l'agent LangChain avec `invoke({ input: userText })`
4. L'agent va :
   - Analyser la requête
   - Décider quel tool utiliser
   - Appeler le tool via MCP
   - Formuler la réponse
5. Publier la réponse via A2A EventBus

### Étape 6 : Agent Card

Fichier : `src/agents/calculator-agent/agent-card.ts`

```typescript
import type { AgentCard } from "@a2a-js/sdk";

export const calculatorAgentCard: AgentCard = {
  name: "Calculator Agent",
  description:
    "Mathematical calculator agent powered by LangChain and MCP tools for precise calculations",
  skills: [
    {
      name: "calculate",
      description:
        "Perform mathematical calculations including addition, multiplication, and trip budget calculations",
      tags: ["math", "calculator", "budget"],
      examples: [
        "Add 150 and 75",
        "Multiply 7 by 25",
        "Calculate trip budget for 7 nights at $150 per night with $25 meals per day",
      ],
    },
  ],
  url: `http://localhost:${process.env.CALCULATOR_AGENT_PORT || 4004}`,
  protocolVersion: "1.0",
};
```

### Étape 7 : Serveur

Fichier : `src/agents/calculator-agent/server.ts`

```typescript
import "dotenv/config";
import { A2AExpressApp } from "@a2a-js/sdk/server";
import { calculatorAgentCard } from "./agent-card.js";
import { CalculatorAgentExecutor } from "./executor.js";

const PORT = process.env.CALCULATOR_AGENT_PORT || 4004;

const calculatorExecutor = new CalculatorAgentExecutor();

const a2aApp = new A2AExpressApp({
  defaultExecutor: calculatorExecutor,
  agentCard: calculatorAgentCard,
});

const app = a2aApp.getApp();

app.listen(PORT, () => {
  console.log(`[Calculator Agent] Server listening on port ${PORT}`);
  console.log(`[Calculator Agent] Agent Card: http://localhost:${PORT}/.well-known/agent-card.json`);
});
```

### Flow Complet d'une Requête

```
1. Client A2A envoie : "Calculate trip budget for 7 nights at $150/night with $25/day meals"

2. Calculator Agent (server.ts) reçoit la requête via A2A

3. Executor.execute() est appelé

4. Initialisation MCP (si première fois) :
   - Créer MCPClient
   - Lancer Math Server via connectStdio()
   - Charger les tools (add, multiply, calculate_trip_budget)
   - Créer ReAct agent avec Gemini + tools

5. LangChain Agent.invoke() :

   LLM (Gemini) raisonne :
   "L'utilisateur veut calculer un budget de voyage.
    J'ai besoin du tool 'calculate_trip_budget'.
    Paramètres : nights=7, pricePerNight=150, mealsPerDay=25"

   LangChain appelle le tool :
   calculate_trip_budget(nights=7, pricePerNight=150, mealsPerDay=25)

   MCP Client envoie au Math Server via stdio

   Math Server calcule :
   - Accommodation: 7 * 150 = 1050
   - Meals: 7 * 25 = 175
   - Total: 1225

   Math Server retourne : "Total trip budget: $1225 (Accommodation: $1050, Meals: $175)"

   MCP Client transmet au LangChain Agent

   LLM formule la réponse finale :
   "The total trip budget is $1225, which includes $1050 for accommodation
    and $175 for meals."

6. Executor publie la réponse via EventBus

7. Client A2A reçoit : "The total trip budget is $1225..."
```

---

## Architecture Hybride A2A + MCP

### Diagramme Complet du Projet

```
┌────────────────────────────────────────────────────────────────────┐
│                         Client Demo (A2A Client)                   │
└───────────────────────────────┬────────────────────────────────────┘
                                │
                                │ A2A: sendMessage(blocking: true)
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                    Travel Planner Agent (A2A)                      │
│                         (Orchestrateur)                            │
└───────────────────────────────┬────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┬────────────────────┐
                │               │               │                    │
        A2A Stream     A2A Stream     A2A Stream        A2A Stream
                │               │               │                    │
     ┌──────────▼─┐  ┌─────────▼──┐ ┌─────────▼───┐  ┌─────────────▼─────┐
     │  Weather   │  │ Translator │ │ Web Search  │  │  Calculator       │
     │   Agent    │  │   Agent    │ │   Agent     │  │   Agent           │
     │  (A2A)     │  │  (A2A)     │ │  (A2A)      │  │  (A2A + MCP)      │
     └────────────┘  └────────────┘ └─────────────┘  └─────────┬─────────┘
                                                                  │
                                                                  │ MCP
                                                                  │
                                                      ┌───────────▼─────────┐
                                                      │  LangChain Agent    │
                                                      │  (Gemini + ReAct)   │
                                                      └───────────┬─────────┘
                                                                  │
                                                                  │ MCP Client
                                                                  │
                                                      ┌───────────▼─────────┐
                                                      │  Math MCP Server    │
                                                      │  - add()            │
                                                      │  - multiply()       │
                                                      │  - calculate_       │
                                                      │    trip_budget()    │
                                                      └─────────────────────┘
```

### Niveaux d'Architecture

#### Niveau 1 : Orchestration A2A

```
Client ↔ Travel Planner ↔ Agents spécialisés
```

**Protocole** : A2A (Agent-to-Agent)
**Communication** : Messages A2A, streaming SSE
**Responsabilité** : orchestration de workflows complexes

#### Niveau 2 : Capacités MCP

```
Calculator Agent ↔ LLM ↔ MCP Tools
```

**Protocole** : MCP (Model Context Protocol)
**Communication** : stdio (local), JSON-RPC
**Responsabilité** : capacités précises et spécialisées

### Pourquoi Cette Architecture ?

#### Séparation des Responsabilités

| Niveau | Responsabilité | Exemple |
|--------|----------------|---------|
| **A2A** | Orchestration, collaboration | Travel Planner coordonne plusieurs agents |
| **Agents A2A** | Logique métier spécifique | Weather Agent interroge API météo |
| **MCP** | Capacités techniques précises | Math Server effectue calculs exacts |
| **LLM** | Raisonnement et décision | Gemini choisit le bon tool MCP |

#### Avantages de l'Hybridation

✅ **Modularité** :
- Chaque agent A2A peut être développé, testé, déployé indépendamment
- Chaque MCP server peut être réutilisé par plusieurs agents

✅ **Précision** :
- A2A pour communication agent-à-agent (flexible, naturel)
- MCP pour calculs et données (précis, déterministe)

✅ **Extensibilité** :
- Ajouter un agent A2A : implémenter AgentExecutor
- Ajouter un tool MCP : définir tool + handler dans serveur MCP

✅ **Scalabilité** :
- Agents A2A peuvent être distribués sur différents serveurs
- MCP servers peuvent être partagés ou isolés selon les besoins

---

## Avantages de l'Approche

### 1. Précision des Calculs

**Sans MCP** (LLM seul) :

```
User : "Calculate 7 nights at $150/night + $25/day meals"
LLM : "Le total est d'environ 1200-1300 dollars"
→ Imprécis, potentiellement faux
```

**Avec MCP** :

```
User : "Calculate 7 nights at $150/night + $25/day meals"
LLM → Tool : calculate_trip_budget(7, 150, 25)
Tool → LLM : $1225
LLM : "Le total est exactement $1225"
→ Précis, vérifiable, reproductible
```

### 2. Flexibilité du LLM

Le LLM peut **choisir dynamiquement** quel tool utiliser :

```
User : "What is 150 plus 75?"
LLM → Tool : add(150, 75)
Tool → LLM : 225

User : "Multiply 7 by 25"
LLM → Tool : multiply(7, 25)
Tool → LLM : 175

User : "Calculate trip budget for 7 nights at $150/night with $25/day meals"
LLM → Tool : calculate_trip_budget(7, 150, 25)
Tool → LLM : $1225
```

Le LLM **comprend** la requête et **sélectionne** le bon tool automatiquement.

### 3. Extensibilité

#### Ajouter un Tool MCP

```typescript
// Dans math-server.ts, ajouter :
{
  name: "calculate_discount",
  description: "Calculate price after discount",
  inputSchema: {
    type: "object",
    properties: {
      originalPrice: { type: "number" },
      discountPercent: { type: "number" }
    },
    required: ["originalPrice", "discountPercent"]
  }
}

// Handler :
if (name === "calculate_discount") {
  const { originalPrice, discountPercent } = args;
  const discount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discount;
  return {
    content: [
      { type: "text", text: `Final price: $${finalPrice} (Discount: $${discount})` }
    ]
  };
}
```

**Pas besoin de modifier Calculator Agent** ! Le tool sera automatiquement chargé et disponible au LLM.

#### Ajouter un Agent A2A

```typescript
// Créer flight-agent/
// - agent-card.ts
// - executor.ts
// - server.ts

// Dans Travel Planner :
this.flightClient = await A2AClient.fromCardUrl(
  `${FLIGHT_URL}/.well-known/agent-card.json`
);

const flightInfo = await this.callAgent(
  this.flightClient,
  "Flight Agent",
  `Find flights from ${departure} to ${destination}`
);
```

**Architecture modulaire** : ajouter des capacités sans toucher au code existant.

### 4. Réutilisabilité

Le **Math MCP Server** peut être utilisé par :

- ✅ Calculator Agent (notre cas)
- ✅ Budget Agent (hypothétique)
- ✅ Analytics Agent (hypothétique)
- ✅ N'importe quel agent ayant besoin de calculs

**Un serveur MCP, plusieurs agents** → économie de code et maintenance.

### 5. Testabilité

#### Tester le MCP Server Indépendamment

```bash
# Lancer le serveur
node dist/mcp-servers/math-server.js

# Envoyer des commandes JSON via stdin
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/mcp-servers/math-server.js
```

#### Tester le Calculator Agent sans MCP

```typescript
// Mode mock dans l'executor
if (process.env.USE_MOCK_MCP === "true") {
  // Ne pas initialiser MCP, utiliser calculs directs
  const result = this.performCalculation(userText);
  eventBus.publish({ ... });
  return;
}
```

#### Tester le Travel Planner sans Calculator

```typescript
// Mode mock
if (this.useMock) {
  const budgetInfo = getMockCalculation();
  // Pas d'appel A2A au Calculator Agent
}
```

**Isolation complète** : chaque composant testable indépendamment.

---

## Résumé et Bonnes Pratiques

### Checklist : Créer un Serveur MCP

- [ ] Installer `@modelcontextprotocol/sdk`
- [ ] Créer fichier `src/mcp-servers/[nom]-server.ts`
- [ ] Importer `Server`, `StdioServerTransport`, schémas
- [ ] Créer instance `Server` avec name, version, capabilities
- [ ] Implémenter `ListToolsRequestSchema` handler
- [ ] Définir tools avec name, description, inputSchema
- [ ] Implémenter `CallToolRequestSchema` handler
- [ ] Gérer chaque tool avec calculs/logique
- [ ] Créer `StdioServerTransport` et connecter
- [ ] Compiler avec `npm run build`
- [ ] Tester manuellement si besoin

### Checklist : Intégrer MCP dans Agent A2A

- [ ] Installer `@langchain/google-genai`, `@langchain/mcp`, `@langchain/core`
- [ ] Dans executor, créer propriétés `model`, `mcpClient`, `langchainExecutor`
- [ ] Créer méthode `initializeMCPClient()` :
  - [ ] Créer `MCPClient`
  - [ ] Appeler `connectStdio()` avec chemin vers serveur MCP
  - [ ] Charger tools avec `loadMCPTools()`
  - [ ] Créer ReAct agent avec `createReactAgent()`
  - [ ] Créer `LangChainAgentExecutor`
- [ ] Dans `execute()` :
  - [ ] Appeler `initializeMCPClient()` (si pas déjà fait)
  - [ ] Invoquer `langchainExecutor.invoke({ input: userText })`
  - [ ] Publier résultat via `eventBus.publish()`
- [ ] Configurer agent card avec exemples d'utilisation
- [ ] Créer serveur A2A avec `A2AExpressApp`

### Patterns Recommandés

#### Pattern 1 : Tool Descriptif

```typescript
// ✅ Bon : description claire et complète
{
  name: "calculate_trip_budget",
  description: "Calculate the total budget for a trip including accommodation costs (nights × price per night) and meal costs (nights × meals per day). Returns the total and breakdown.",
  inputSchema: {
    type: "object",
    properties: {
      nights: {
        type: "number",
        description: "Number of nights staying at the destination"
      },
      pricePerNight: {
        type: "number",
        description: "Price per night for accommodation in dollars"
      },
      mealsPerDay: {
        type: "number",
        description: "Cost of meals per day in dollars"
      }
    },
    required: ["nights", "pricePerNight", "mealsPerDay"]
  }
}
```

#### Pattern 2 : Initialisation Lazy

```typescript
// ✅ Bon : ne se connecte que si nécessaire
private async initializeMCPClient() {
  if (this.mcpClient) return;  // Déjà initialisé

  // Initialisation...
}

async execute(context, eventBus) {
  await this.initializeMCPClient();  // Appelé à la première requête
  // Suite...
}
```

#### Pattern 3 : Logs Structurés

```typescript
// ✅ Bon : logs clairs avec contexte
console.log(`[Math Server] Calling tool: ${name} with args:`, args);
console.log(`[Math Server] add(${a}, ${b}) = ${result}`);
console.log(`[Calculator Agent] Loaded ${tools.length} MCP tools:`, tools.map(t => t.name));
```

### Pièges à Éviter

❌ **Oublier de compiler le serveur MCP**

```bash
# ❌ Mauvais : lancer le fichier .ts
node src/mcp-servers/math-server.ts  # Erreur !

# ✅ Bon : compiler puis lancer
npm run build
node dist/mcp-servers/math-server.js
```

❌ **Mauvais chemin dans connectStdio**

```typescript
// ❌ Mauvais : chemin incorrect
await mcpClient.connectStdio({
  command: "node",
  args: ["src/mcp-servers/math-server.ts"]  // .ts non exécutable !
});

// ✅ Bon : chemin vers fichier compilé
await mcpClient.connectStdio({
  command: "node",
  args: ["dist/mcp-servers/math-server.js"]
});
```

❌ **Tool sans description claire**

```typescript
// ❌ Mauvais : le LLM ne saura pas quand l'utiliser
{
  name: "calc",
  description: "Does math",
  inputSchema: { ... }
}

// ✅ Bon : description explicite
{
  name: "calculate_trip_budget",
  description: "Calculate total trip budget including accommodation and meals",
  inputSchema: { ... }
}
```

### Points Clés à Retenir

1. **MCP Server** : expose des tools via stdio, SSE ou HTTP
2. **Tools** : fonctions avec name, description, inputSchema
3. **MCPClient** : connecte le LLM aux serveurs MCP
4. **LangChain** : adapter entre LLM et MCP, agent ReAct
5. **Agent A2A** : utilise MCP en interne, expose interface A2A
6. **Architecture hybride** : A2A pour orchestration, MCP pour capacités
7. **Stdio transport** : simple, local, faible latence
8. **Lazy initialization** : connecter au MCP server à la première requête

### Prochaines Étapes

Vous savez maintenant créer et intégrer des serveurs MCP ! Passez au dernier fichier pour une **vue d'ensemble complète du projet** avec tous les composants ensemble :

---

**Fichier suivant** : [05 - Guide Pratique : Projet Complet](./05-project-walkthrough.md)
