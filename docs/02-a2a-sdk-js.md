# 02 - Le SDK JavaScript A2A

## Table des Matières

1. [Introduction](#introduction)
2. [Installation et Configuration](#installation-et-configuration)
3. [Architecture d'un Agent A2A](#architecture-dun-agent-a2a)
4. [Côté Serveur : Créer un Agent](#côté-serveur--créer-un-agent)
   - [Agent Card](#agent-card)
   - [Executor](#executor)
   - [Express Server](#express-server)
5. [Côté Client : Appeler des Agents](#côté-client--appeler-des-agents)
6. [Event Publishing Pattern](#event-publishing-pattern)
7. [Gestion d'Erreurs](#gestion-derreurs)
8. [Exemples Complets](#exemples-complets)
9. [Résumé et Bonnes Pratiques](#résumé-et-bonnes-pratiques)

---

## Introduction

Le **SDK JavaScript A2A** (`@a2a-js/sdk`) est la bibliothèque officielle pour créer et utiliser des agents A2A en TypeScript/JavaScript.

### Que Fait le SDK ?

Le SDK fournit :

1. **Côté Serveur** :
   - `A2AExpressApp` : serveur Express configuré pour A2A
   - `AgentExecutor` : interface pour implémenter la logique métier
   - `ExecutionEventBus` : publier des événements et messages
   - `PushNotificationStore` : gérer les configurations webhook

2. **Côté Client** :
   - `A2AClient` : client pour appeler d'autres agents
   - `sendMessage()` : mode synchrone (blocking)
   - `sendMessageStream()` : mode streaming avec événements

3. **Types TypeScript** :
   - `Message`, `Task`, `Part`, `AgentCard`
   - Validation et auto-complétion

### Pourquoi Utiliser le SDK ?

✅ **Abstraction** : ne pas réinventer la roue (HTTP, SSE, webhooks)
✅ **Standardisation** : respecte automatiquement le protocole A2A
✅ **TypeScript** : typage fort, auto-complétion, erreurs à la compilation
✅ **Production-ready** : gestion d'erreurs, logs, reconnexion
✅ **Extensible** : facile d'ajouter des fonctionnalités

---

## Installation et Configuration

### Installation

```bash
npm install @a2a-js/sdk
```

Le SDK inclut :
- `@a2a-js/sdk/client` : client pour appeler des agents
- `@a2a-js/sdk/server` : serveur pour créer des agents
- Types TypeScript inclus

### Configuration TypeScript

Fichier : `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Node16",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**Important** : avec `moduleResolution: "Node16"`, tous les imports doivent utiliser l'extension `.js` (même pour les fichiers `.ts`) :

```typescript
// ✅ Correct
import { weatherAgentCard } from "./agent-card.js";
import { WeatherExecutor } from "./executor.js";

// ❌ Incorrect (erreur de compilation)
import { weatherAgentCard } from "./agent-card";
import { WeatherExecutor } from "./executor.ts";
```

### Structure de Projet

```
src/
├── agents/
│   ├── weather-agent/
│   │   ├── agent-card.ts     # Métadonnées agent
│   │   ├── executor.ts        # Logique métier
│   │   └── server.ts          # Serveur Express
│   ├── translator-agent/
│   ├── calculator-agent/
│   └── ...
├── client/
│   └── travel-demo.ts         # Client démo
└── utils/
    └── webhookServer.ts       # Serveur webhook

package.json                   # Scripts npm
.env                          # Variables d'environnement
```

---

## Architecture d'un Agent A2A

Chaque agent suit un **pattern 3 fichiers** standardisé :

```
agent-name/
├── agent-card.ts     # Qui suis-je ? (métadonnées)
├── executor.ts       # Que fais-je ? (logique)
└── server.ts         # Comment me contacter ? (API)
```

### Diagramme d'Architecture

```
┌────────────────────────────────────────────────┐
│                 Agent A2A                      │
│                                                │
│  ┌──────────────┐   ┌──────────────┐         │
│  │ Agent Card   │   │  Executor    │         │
│  │ (Metadata)   │   │  (Business   │         │
│  │              │   │   Logic)     │         │
│  └──────────────┘   └──────────────┘         │
│         │                   │                 │
│         └─────────┬─────────┘                 │
│                   │                           │
│           ┌───────▼────────┐                  │
│           │  Express App   │                  │
│           │  (A2AExpress)  │                  │
│           └───────┬────────┘                  │
│                   │                           │
└───────────────────┼───────────────────────────┘
                    │
                    │ HTTP/SSE
                    │
            ┌───────▼────────┐
            │   A2A Client   │
            │  (Appelant)    │
            └────────────────┘
```

### Responsabilités de Chaque Fichier

| Fichier | Responsabilité | Contenu Principal |
|---------|----------------|-------------------|
| `agent-card.ts` | Identité et capacités | `AgentCard` object |
| `executor.ts` | Logique métier | `AgentExecutor` class |
| `server.ts` | API HTTP et routing | `A2AExpressApp` setup |

---

## Côté Serveur : Créer un Agent

Voyons comment créer un agent complet en partant de l'agent le plus simple : **Weather Agent**.

### Agent Card

#### Fichier : `src/agents/weather-agent/agent-card.ts`

```typescript
import type { AgentCard } from "@a2a-js/sdk";

export const weatherAgentCard: AgentCard = {
  // Nom de l'agent (court et descriptif)
  name: "Weather Agent",

  // Description détaillée des capacités
  description: "Weather forecast agent using OpenWeatherMap API",

  // Liste des compétences
  skills: [
    {
      name: "get_weather",
      description: "Get weather information for a specific location",
      tags: ["weather", "forecast", "temperature"],
      examples: [
        "What is the weather in Paris?",
        "Tell me the weather forecast for Tokyo",
        "Current temperature in London"
      ]
    }
  ],

  // URL de base de l'agent
  url: `http://localhost:${process.env.WEATHER_AGENT_PORT || 4000}`,

  // Version du protocole A2A
  protocolVersion: "1.0"
};
```

**Points clés** :

- **name** : utilisé pour logs et identification
- **description** : explique le but de l'agent (humains + LLMs)
- **skills** : liste des capacités avec exemples concrets
- **examples** : aide les LLMs à savoir comment formuler les requêtes
- **url** : utilise variable d'environnement pour flexibilité
- **protocolVersion** : pour compatibilité future

#### Agent Card Complexe : Travel Planner

Fichier : `src/agents/travel-planner-agent/agent-card.ts`

```typescript
export const travelPlannerCard: AgentCard = {
  name: "Travel Planner Agent",
  description: "Travel planning orchestrator that coordinates multiple agents to create comprehensive itineraries",
  skills: [
    {
      name: "plan_trip",
      description: "Create detailed travel itineraries by orchestrating weather, translation, search, and budget agents",
      tags: ["travel", "planning", "orchestration", "itinerary"],
      examples: [
        "Plan a trip to Tokyo",
        "Tokyo, Paris, French",
        "Create itinerary for London, departure from Berlin, in German"
      ]
    }
  ],
  url: `http://localhost:${process.env.TRAVEL_PLANNER_AGENT_PORT || 4002}`,
  protocolVersion: "1.0"
};
```

**Différence** : le Travel Planner mentionne qu'il "orchestre" d'autres agents, donnant un contexte sur son rôle.

---

### Executor

L'**Executor** est le cœur de l'agent : il contient toute la logique métier.

#### Interface AgentExecutor

```typescript
interface AgentExecutor {
  // Exécuter une requête
  execute(
    context: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void>;

  // Annuler une tâche en cours (optionnel)
  cancelTask?(): Promise<void>;
}
```

#### RequestContext

Le contexte de la requête contient toutes les informations nécessaires :

```typescript
interface RequestContext {
  // Message envoyé par l'utilisateur/agent
  userMessage: Message

  // Task existante (si continuation)
  task?: Task

  // Configuration de push notifications (webhooks)
  pushNotificationConfig?: PushNotificationConfig
}
```

#### ExecutionEventBus

L'event bus permet de publier des messages et événements :

```typescript
interface ExecutionEventBus {
  // Publier un message ou event
  publish(event: Message | Task): void

  // Indiquer que l'exécution est terminée
  finished(): void

  // Gérer une erreur
  error(error: Error): void
}
```

**Pattern d'utilisation** :

```typescript
async execute(context: RequestContext, eventBus: ExecutionEventBus) {
  try {
    // 1. Traiter la requête
    const result = await this.processRequest(context.userMessage);

    // 2. Publier la réponse
    eventBus.publish({
      kind: "message",
      role: "agent",
      parts: [{ kind: "text", text: result }]
    });

    // 3. Indiquer la fin
    eventBus.finished();

  } catch (error: any) {
    // 4. Gérer les erreurs
    eventBus.publish({
      kind: "message",
      role: "agent",
      parts: [{ kind: "text", text: `Error: ${error.message}` }]
    });
    eventBus.finished();
  }
}
```

#### Exemple Complet : Weather Agent Executor

Fichier : `src/agents/weather-agent/executor.ts`

```typescript
import { v4 as uuidv4 } from "uuid";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type { Message } from "@a2a-js/sdk";

export class WeatherAgentExecutor implements AgentExecutor {
  private apiKey: string;

  constructor() {
    // Récupérer la clé API depuis les variables d'environnement
    this.apiKey = process.env.OPENWEATHER_API_KEY || "";
    if (!this.apiKey) {
      console.warn("[Weather Agent] No API key, using mock data");
    }
  }

  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const userMessage = requestContext.userMessage;
    const existingTask = requestContext.task;

    // Générer les IDs nécessaires
    const taskId = existingTask?.id || uuidv4();
    const contextId = userMessage.contextId || existingTask?.contextId || uuidv4();

    try {
      // Extraire le texte de la requête
      const userText = userMessage.parts.find((p) => p.kind === "text")?.text || "";
      if (!userText) {
        throw new Error("No text content in message");
      }

      console.log(`[Weather Agent] Processing request: ${userText}`);

      // Extraire la ville de la requête
      const city = this.extractCity(userText);
      console.log(`[Weather Agent] City detected: ${city}`);

      // Récupérer les données météo
      const weatherData = await this.fetchWeather(city);

      // Créer le message de réponse
      const responseMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: weatherData,
          },
        ],
        contextId,
        taskId,
      };

      // Publier la réponse
      eventBus.publish(responseMessage);
      eventBus.finished();

      console.log("[Weather Agent] Request completed");

    } catch (error: any) {
      console.error("[Weather Agent] Error:", error);

      // Publier un message d'erreur
      const errorMessage: Message = {
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [
          { kind: "text", text: `Error fetching weather: ${error.message}` },
        ],
        contextId: contextId,
        taskId: taskId,
      };

      eventBus.publish(errorMessage);
      eventBus.finished();
    }
  }

  private extractCity(text: string): string {
    // Logique simple d'extraction
    const match = text.match(/(?:in|for|at)\s+([A-Za-z\s]+)/i);
    return match ? match[1].trim() : "Paris"; // Défaut
  }

  private async fetchWeather(city: string): Promise<string> {
    if (!this.apiKey) {
      // Mode mock si pas de clé API
      return this.getMockWeather(city);
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Formater la réponse
      return `Current temperature in ${city} is ${data.main.temp}°C with ${data.weather[0].description}.`;

    } catch (error: any) {
      console.error("[Weather Agent] API error:", error);
      throw new Error(`Failed to fetch weather for ${city}`);
    }
  }

  private getMockWeather(city: string): string {
    return `Current temperature in ${city} is 22°C with partly cloudy skies. (Mock data)`;
  }

  async cancelTask(): Promise<void> {
    console.log("[Weather Agent] Task cancellation requested");
  }
}
```

**Points clés de l'implémentation** :

1. **Constructor** : initialisation (API keys, config)
2. **execute()** : point d'entrée principal
3. **Extraction du contexte** : taskId, contextId
4. **Traitement métier** : `extractCity()`, `fetchWeather()`
5. **Publication du résultat** : `eventBus.publish()`
6. **Gestion d'erreurs** : try/catch avec publication d'erreur
7. **Mode mock** : fallback si pas de clé API

#### Exemple Avancé : Travel Planner Executor

Le Travel Planner est plus complexe car il orchestre plusieurs agents.

Fichier : `src/agents/travel-planner-agent/executor.ts` (version simplifiée)

```typescript
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
      // Initialiser le modèle Gemini
      this.model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY!,
        model: "gemini-2.0-flash-exp",
        temperature: 0.7,
      });
    }

    console.log(`[Travel Planner] Mode: ${this.useMock ? "MOCK" : "LIVE"}`);
  }

  private async initializeA2AClients() {
    // Connecter aux autres agents
    const WEB_SEARCH_URL = `http://localhost:${process.env.WEB_SEARCH_AGENT_PORT || 4003}`;
    const WEATHER_URL = `http://localhost:${process.env.WEATHER_AGENT_PORT || 4000}`;
    const CALCULATOR_URL = `http://localhost:${process.env.CALCULATOR_AGENT_PORT || 4004}`;
    const TRANSLATOR_URL = `http://localhost:${process.env.TRANSLATOR_AGENT_PORT || 4001}`;

    try {
      // Créer des clients A2A depuis les Agent Cards
      this.webSearchClient = await A2AClient.fromCardUrl(
        `${WEB_SEARCH_URL}/.well-known/agent-card.json`
      );
      this.weatherClient = await A2AClient.fromCardUrl(
        `${WEATHER_URL}/.well-known/agent-card.json`
      );
      this.calculatorClient = await A2AClient.fromCardUrl(
        `${CALCULATOR_URL}/.well-known/agent-card.json`
      );
      this.translatorClient = await A2AClient.fromCardUrl(
        `${TRANSLATOR_URL}/.well-known/agent-card.json`
      );

      console.log("[Travel Planner] Connected to all agents");
    } catch (error: any) {
      console.error("[Travel Planner] Failed to connect:", error.message);
      throw error;
    }
  }

  private async callAgent(
    client: A2AClient,
    agentName: string,
    query: string
  ): Promise<string> {
    console.log(`[Travel Planner] Calling ${agentName}`);

    // Créer le message
    const params: MessageSendParams = {
      message: {
        messageId: uuidv4(),
        role: "user",
        parts: [{ kind: "text", text: query }],
        kind: "message",
      },
    };

    // Utiliser le streaming pour recevoir la réponse
    const stream = client.sendMessageStream(params);
    let finalResponse = "";

    try {
      // Itérer sur les événements du stream
      for await (const event of stream) {
        if (event.kind === "message" && event.role === "agent") {
          const text = event.parts
            .filter((p) => p.kind === "text")
            .map((p) => p.text)
            .join(" ");
          if (text) finalResponse = text;
        }
      }

      console.log(`[Travel Planner] ${agentName} completed`);
      return finalResponse;

    } catch (error: any) {
      console.error(`[Travel Planner] ${agentName} failed:`, error.message);
      throw error;
    }
  }

  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const userMessage = requestContext.userMessage;
    const taskId = requestContext.task?.id || uuidv4();
    const contextId = userMessage.contextId || uuidv4();

    try {
      const userText = userMessage.parts.find((p) => p.kind === "text")?.text || "";
      console.log(`[Travel Planner] Planning trip: ${userText}`);

      // Parser l'entrée : "Tokyo, Paris, French"
      const { destination, departure, language } = this.parseUserInput(userText);

      // Initialiser les clients A2A
      if (!this.useMock) {
        await this.initializeA2AClients();
      }

      // Orchestration : appeler tous les agents
      const activitiesInfo = await this.getActivitiesInfo(destination);
      const weatherInfo = await this.getWeatherInfo(destination);
      const budgetInfo = await this.getBudgetInfo();

      // Générer l'itinéraire avec toutes les infos
      const itinerary = await this.generateItinerary(
        departure,
        destination,
        activitiesInfo,
        weatherInfo,
        budgetInfo
      );

      // Traduire si nécessaire
      const finalReport = await this.translateReport(itinerary, language);

      // Publier le résultat final
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

      eventBus.publish({
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{ kind: "text", text: `Error: ${error.message}` }],
        contextId,
        taskId,
      });
      eventBus.finished();
    }
  }

  async cancelTask(): Promise<void> {
    console.log("[Travel Planner] Task cancelled");
  }
}
```

**Points clés de l'orchestration** :

1. **Initialisation de clients A2A** : `A2AClient.fromCardUrl()`
2. **Appels séquentiels** : chaque agent appelé l'un après l'autre
3. **Streaming interne** : `sendMessageStream()` pour recevoir les réponses
4. **Agrégation** : combiner toutes les informations
5. **Réponse unique** : un seul message final publié

---

### Express Server

Le serveur Express expose l'agent via HTTP.

#### Fichier : `src/agents/weather-agent/server.ts`

```typescript
import "dotenv/config";
import express from "express";
import { A2AExpressApp } from "@a2a-js/sdk/server";
import { weatherAgentCard } from "./agent-card.js";
import { WeatherAgentExecutor } from "./executor.js";

const PORT = process.env.WEATHER_AGENT_PORT || 4000;

// Créer l'executor
const weatherExecutor = new WeatherAgentExecutor();

// Créer l'application Express avec A2A
const a2aApp = new A2AExpressApp({
  defaultExecutor: weatherExecutor,
  agentCard: weatherAgentCard,
});

// Obtenir l'app Express
const app = a2aApp.getApp();

// Route de santé (optionnel)
app.get("/health", (req, res) => {
  res.json({ status: "healthy", agent: weatherAgentCard.name });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`[Weather Agent] Server listening on port ${PORT}`);
  console.log(`[Weather Agent] Agent Card: http://localhost:${PORT}/.well-known/agent-card.json`);
});
```

**Points clés** :

1. **Charger .env** : `import "dotenv/config"`
2. **Créer l'executor** : instance de la classe Executor
3. **A2AExpressApp** : wrapper qui configure Express automatiquement
4. **defaultExecutor** : executor à utiliser par défaut
5. **agentCard** : métadonnées exposées automatiquement
6. **Routes automatiques** : le SDK crée les routes A2A automatiquement

#### Routes Créées Automatiquement par le SDK

Le SDK expose automatiquement :

| Route | Méthode | Description |
|-------|---------|-------------|
| `/.well-known/agent-card.json` | GET | Renvoie l'Agent Card |
| `/sendMessage` | POST | Envoyer un message (mode blocking) |
| `/sendMessageStream` | POST | Envoyer un message (mode streaming) |

#### Configuration Avancée : Travel Planner avec Push Notifications

Fichier : `src/agents/travel-planner-agent/server.ts`

```typescript
import "dotenv/config";
import express from "express";
import {
  A2AExpressApp,
  InMemoryPushNotificationStore,
  DefaultPushNotificationSender,
} from "@a2a-js/sdk/server";
import { travelPlannerCard } from "./agent-card.js";
import { TravelPlannerAgentExecutor } from "./executor.js";

const PORT = process.env.TRAVEL_PLANNER_AGENT_PORT || 4002;

// Créer l'executor
const travelPlannerExecutor = new TravelPlannerAgentExecutor();

// Configuration Push Notifications (webhooks)
const pushStore = new InMemoryPushNotificationStore();
const pushSender = new DefaultPushNotificationSender(pushStore);

// Créer l'application A2A
const a2aApp = new A2AExpressApp({
  defaultExecutor: travelPlannerExecutor,
  agentCard: travelPlannerCard,
  pushNotificationStore: pushStore,
  pushNotificationSender: pushSender,
});

const app = a2aApp.getApp();

app.get("/health", (req, res) => {
  res.json({ status: "healthy", agent: travelPlannerCard.name });
});

app.listen(PORT, () => {
  console.log(`[Travel Planner] Server listening on port ${PORT}`);
  console.log(`[Travel Planner] Agent Card: http://localhost:${PORT}/.well-known/agent-card.json`);
});
```

**Différence** : ajout de `pushNotificationStore` et `pushNotificationSender` pour supporter les webhooks.

---

## Côté Client : Appeler des Agents

Le SDK fournit `A2AClient` pour appeler des agents A2A.

### Créer un Client A2A

#### Option 1 : Depuis une Agent Card URL

```typescript
import { A2AClient } from "@a2a-js/sdk/client";

// Se connecter à l'agent via son Agent Card
const weatherClient = await A2AClient.fromCardUrl(
  "http://localhost:4000/.well-known/agent-card.json"
);
```

**Avantage** : découverte automatique des capacités de l'agent.

#### Option 2 : Depuis un Agent Card Object

```typescript
import { A2AClient } from "@a2a-js/sdk/client";
import { weatherAgentCard } from "./agents/weather-agent/agent-card.js";

const weatherClient = await A2AClient.fromCard(weatherAgentCard);
```

**Avantage** : pas besoin que le serveur soit démarré (utile pour tests).

### Envoyer un Message : Mode Blocking

Le mode **blocking** attend la réponse complète avant de retourner.

#### Exemple : Client Travel Demo

Fichier : `src/client/travel-demo.ts`

```typescript
import { A2AClient } from "@a2a-js/sdk/client";
import { v4 as uuidv4 } from "uuid";
import type { MessageSendParams } from "@a2a-js/sdk";
import * as readline from "readline";

async function main() {
  const TRAVEL_PLANNER_URL = `http://localhost:${process.env.TRAVEL_PLANNER_AGENT_PORT || 4002}`;

  // Créer le client
  console.log("Connecting to Travel Planner...");
  const travelClient = await A2AClient.fromCardUrl(
    `${TRAVEL_PLANNER_URL}/.well-known/agent-card.json`
  );
  console.log("Connected successfully\n");

  // Interface readline pour input utilisateur
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const destination = await askQuestion(rl, "Enter destination city: ");
  const departure = await askQuestion(rl, "Enter departure city: ");
  const language = await askQuestion(rl, "Enter language (English/French): ");

  rl.close();

  // Construire l'input
  const userInput = `${destination}, ${departure}, ${language}`;
  console.log(`\nPlanning trip: ${userInput}\n`);

  // Créer le message
  const params: MessageSendParams = {
    message: {
      messageId: uuidv4(),
      role: "user",
      parts: [{ kind: "text", text: userInput }],
      kind: "message",
    },
    configuration: {
      blocking: true,  // Mode synchrone
    },
  };

  // Envoyer et attendre la réponse
  console.log("Sending request to Travel Planner...");
  const response = await travelClient.sendMessage(params);

  // Traiter la réponse
  if (response.result.kind === "message") {
    const text = response.result.parts
      .filter((p) => p.kind === "text")
      .map((p) => p.text)
      .join("\n");

    console.log("\n" + "=".repeat(50));
    console.log("TRAVEL REPORT");
    console.log("=".repeat(50));
    console.log(text);
    console.log("=".repeat(50));
  } else if (response.result.kind === "task") {
    console.log(`Task created: ${response.result.id}`);
    console.log(`Status: ${response.result.status}`);
  }
}

function askQuestion(rl: any, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer.trim());
    });
  });
}

main().catch(console.error);
```

**Points clés** :

1. **A2AClient.fromCardUrl()** : connexion au Travel Planner
2. **readline** : interface CLI pour l'utilisateur
3. **MessageSendParams** : construction du message avec `blocking: true`
4. **sendMessage()** : envoi synchrone, retourne une `Promise`
5. **Traitement de la réponse** : extraction du texte des parts

### Envoyer un Message : Mode Streaming

Le mode **streaming** reçoit des événements progressifs.

#### Exemple : Travel Planner Appelle Weather Agent

Fichier : `src/agents/travel-planner-agent/executor.ts`

```typescript
private async callAgent(
  client: A2AClient,
  agentName: string,
  query: string
): Promise<string> {
  console.log(`[Travel Planner] Calling ${agentName}`);

  // Créer le message
  const params: MessageSendParams = {
    message: {
      messageId: uuidv4(),
      role: "user",
      parts: [{ kind: "text", text: query }],
      kind: "message",
    },
  };

  // Créer le stream
  const stream = client.sendMessageStream(params);
  let finalResponse = "";

  try {
    // Itérer sur les événements
    for await (const event of stream) {
      console.log(`[Travel Planner] Event received: ${event.kind}`);

      // Traiter les messages
      if (event.kind === "message" && event.role === "agent") {
        const text = event.parts
          .filter((p) => p.kind === "text")
          .map((p) => p.text)
          .join(" ");

        if (text) {
          finalResponse = text;
          console.log(`[Travel Planner] Response: ${text.substring(0, 50)}...`);
        }
      }

      // Traiter les tasks (optionnel)
      if (event.kind === "task") {
        console.log(`[Travel Planner] Task status: ${event.status}`);
      }
    }

    console.log(`[Travel Planner] ${agentName} completed`);
    return finalResponse;

  } catch (error: any) {
    console.error(`[Travel Planner] ${agentName} failed:`, error.message);
    throw new Error(`${agentName} failed: ${error.message}`);
  }
}
```

**Points clés** :

1. **sendMessageStream()** : retourne un `AsyncIterable`
2. **for await...of** : itération asynchrone sur les événements
3. **event.kind** : distinguer messages, tasks, erreurs
4. **Accumulation** : garder le dernier message reçu
5. **Gestion d'erreurs** : try/catch autour du stream

### Comparaison sendMessage vs sendMessageStream

| Critère | sendMessage() | sendMessageStream() |
|---------|---------------|---------------------|
| **Retour** | `Promise<{ result: Message \| Task }>` | `AsyncIterable<Message \| Task>` |
| **Usage** | `await client.sendMessage(params)` | `for await (const event of stream)` |
| **Événements** | Un seul résultat final | Plusieurs événements progressifs |
| **Configuration** | `blocking: true` recommandé | Pas de configuration blocking |
| **Cas d'usage** | Client final (CLI, script) | Agent orchestrateur, UI temps réel |

---

## Event Publishing Pattern

### Philosophie du Pattern

Quand un agent exécute une requête, il doit **publier des événements** pour communiquer son état et ses résultats.

#### Pattern Simple : Un Message Final

**Utilisé par** : Weather Agent, Translator Agent, Calculator Agent

```typescript
async execute(context: RequestContext, eventBus: ExecutionEventBus) {
  try {
    // 1. Faire le travail
    const result = await this.performWork(context.userMessage);

    // 2. Publier UN message final
    eventBus.publish({
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [{ kind: "text", text: result }],
      contextId: context.userMessage.contextId,
      taskId: context.task?.id
    });

    // 3. Terminer
    eventBus.finished();

  } catch (error: any) {
    // Publier l'erreur
    eventBus.publish({
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [{ kind: "text", text: `Error: ${error.message}` }]
    });
    eventBus.finished();
  }
}
```

**Avantages** :

- ✅ Simple à comprendre
- ✅ Facile à débugger
- ✅ Pas de gestion de state complexe
- ✅ Fonctionne en mode blocking et streaming

#### Pattern Avancé : Messages Progressifs

**Utilisé par** : agents avec opérations longues

```typescript
async execute(context: RequestContext, eventBus: ExecutionEventBus) {
  try {
    // Étape 1 : Initialisation
    eventBus.publish({
      kind: "message",
      role: "agent",
      parts: [{ kind: "text", text: "Starting analysis..." }]
    });

    const data = await this.fetchData();

    // Étape 2 : Progression
    eventBus.publish({
      kind: "message",
      role: "agent",
      parts: [{ kind: "text", text: "Data fetched, processing..." }]
    });

    const result = await this.processData(data);

    // Étape 3 : Finalisation
    eventBus.publish({
      kind: "message",
      role: "agent",
      parts: [{ kind: "text", text: `Analysis complete: ${result}` }]
    });

    eventBus.finished();

  } catch (error: any) {
    eventBus.publish({
      kind: "message",
      role: "agent",
      parts: [{ kind: "text", text: `Error: ${error.message}` }]
    });
    eventBus.finished();
  }
}
```

**Avantages** :

- ✅ Feedback en temps réel
- ✅ Meilleure UX
- ✅ Possibilité d'annulation intermédiaire

**Inconvénients** :

- ❌ Plus complexe
- ❌ Nécessite streaming côté client

### Pattern Utilisé dans le Projet : Simplifié

Notre projet utilise une approche **hybride et simplifiée** :

- **Agents simples** (Weather, Translator) : un message final
- **Travel Planner** : un message final APRÈS orchestration complète
- **Orchestration interne** : streaming entre Travel Planner et sous-agents
- **Client externe** : reçoit une seule réponse (mode blocking)

**Pourquoi ?**

1. **Simplicité** : facile à expliquer et à maintenir
2. **Performance** : orchestration efficace en interne
3. **UX cohérente** : le client n'a pas à gérer le streaming
4. **Évolutivité** : peut facilement passer en mode streaming si besoin

---

## Gestion d'Erreurs

### Principes de Gestion d'Erreurs en A2A

1. **Toujours catcher** : jamais laisser une exception non catchée
2. **Publier l'erreur** : utiliser `eventBus.publish()` avec le message d'erreur
3. **Appeler finished()** : même en cas d'erreur
4. **Logger** : utiliser `console.error()` pour les logs serveur
5. **Messages clairs** : expliquer l'erreur à l'utilisateur

### Pattern de Base

```typescript
async execute(context: RequestContext, eventBus: ExecutionEventBus) {
  const taskId = context.task?.id || uuidv4();
  const contextId = context.userMessage.contextId || uuidv4();

  try {
    // Logique métier
    const result = await this.doWork();

    // Publier succès
    eventBus.publish({
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [{ kind: "text", text: result }],
      contextId,
      taskId,
    });
    eventBus.finished();

  } catch (error: any) {
    // Logger côté serveur
    console.error(`[Agent] Error:`, error);

    // Publier message d'erreur côté client
    eventBus.publish({
      kind: "message",
      messageId: uuidv4(),
      role: "agent",
      parts: [
        { kind: "text", text: `Error: ${error.message}` }
      ],
      contextId,
      taskId,
    });
    eventBus.finished();
  }
}
```

### Gestion d'Erreurs Spécifiques

#### 1. Erreur de Validation

```typescript
async execute(context: RequestContext, eventBus: ExecutionEventBus) {
  try {
    const userText = context.userMessage.parts.find(p => p.kind === "text")?.text;

    // Validation
    if (!userText || userText.trim() === "") {
      throw new Error("No text content in message");
    }

    // Validation métier
    if (!this.isValidInput(userText)) {
      throw new Error("Invalid input format. Expected: 'destination, departure, language'");
    }

    // Suite du traitement...

  } catch (error: any) {
    eventBus.publish({
      kind: "message",
      role: "agent",
      parts: [{ kind: "text", text: `Validation error: ${error.message}` }]
    });
    eventBus.finished();
  }
}
```

#### 2. Erreur d'API Externe

```typescript
private async fetchWeather(city: string): Promise<string> {
  try {
    const response = await fetch(this.buildApiUrl(city));

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return this.formatWeatherData(data);

  } catch (error: any) {
    console.error("[Weather Agent] API error:", error);

    // Fallback sur mock data
    if (this.canUseMockData) {
      console.log("[Weather Agent] Using mock data as fallback");
      return this.getMockWeather(city);
    }

    throw new Error(`Failed to fetch weather for ${city}: ${error.message}`);
  }
}
```

#### 3. Erreur d'Orchestration

```typescript
async execute(context: RequestContext, eventBus: ExecutionEventBus) {
  try {
    // Initialiser les clients
    await this.initializeA2AClients();

    // Appeler les agents avec gestion d'erreurs individuelle
    const results = await Promise.allSettled([
      this.getWeatherInfo(destination),
      this.getActivitiesInfo(destination),
      this.getBudgetInfo()
    ]);

    // Vérifier les résultats
    const errors = results
      .filter(r => r.status === "rejected")
      .map(r => (r as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      console.error("[Travel Planner] Some agents failed:", errors);
      throw new Error(`Failed to gather all information: ${errors.join(", ")}`);
    }

    // Extraire les valeurs
    const [weatherInfo, activitiesInfo, budgetInfo] = results.map(
      r => (r as PromiseFulfilledResult<string>).value
    );

    // Suite du traitement...

  } catch (error: any) {
    eventBus.publish({
      kind: "message",
      role: "agent",
      parts: [{ kind: "text", text: `Orchestration error: ${error.message}` }]
    });
    eventBus.finished();
  }
}
```

### Messages d'Erreur Utilisateur-Friendly

❌ **Mauvais** :

```typescript
throw new Error("TypeError: Cannot read property 'text' of undefined");
```

✅ **Bon** :

```typescript
throw new Error("Invalid message format: missing text content");
```

❌ **Mauvais** :

```typescript
throw new Error("Error 500");
```

✅ **Bon** :

```typescript
throw new Error("Weather API is currently unavailable. Please try again later.");
```

---

## Exemples Complets

### Exemple 1 : Agent Simple (Weather Agent)

Structure complète d'un agent simple.

#### agent-card.ts

```typescript
import type { AgentCard } from "@a2a-js/sdk";

export const weatherAgentCard: AgentCard = {
  name: "Weather Agent",
  description: "Weather forecast agent using OpenWeatherMap API",
  skills: [
    {
      name: "get_weather",
      description: "Get weather information for a specific location",
      tags: ["weather", "forecast"],
      examples: ["What is the weather in Paris?"]
    }
  ],
  url: `http://localhost:${process.env.WEATHER_AGENT_PORT || 4000}`,
  protocolVersion: "1.0"
};
```

#### executor.ts

```typescript
import { v4 as uuidv4 } from "uuid";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type { Message } from "@a2a-js/sdk";

export class WeatherAgentExecutor implements AgentExecutor {
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const taskId = requestContext.task?.id || uuidv4();
    const contextId = requestContext.userMessage.contextId || uuidv4();

    try {
      const userText = requestContext.userMessage.parts
        .find(p => p.kind === "text")?.text || "";

      const city = this.extractCity(userText);
      const weather = await this.fetchWeather(city);

      eventBus.publish({
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{ kind: "text", text: weather }],
        contextId,
        taskId,
      });
      eventBus.finished();

    } catch (error: any) {
      eventBus.publish({
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{ kind: "text", text: `Error: ${error.message}` }],
        contextId,
        taskId,
      });
      eventBus.finished();
    }
  }

  private extractCity(text: string): string {
    const match = text.match(/(?:in|for|at)\s+([A-Za-z\s]+)/i);
    return match ? match[1].trim() : "Paris";
  }

  private async fetchWeather(city: string): Promise<string> {
    return `Current temperature in ${city} is 22°C with partly cloudy skies.`;
  }

  async cancelTask(): Promise<void> {}
}
```

#### server.ts

```typescript
import "dotenv/config";
import { A2AExpressApp } from "@a2a-js/sdk/server";
import { weatherAgentCard } from "./agent-card.js";
import { WeatherAgentExecutor } from "./executor.js";

const PORT = process.env.WEATHER_AGENT_PORT || 4000;
const weatherExecutor = new WeatherAgentExecutor();

const a2aApp = new A2AExpressApp({
  defaultExecutor: weatherExecutor,
  agentCard: weatherAgentCard,
});

const app = a2aApp.getApp();

app.listen(PORT, () => {
  console.log(`[Weather Agent] Server listening on port ${PORT}`);
});
```

### Exemple 2 : Client Simple

```typescript
import { A2AClient } from "@a2a-js/sdk/client";
import { v4 as uuidv4 } from "uuid";

async function testWeatherAgent() {
  // Connexion
  const client = await A2AClient.fromCardUrl(
    "http://localhost:4000/.well-known/agent-card.json"
  );

  // Requête
  const response = await client.sendMessage({
    message: {
      messageId: uuidv4(),
      role: "user",
      parts: [{ kind: "text", text: "What is the weather in Tokyo?" }],
      kind: "message",
    },
    configuration: { blocking: true },
  });

  // Affichage
  if (response.result.kind === "message") {
    const text = response.result.parts
      .filter(p => p.kind === "text")
      .map(p => p.text)
      .join("\n");
    console.log(text);
  }
}

testWeatherAgent();
```

---

## Résumé et Bonnes Pratiques

### Checklist pour Créer un Agent

- [ ] **Agent Card** : nom, description, skills avec exemples
- [ ] **Executor** : implémenter `AgentExecutor` interface
- [ ] **execute()** : logique métier avec try/catch
- [ ] **eventBus.publish()** : publier messages de réponse
- [ ] **eventBus.finished()** : toujours appeler (succès ET erreur)
- [ ] **Server** : A2AExpressApp avec executor et agentCard
- [ ] **Variables d'environnement** : port, API keys
- [ ] **Logs** : préfixe `[Agent Name]` pour clarté
- [ ] **Tests** : vérifier fonctionnement en isolation

### Checklist pour Créer un Client

- [ ] **A2AClient** : créer depuis Agent Card URL
- [ ] **sendMessage()** : mode blocking pour simplicité
- [ ] **sendMessageStream()** : mode streaming si besoin feedback
- [ ] **Gestion de réponse** : vérifier `result.kind`
- [ ] **Gestion d'erreurs** : try/catch autour des appels
- [ ] **UUIDs** : générer messageId unique par message

### Patterns Recommandés

#### Pattern 1 : Agent Simple

```typescript
// Un seul message final
eventBus.publish(responseMessage);
eventBus.finished();
```

**Utilisé par** : Weather, Translator, Web Search

#### Pattern 2 : Agent Orchestrateur

```typescript
// Appeler plusieurs agents
const results = await Promise.all([
  this.callAgent1(),
  this.callAgent2(),
  this.callAgent3()
]);

// Agréger les résultats
const finalResult = this.aggregate(results);

// Publier une seule réponse finale
eventBus.publish(finalResultMessage);
eventBus.finished();
```

**Utilisé par** : Travel Planner

#### Pattern 3 : Agent avec Feedback Progressif

```typescript
// Message initial
eventBus.publish(startMessage);

// Messages de progression
eventBus.publish(progressMessage1);
eventBus.publish(progressMessage2);

// Message final
eventBus.publish(finalMessage);
eventBus.finished();
```

**Non utilisé dans ce projet** (pour simplicité)

### Pièges à Éviter

❌ **Ne jamais oublier `eventBus.finished()`**

```typescript
// ❌ Mauvais : jamais terminé
eventBus.publish(message);
// Oubli de finished()
```

```typescript
// ✅ Bon
eventBus.publish(message);
eventBus.finished();
```

❌ **Ne pas gérer les erreurs**

```typescript
// ❌ Mauvais : exception non catchée
async execute(context, eventBus) {
  const result = await riskyOperation();
  eventBus.publish(message);
  eventBus.finished();
}
```

```typescript
// ✅ Bon : try/catch
async execute(context, eventBus) {
  try {
    const result = await riskyOperation();
    eventBus.publish(message);
    eventBus.finished();
  } catch (error) {
    eventBus.publish(errorMessage);
    eventBus.finished();
  }
}
```

❌ **Utiliser des imports sans extension `.js`**

```typescript
// ❌ Mauvais : erreur avec Node16 module resolution
import { Card } from "./agent-card";
```

```typescript
// ✅ Bon
import { Card } from "./agent-card.js";
```

### Points Clés à Retenir

1. **Pattern 3 Fichiers** : agent-card.ts, executor.ts, server.ts
2. **AgentExecutor** : interface avec `execute()` et `cancelTask()`
3. **ExecutionEventBus** : `publish()` + `finished()` obligatoires
4. **A2AExpressApp** : wrapper Express qui gère tout automatiquement
5. **A2AClient** : `fromCardUrl()` pour découverte, `sendMessage()` pour appels
6. **Modes de communication** : blocking (simple) vs streaming (feedback)
7. **Gestion d'erreurs** : toujours try/catch + publier erreur + finished()

### Prochaines Étapes

Vous maîtrisez maintenant le SDK JavaScript A2A ! Passez au fichier suivant pour comprendre :

- **MCP (Model Context Protocol)** : comment donner des capacités aux LLMs
- **Différence A2A vs MCP** : quand utiliser l'un ou l'autre
- **Intégration** : combiner A2A et MCP dans un même système

---

**Fichier suivant** : [03 - Le Protocole MCP](./03-mcp-protocol.md)
