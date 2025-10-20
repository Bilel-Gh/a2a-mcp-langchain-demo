# 05 - Guide Pratique : Projet Travel Planner Multi-Agent

## Table des Matières

1. [Introduction](#introduction)
2. [Architecture Globale](#architecture-globale)
3. [Flow Complet d'une Requête](#flow-complet-dune-requête)
4. [Agents en Détail](#agents-en-détail)
5. [Mode Mock vs Live](#mode-mock-vs-live)
6. [Configuration et Démarrage](#configuration-et-démarrage)
7. [Logs et Debugging](#logs-et-debugging)
8. [Extension du Projet](#extension-du-projet)
9. [Troubleshooting](#troubleshooting)
10. [Résumé Final](#résumé-final)

---

## Introduction

Ce projet démontre une **architecture multi-agent complète** combinant :

- **Protocole A2A** : communication agent-à-agent
- **SDK JavaScript A2A** : création et orchestration d'agents
- **Protocole MCP** : capacités étendues pour LLMs
- **LangChain** : intégration LLM + MCP

### Objectif du Projet

Créer un système de **planification de voyages** où :

1. Un utilisateur entre : destination, départ, langue
2. Le **Travel Planner** orchestre plusieurs agents spécialisés
3. Chaque agent fournit une information spécifique (météo, traduction, budget, activités)
4. Le Travel Planner génère un itinéraire complet et traduit
5. L'utilisateur reçoit un rapport de voyage détaillé

### Technologies Utilisées

| Technologie | Usage |
|-------------|-------|
| **TypeScript** | Langage principal |
| **Node.js** | Runtime |
| **Express** | Serveur HTTP |
| **@a2a-js/sdk** | Protocole A2A (serveur + client) |
| **@modelcontextprotocol/sdk** | Protocole MCP (serveur) |
| **@langchain/mcp** | Client MCP pour LangChain |
| **@langchain/google-genai** | LLM Gemini |
| **OpenWeatherMap API** | Données météo |
| **Brave Search API** | Recherche web |
| **Google Gemini API** | Traduction + génération itinéraires |

---

## Architecture Globale

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                      TRAVEL PLANNER SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Client Demo    │  Interface CLI utilisateur
│  (travel-demo)  │  Port: N/A (client uniquement)
└────────┬────────┘
         │
         │ A2A: sendMessage(blocking: true)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│               Travel Planner Agent (Orchestrateur)              │
│               Port: 4002                                        │
│               - Parse requête (destination, départ, langue)     │
│               - Orchestre tous les agents                       │
│               - Génère itinéraire avec Gemini                   │
│               - Traduit le rapport final                        │
└────────┬────────────────────────────────────────────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┬───────────┐
         │              │              │              │           │
         ▼              ▼              ▼              ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   Weather   │ │ Translator  │ │   Web    │ │Calculator│ │  Webhook │
│   Agent     │ │   Agent     │ │  Search  │ │  Agent   │ │  Server  │
│             │ │             │ │  Agent   │ │          │ │ (Notif.) │
│ Port: 4000  │ │ Port: 4001  │ │Port: 4003│ │Port: 4004│ │Port: 5000│
└─────────────┘ └─────────────┘ └──────────┘ └────┬─────┘ └──────────┘
                                                    │
                                                    │ MCP
                                                    ▼
                                          ┌──────────────────┐
                                          │  Math MCP Server │
                                          │  (stdio)         │
                                          │  - add()         │
                                          │  - multiply()    │
                                          │  - calculate_    │
                                          │    trip_budget() │
                                          └──────────────────┘
```

### Composants Principaux

#### 1. Client Demo (`src/client/travel-demo.ts`)

- **Rôle** : interface utilisateur CLI
- **Responsabilités** :
  - Demander destination, départ, langue
  - Envoyer requête au Travel Planner (mode blocking)
  - Afficher le rapport de voyage

#### 2. Travel Planner Agent (`src/agents/travel-planner-agent/`)

- **Rôle** : orchestrateur principal
- **Responsabilités** :
  - Parser l'entrée utilisateur
  - Appeler tous les agents spécialisés (Weather, Translator, etc.)
  - Agréger les informations
  - Générer un itinéraire avec Gemini AI
  - Traduire le rapport final

#### 3. Weather Agent (`src/agents/weather-agent/`)

- **Rôle** : fournir informations météo
- **Responsabilités** :
  - Extraire la ville de la requête
  - Interroger OpenWeatherMap API
  - Retourner température et conditions

#### 4. Translator Agent (`src/agents/translator-agent/`)

- **Rôle** : traduire du texte
- **Responsabilités** :
  - Extraire langue cible et texte
  - Utiliser Gemini AI pour traduire
  - Retourner texte traduit

#### 5. Web Search Agent (`src/agents/web-search-agent/`)

- **Rôle** : rechercher informations sur destinations
- **Responsabilités** :
  - Interroger Brave Search API
  - Extraire activités et attractions
  - Retourner suggestions

#### 6. Calculator Agent (`src/agents/calculator-agent/`)

- **Rôle** : effectuer calculs précis
- **Responsabilités** :
  - Se connecter au Math MCP Server
  - Charger les tools MCP
  - Utiliser LangChain + Gemini pour choisir le bon tool
  - Exécuter calculs et retourner résultats

#### 7. Math MCP Server (`src/mcp-servers/math-server.ts`)

- **Rôle** : exposer tools mathématiques
- **Responsabilités** :
  - Tool `add` : additionner deux nombres
  - Tool `multiply` : multiplier deux nombres
  - Tool `calculate_trip_budget` : calculer budget voyage

#### 8. Webhook Server (`src/utils/webhookServer.ts`)

- **Rôle** : recevoir notifications asynchrones
- **Responsabilités** :
  - Démarrer serveur Express sur port disponible
  - Recevoir POST sur `/webhook`
  - Notifier le client des mises à jour de tasks

---

## Flow Complet d'une Requête

### Exemple de Requête

**Entrée utilisateur** :
```
Destination: Tokyo
Departure: Paris
Language: French
```

### Diagramme de Séquence Détaillé

```
User       Client     Travel        Weather   Translator   Web Search   Calculator   Math MCP    Gemini
          Demo      Planner                                                           Server      AI
 │          │          │               │            │            │            │          │         │
 │ Input    │          │               │            │            │            │          │         │
 │─────────>│          │               │            │            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │ sendMessage              │            │            │            │          │         │
 │          │ (blocking)               │            │            │            │          │         │
 │          │─────────>│               │            │            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ Parse input   │            │            │            │          │         │
 │          │          │ "Tokyo, Paris,│            │            │            │          │         │
 │          │          │  French"      │            │            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ Initialize    │            │            │            │          │         │
 │          │          │ A2A Clients   │            │            │            │          │         │
 │          │          │ (fromCardUrl) │            │            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ sendMessageStream          │            │            │          │         │
 │          │          │ "best things in Tokyo"     │            │            │          │         │
 │          │          │───────────────────────────>│            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │               │     Brave Search API    │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ "Tokyo has..."│            │            │            │          │         │
 │          │          │<───────────────────────────│            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ sendMessageStream          │            │            │          │         │
 │          │          │ "weather in Tokyo"         │            │            │          │         │
 │          │          │──────────────>│            │            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │               │ OpenWeatherMap API      │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ "22°C partly  │            │            │            │          │         │
 │          │          │  cloudy"      │            │            │            │          │         │
 │          │          │<──────────────│            │            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ sendMessageStream          │            │            │          │         │
 │          │          │ "Calculate budget..."      │            │            │          │         │
 │          │          │───────────────────────────────────────>│            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │               │            │            │  Initialize MCP       │         │
 │          │          │               │            │            │  Client    │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │               │            │            │  Load tools│          │         │
 │          │          │               │            │            │───────────>│          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │               │            │            │  LangChain Agent       │         │
 │          │          │               │            │            │  with Gemini          │         │
 │          │          │               │            │            │────────────────────────────────>│
 │          │          │               │            │            │            │          │         │
 │          │          │               │            │            │  "Use calculate_trip_budget"    │
 │          │          │               │            │            │<────────────────────────────────│
 │          │          │               │            │            │            │          │         │
 │          │          │               │            │            │  call tool │          │         │
 │          │          │               │            │            │  (7,150,25)│          │         │
 │          │          │               │            │            │───────────>│          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │               │            │            │            │ Calculate│         │
 │          │          │               │            │            │            │ 1050+175 │         │
 │          │          │               │            │            │            │ = 1225   │         │
 │          │          │               │            │            │            │          │         │
 │          │          │               │            │            │  "$1225"   │          │         │
 │          │          │               │            │            │<───────────│          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ "$1225"       │            │            │            │          │         │
 │          │          │<───────────────────────────────────────│            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ Generate itinerary with all context    │            │          │         │
 │          │          │ (activities, weather, budget)          │            │          │         │
 │          │          │────────────────────────────────────────────────────────────────────────>│
 │          │          │               │            │            │            │          │         │
 │          │          │ "Itinerary EN"│            │            │            │          │         │
 │          │          │<────────────────────────────────────────────────────────────────────────│
 │          │          │               │            │            │            │          │         │
 │          │          │ sendMessageStream          │            │            │          │         │
 │          │          │ "Translate to French: ..." │            │            │          │         │
 │          │          │────────────────────────────>│            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │               │            │  Gemini AI │            │          │         │
 │          │          │               │            │────────────────────────────────────────────>│
 │          │          │               │            │            │            │          │         │
 │          │          │ "Itinéraire FR"           │            │            │          │         │
 │          │          │<────────────────────────────│            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │          │ Publish final message      │            │            │          │         │
 │          │          │ eventBus.finished()        │            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │          │ Response │               │            │            │            │          │         │
 │          │ (Message)│               │            │            │            │          │         │
 │          │<─────────│               │            │            │            │          │         │
 │          │          │               │            │            │            │          │         │
 │ Display  │          │               │            │            │            │          │         │
 │ Report   │          │               │            │            │            │          │         │
 │<─────────│          │               │            │            │            │          │         │
 │          │          │               │            │            │            │          │         │
```

### Étapes Détaillées

#### 1. Input Utilisateur

```typescript
// Client Demo demande les informations
const destination = "Tokyo";
const departure = "Paris";
const language = "French";

const userInput = `${destination}, ${departure}, ${language}`;
// → "Tokyo, Paris, French"
```

#### 2. Envoi de la Requête A2A

```typescript
// Client Demo envoie au Travel Planner
const response = await travelClient.sendMessage({
  message: {
    messageId: uuidv4(),
    role: "user",
    parts: [{ kind: "text", text: userInput }],
    kind: "message"
  },
  configuration: {
    blocking: true  // Attendre la réponse complète
  }
});
```

#### 3. Travel Planner : Parse l'Entrée

```typescript
// Travel Planner extrait les informations
const { destination, departure, language } = this.parseUserInput(userInput);
// destination = "Tokyo"
// departure = "Paris"
// language = "French"
```

#### 4. Travel Planner : Initialise les Clients A2A

```typescript
// Se connecter à tous les agents
this.webSearchClient = await A2AClient.fromCardUrl(
  "http://localhost:4003/.well-known/agent-card.json"
);
this.weatherClient = await A2AClient.fromCardUrl(
  "http://localhost:4000/.well-known/agent-card.json"
);
this.calculatorClient = await A2AClient.fromCardUrl(
  "http://localhost:4004/.well-known/agent-card.json"
);
this.translatorClient = await A2AClient.fromCardUrl(
  "http://localhost:4001/.well-known/agent-card.json"
);
```

#### 5. Travel Planner : Appelle Web Search Agent

```typescript
const activitiesInfo = await this.callAgent(
  this.webSearchClient,
  "Web Search Agent",
  `best things to do and top attractions in ${destination}`
);

// Web Search Agent interroge Brave Search API
// Retourne : "Tokyo offers incredible attractions including..."
```

#### 6. Travel Planner : Appelle Weather Agent

```typescript
const weatherInfo = await this.callAgent(
  this.weatherClient,
  "Weather Agent",
  `What is the weather in ${destination}?`
);

// Weather Agent interroge OpenWeatherMap API
// Retourne : "Current temperature in Tokyo is 22°C with partly cloudy skies."
```

#### 7. Travel Planner : Appelle Calculator Agent

```typescript
const budgetInfo = await this.callAgent(
  this.calculatorClient,
  "Calculator Agent",
  `Calculate trip budget for 7 nights at $150 per night with $25 meals per day`
);

// Calculator Agent :
// 1. Initialise MCP Client
// 2. Charge tools MCP (add, multiply, calculate_trip_budget)
// 3. LangChain Agent avec Gemini
// 4. Gemini décide d'utiliser "calculate_trip_budget"
// 5. MCP Client appelle Math Server
// 6. Math Server calcule : 1050 + 175 = 1225
// 7. Retourne : "Total trip budget: $1225 (Accommodation: $1050, Meals: $175)"
```

#### 8. Travel Planner : Génère l'Itinéraire

```typescript
const itinerary = await this.generateItinerary(
  departure,
  destination,
  activitiesInfo,
  weatherInfo,
  budgetInfo
);

// Utilise Gemini AI avec prompt :
const prompt = `Create a detailed 1-day travel itinerary from ${departure} to ${destination}.

Context:
- Activities: ${activitiesInfo}
- Weather: ${weatherInfo}
- Budget: ${budgetInfo}

Include morning, afternoon, and evening activities.`;

// Gemini génère un itinéraire en anglais
```

#### 9. Travel Planner : Traduit le Rapport

```typescript
const finalReport = await this.translateReport(itinerary, language);

// Si language !== "English" :
// Appelle Translator Agent
// Translator utilise Gemini pour traduire en français
// Retourne : "Plan de Voyage : Paris à Tokyo\n\nMatin (9h00 - 12h00)..."
```

#### 10. Travel Planner : Publie la Réponse

```typescript
const responseMessage: Message = {
  kind: "message",
  messageId: uuidv4(),
  role: "agent",
  parts: [
    {
      kind: "text",
      text: `Travel Plan: ${departure} to ${destination}\n\n${finalReport}`
    }
  ],
  contextId,
  taskId
};

eventBus.publish(responseMessage);
eventBus.finished();
```

#### 11. Client Demo : Affiche le Résultat

```typescript
if (response.result.kind === "message") {
  const text = response.result.parts
    .filter(p => p.kind === "text")
    .map(p => p.text)
    .join("\n");

  console.log("\n" + "=".repeat(50));
  console.log("TRAVEL REPORT");
  console.log("=".repeat(50));
  console.log(text);
  console.log("=".repeat(50));
}
```

**Résultat affiché** :

```
==================================================
TRAVEL REPORT
==================================================
Plan de Voyage : Paris à Tokyo

Matin (9h00 - 12h00)
- Visite du temple historique Senso-ji
- Exploration des marchés locaux

Après-midi (12h00 - 18h00)
- Déjeuner dans un restaurant local
- Visite de la tour de Tokyo

Soirée (18h00 - 22h00)
- Dîner dans le quartier de Shibuya
- Observation du coucher de soleil depuis Sky Tree

Météo : Température actuelle de 22°C avec des nuages partiels.
Budget : Budget total du voyage $1225 (Hébergement: $1050, Repas: $175)
==================================================
```

---

## Agents en Détail

### 1. Weather Agent

**Fichiers** :
- [src/agents/weather-agent/agent-card.ts](../src/agents/weather-agent/agent-card.ts)
- [src/agents/weather-agent/executor.ts](../src/agents/weather-agent/executor.ts)
- [src/agents/weather-agent/server.ts](../src/agents/weather-agent/server.ts)

**Agent Card** :

```typescript
{
  name: "Weather Agent",
  description: "Weather forecast agent using OpenWeatherMap API",
  skills: [
    {
      name: "get_weather",
      description: "Get weather information for a specific location",
      tags: ["weather", "forecast"],
      examples: [
        "What is the weather in Paris?",
        "Tell me the weather forecast for Tokyo"
      ]
    }
  ],
  url: "http://localhost:4000",
  protocolVersion: "1.0"
}
```

**Logique** :

1. Extraire la ville de la requête (`extractCity()`)
2. Interroger OpenWeatherMap API
3. Formater la réponse : "Current temperature in {city} is {temp}°C with {condition}"
4. Mode mock si pas de clé API

**Variables d'environnement** :

```bash
WEATHER_AGENT_PORT=4000
OPENWEATHER_API_KEY=your_key_here
```

**Commandes** :

```bash
npm run weather          # Production
npm run dev:weather      # Dev mode avec hot reload
```

---

### 2. Translator Agent

**Fichiers** :
- [src/agents/translator-agent/agent-card.ts](../src/agents/translator-agent/agent-card.ts)
- [src/agents/translator-agent/executor.ts](../src/agents/translator-agent/executor.ts)
- [src/agents/translator-agent/server.ts](../src/agents/translator-agent/server.ts)

**Agent Card** :

```typescript
{
  name: "Translator Agent",
  description: "Translation agent using Google Gemini AI",
  skills: [
    {
      name: "translate",
      description: "Translate text to different languages",
      tags: ["translation", "language"],
      examples: [
        "Translate to French: Hello world",
        "Traduire en anglais: Bonjour le monde"
      ]
    }
  ],
  url: "http://localhost:4001",
  protocolVersion: "1.0"
}
```

**Logique** :

1. Parser la requête pour extraire langue cible et texte
   - Format : "Translate to {language}: {text}"
2. Utiliser Gemini AI pour traduire
3. Retourner le texte traduit
4. Mode mock si pas de clé API

**Variables d'environnement** :

```bash
TRANSLATOR_AGENT_PORT=4001
GEMINI_API_KEY=your_key_here
```

**Commandes** :

```bash
npm run translator       # Production
npm run dev:translator   # Dev mode
```

---

### 3. Web Search Agent

**Fichiers** :
- [src/agents/web-search-agent/agent-card.ts](../src/agents/web-search-agent/agent-card.ts)
- [src/agents/web-search-agent/executor.ts](../src/agents/web-search-agent/executor.ts)
- [src/agents/web-search-agent/server.ts](../src/agents/web-search-agent/server.ts)

**Agent Card** :

```typescript
{
  name: "Web Search Agent",
  description: "Web search agent using Brave Search API",
  skills: [
    {
      name: "search",
      description: "Search the web for information",
      tags: ["search", "web", "information"],
      examples: [
        "Search for best attractions in Tokyo",
        "Find information about Paris tourism"
      ]
    }
  ],
  url: "http://localhost:4003",
  protocolVersion: "1.0"
}
```

**Logique** :

1. Extraire la requête de recherche
2. Interroger Brave Search API
3. Extraire les résultats pertinents
4. Formater en liste d'activités/attractions
5. Mode mock si pas de clé API

**Variables d'environnement** :

```bash
WEB_SEARCH_AGENT_PORT=4003
BRAVE_SEARCH_API_KEY=your_key_here  # Optionnel
```

**Commandes** :

```bash
npm run web-search       # Production
npm run dev:web-search   # Dev mode
```

---

### 4. Calculator Agent

**Fichiers** :
- [src/agents/calculator-agent/agent-card.ts](../src/agents/calculator-agent/agent-card.ts)
- [src/agents/calculator-agent/executor.ts](../src/agents/calculator-agent/executor.ts)
- [src/agents/calculator-agent/server.ts](../src/agents/calculator-agent/server.ts)

**Agent Card** :

```typescript
{
  name: "Calculator Agent",
  description: "Mathematical calculator agent powered by LangChain and MCP tools",
  skills: [
    {
      name: "calculate",
      description: "Perform mathematical calculations",
      tags: ["math", "calculator", "budget"],
      examples: [
        "Add 150 and 75",
        "Multiply 7 by 25",
        "Calculate trip budget for 7 nights at $150 per night with $25 meals per day"
      ]
    }
  ],
  url: "http://localhost:4004",
  protocolVersion: "1.0"
}
```

**Logique** :

1. Initialiser MCP Client (première fois)
2. Se connecter au Math Server via stdio
3. Charger les tools MCP (add, multiply, calculate_trip_budget)
4. Créer LangChain Agent (ReAct) avec Gemini
5. Invoquer l'agent avec la requête utilisateur
6. L'agent LangChain :
   - Analyse la requête
   - Décide quel tool utiliser
   - Appelle le tool MCP
   - Formule la réponse
7. Retourner le résultat

**Variables d'environnement** :

```bash
CALCULATOR_AGENT_PORT=4004
GEMINI_API_KEY=your_key_here
```

**Commandes** :

```bash
npm run calculator       # Production
npm run dev:calculator   # Dev mode
```

**Dépendances MCP** :

- Math MCP Server doit être compilé : `npm run build`
- Chemin du serveur : `dist/mcp-servers/math-server.js`

---

### 5. Travel Planner Agent

**Fichiers** :
- [src/agents/travel-planner-agent/agent-card.ts](../src/agents/travel-planner-agent/agent-card.ts)
- [src/agents/travel-planner-agent/executor.ts](../src/agents/travel-planner-agent/executor.ts)
- [src/agents/travel-planner-agent/server.ts](../src/agents/travel-planner-agent/server.ts)
- [src/agents/travel-planner-agent/mock-data.ts](../src/agents/travel-planner-agent/mock-data.ts)

**Agent Card** :

```typescript
{
  name: "Travel Planner Agent",
  description: "Travel planning orchestrator that coordinates multiple agents",
  skills: [
    {
      name: "plan_trip",
      description: "Create comprehensive travel itineraries",
      tags: ["travel", "planning", "orchestration"],
      examples: [
        "Plan a trip to Tokyo",
        "Tokyo, Paris, French"
      ]
    }
  ],
  url: "http://localhost:4002",
  protocolVersion: "1.0"
}
```

**Logique** :

1. **Parse input** : "destination, departure, language"
2. **Initialize A2A clients** : se connecter à tous les agents
3. **Orchestration séquentielle** :
   - Appeler Web Search Agent → activitiesInfo
   - Appeler Weather Agent → weatherInfo
   - Appeler Calculator Agent → budgetInfo
4. **Generate itinerary** : utiliser Gemini avec tout le contexte
5. **Translate report** : appeler Translator si language !== "English"
6. **Publish final message** : un seul message avec rapport complet

**Variables d'environnement** :

```bash
TRAVEL_PLANNER_AGENT_PORT=4002
GEMINI_API_KEY=your_key_here
USE_MOCK_DATA=false  # true pour mode mock
```

**Commandes** :

```bash
npm run travel-planner       # Production
npm run dev:travel-planner   # Dev mode
```

**Mode Mock** :

Fichier `mock-data.ts` contient :
- `getMockWebSearch(destination)` : activités mockées
- `getMockWeather(destination)` : météo mockée
- `getMockCalculation()` : budget mocké
- `getMockItinerary(departure, destination)` : itinéraire mocké
- `getMockTranslation(text, language)` : traduction mockée

---

## Mode Mock vs Live

### Pourquoi le Mode Mock ?

✅ **Tester sans API keys** : développer et tester sans clés API
✅ **Développement rapide** : pas besoin d'attendre les réponses API
✅ **Pas de coûts** : éviter les appels API payants pendant le dev
✅ **Déterministe** : résultats prévisibles pour tests
✅ **Démos** : présenter sans dépendre de connexion internet

### Configuration

Fichier : `.env`

```bash
# Mode Mock activé
USE_MOCK_DATA=true

# Mode Live (avec vraies APIs)
USE_MOCK_DATA=false
```

### Agents Supportant le Mode Mock

| Agent | Mode Mock Support | Fallback |
|-------|-------------------|----------|
| **Travel Planner** | ✅ Oui | Mock toute l'orchestration |
| **Weather** | ✅ Oui | Retourne météo par défaut |
| **Translator** | ✅ Oui | Retourne texte préfixé "[FR]" |
| **Web Search** | ✅ Oui | Activités Tokyo par défaut |
| **Calculator** | ❌ Non | Nécessite vraie clé API Gemini |

### Implémentation Mode Mock

#### Exemple : Weather Agent

```typescript
export class WeatherAgentExecutor implements AgentExecutor {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || "";
    if (!this.apiKey) {
      console.warn("[Weather Agent] No API key, using mock data");
    }
  }

  private async fetchWeather(city: string): Promise<string> {
    // Si pas de clé API, utiliser mock
    if (!this.apiKey) {
      return this.getMockWeather(city);
    }

    try {
      // Appel API réel
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      return `Current temperature in ${city} is ${data.main.temp}°C with ${data.weather[0].description}.`;

    } catch (error: any) {
      // Fallback sur mock en cas d'erreur
      console.error("[Weather Agent] API error, using mock:", error);
      return this.getMockWeather(city);
    }
  }

  private getMockWeather(city: string): string {
    return `Current temperature in ${city} is 22°C with partly cloudy skies. (Mock data)`;
  }
}
```

#### Exemple : Travel Planner (Mock Complet)

```typescript
export class TravelPlannerAgentExecutor implements AgentExecutor {
  private useMock: boolean;

  constructor() {
    this.useMock = process.env.USE_MOCK_DATA === "true";
    console.log(`[Travel Planner] Mode: ${this.useMock ? "MOCK" : "LIVE"}`);
  }

  private async getActivitiesInfo(destination: string): Promise<string> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 2000));  // Simuler latence
      return getMockWebSearch(destination);
    }
    return this.callAgent(this.webSearchClient!, "Web Search Agent", ...);
  }

  private async getWeatherInfo(destination: string): Promise<string> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getMockWeather(destination);
    }
    return this.callAgent(this.weatherClient!, "Weather Agent", ...);
  }

  // Idem pour budgetInfo, itinerary, translation...
}
```

### Fichier mock-data.ts

```typescript
export function getMockWebSearch(destination: string): string {
  return `${destination} offers incredible attractions including the historic Senso-ji Temple,
the iconic Tokyo Tower, and the bustling Shibuya Crossing. Don't miss the traditional markets
and modern shopping districts.`;
}

export function getMockWeather(destination: string): string {
  return `Current temperature in ${destination} is 22°C with partly cloudy skies.
Perfect weather for sightseeing!`;
}

export function getMockCalculation(): string {
  return `Total trip budget: $1225 (Accommodation: $1050, Meals: $175)`;
}

export function getMockItinerary(departure: string, destination: string): string {
  return `## ${departure} to ${destination}: 1-Day Itinerary

Morning (9:00 - 12:00)
- Visit the historic old town
- Explore local markets

Afternoon (12:00 - 18:00)
- Lunch at traditional restaurant
- Visit iconic landmarks

Evening (18:00 - 22:00)
- Dinner in vibrant district
- Sunset observation`;
}

export function getMockTranslation(text: string, language: string): string {
  return `[${language.toUpperCase()}] ${text}`;
}
```

---

## Configuration et Démarrage

### Prérequis

- **Node.js** : v18+ recommandé
- **npm** : v8+
- **TypeScript** : installé globalement ou localement

### Installation

```bash
# Cloner le projet
git clone https://github.com/your-repo/a2a-full-js.git
cd a2a-full-js

# Installer les dépendances
npm install
```

### Configuration des Variables d'Environnement

Fichier : `.env`

```bash
# API Keys (optionnelles pour mode mock)
GEMINI_API_KEY=your_gemini_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
BRAVE_SEARCH_API_KEY=your_brave_search_api_key_here  # Optionnel

# Ports des agents
WEATHER_AGENT_PORT=4000
TRANSLATOR_AGENT_PORT=4001
TRAVEL_PLANNER_AGENT_PORT=4002
WEB_SEARCH_AGENT_PORT=4003
CALCULATOR_AGENT_PORT=4004

# Mode Mock
USE_MOCK_DATA=true  # true = mock, false = vraies APIs
```

### Compilation

```bash
npm run build
```

Cela compile tous les fichiers TypeScript de `src/` vers `dist/`.

### Démarrage des Agents

#### Option 1 : Démarrer Tous les Agents (Dev Mode)

```bash
npm run dev
```

Cela démarre tous les agents en mode développement avec hot reload via `concurrently`.

#### Option 2 : Démarrer les Agents Individuellement

**Mode Production** :

```bash
npm run weather
npm run translator
npm run web-search
npm run calculator
npm run travel-planner
```

**Mode Développement** (avec hot reload) :

```bash
npm run dev:weather
npm run dev:translator
npm run dev:web-search
npm run dev:calculator
npm run dev:travel-planner
```

### Démarrage du Client Demo

**Mode Production** :

```bash
npm run demo
```

**Mode Développement** :

```bash
npm run dev:demo
```

**Interaction** :

```
Connecting to Travel Planner...
Connected successfully

Enter destination city: Tokyo
Enter departure city: Paris
Enter language (English/French): French

Planning trip: Tokyo, Paris, French

Sending request to Travel Planner...

==================================================
TRAVEL REPORT
==================================================
Plan de Voyage : Paris à Tokyo

Matin (9h00 - 12h00)
...
==================================================
```

---

## Logs et Debugging

### Logs Structurés

Tous les agents utilisent un format de log structuré :

```
[Component Name] Message
```

**Exemples** :

```
[Weather Agent] Server listening on port 4000
[Weather Agent] Processing request: What is the weather in Tokyo?
[Weather Agent] City detected: Tokyo
[Weather Agent] Request completed

[Travel Planner] Server listening on port 4002
[Travel Planner] Planning trip: Tokyo, Paris, French
[Travel Planner] Calling Web Search Agent
[Travel Planner] Web Search Agent completed
[Travel Planner] Activities found: Tokyo offers incredible attractions...
[Travel Planner] Trip planning completed
```

### Suivre l'Orchestration

Pour voir tout le flow d'une requête, regarder les logs de **Travel Planner** :

```
[Travel Planner] Planning trip: Tokyo, Paris, French
[Travel Planner] Calling Web Search Agent
[Travel Planner] Web Search Agent completed
[Travel Planner] Activities found: Tokyo offers incredible attractions...
[Travel Planner] Calling Weather Agent
[Travel Planner] Weather Agent completed
[Travel Planner] Weather info: Current temperature in Tokyo is 22°C...
[Travel Planner] Calling Calculator Agent
[Travel Planner] Calculator Agent completed
[Travel Planner] Budget calculated: Total trip budget: $1225
[Travel Planner] Generating itinerary
[Travel Planner] Calling Translator Agent
[Travel Planner] Translator Agent completed
[Travel Planner] Translation completed: French
[Travel Planner] Trip planning completed
```

### Logs MCP (Calculator Agent)

```
[Calculator Agent] Model initialized
[Calculator Agent] Processing: Calculate trip budget for 7 nights at $150 per night with $25 meals per day
[Calculator Agent] Initializing MCP client
[Calculator Agent] Connected to MCP server
[Calculator Agent] Loaded 3 MCP tools: add, multiply, calculate_trip_budget
[Calculator Agent] LangChain agent initialized
[Calculator Agent] Invoking LangChain agent
[Math Server] Calling tool: calculate_trip_budget with args: { nights: 7, pricePerNight: 150, mealsPerDay: 25 }
[Math Server] calculate_trip_budget = $1225
[Calculator Agent] Agent completed: The total trip budget is $1225...
[Calculator Agent] Request completed
```

### Debugging Tips

#### 1. Vérifier que Tous les Agents Sont Démarrés

```bash
# Vérifier les processus Node.js
ps aux | grep node

# Ou tester les Agent Cards
curl http://localhost:4000/.well-known/agent-card.json  # Weather
curl http://localhost:4001/.well-known/agent-card.json  # Translator
curl http://localhost:4002/.well-known/agent-card.json  # Travel Planner
curl http://localhost:4003/.well-known/agent-card.json  # Web Search
curl http://localhost:4004/.well-known/agent-card.json  # Calculator
```

#### 2. Tester un Agent Isolément

Utiliser `curl` ou un client HTTP :

```bash
curl -X POST http://localhost:4000/sendMessage \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "messageId": "test-123",
      "role": "user",
      "parts": [{"kind": "text", "text": "What is the weather in Tokyo?"}],
      "kind": "message"
    },
    "configuration": {
      "blocking": true
    }
  }'
```

#### 3. Mode Mock pour Isoler les Problèmes

Si un agent échoue, activer le mode mock pour isoler :

```bash
USE_MOCK_DATA=true npm run dev:travel-planner
```

#### 4. Vérifier les Clés API

```bash
# Dans .env
echo $GEMINI_API_KEY
echo $OPENWEATHER_API_KEY
echo $BRAVE_SEARCH_API_KEY
```

Si les clés ne sont pas définies, les agents utiliseront le mode mock automatiquement (sauf Calculator qui nécessite Gemini).

---

## Extension du Projet

### Ajouter un Nouvel Agent A2A

#### Exemple : Flight Agent

**1. Créer la structure** :

```bash
mkdir -p src/agents/flight-agent
touch src/agents/flight-agent/agent-card.ts
touch src/agents/flight-agent/executor.ts
touch src/agents/flight-agent/server.ts
```

**2. Implémenter l'Agent Card** :

```typescript
// src/agents/flight-agent/agent-card.ts
import type { AgentCard } from "@a2a-js/sdk";

export const flightAgentCard: AgentCard = {
  name: "Flight Agent",
  description: "Flight search agent for finding flight options",
  skills: [
    {
      name: "search_flights",
      description: "Search for flights between two cities",
      tags: ["flights", "travel", "booking"],
      examples: [
        "Find flights from Paris to Tokyo",
        "Search flights departing from London to New York"
      ]
    }
  ],
  url: `http://localhost:${process.env.FLIGHT_AGENT_PORT || 4005}`,
  protocolVersion: "1.0"
};
```

**3. Implémenter l'Executor** :

```typescript
// src/agents/flight-agent/executor.ts
import { v4 as uuidv4 } from "uuid";
import type {
  AgentExecutor,
  RequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import type { Message } from "@a2a-js/sdk";

export class FlightAgentExecutor implements AgentExecutor {
  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    const taskId = requestContext.task?.id || uuidv4();
    const contextId = requestContext.userMessage.contextId || uuidv4();

    try {
      const userText = requestContext.userMessage.parts
        .find(p => p.kind === "text")?.text || "";

      console.log(`[Flight Agent] Processing: ${userText}`);

      // Extraire origine et destination
      const { origin, destination } = this.parseFlightQuery(userText);

      // Rechercher des vols (API ou mock)
      const flights = await this.searchFlights(origin, destination);

      // Publier la réponse
      eventBus.publish({
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{ kind: "text", text: flights }],
        contextId,
        taskId
      });
      eventBus.finished();

      console.log("[Flight Agent] Request completed");

    } catch (error: any) {
      console.error("[Flight Agent] Error:", error);
      eventBus.publish({
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{ kind: "text", text: `Error: ${error.message}` }],
        contextId,
        taskId
      });
      eventBus.finished();
    }
  }

  private parseFlightQuery(text: string): { origin: string; destination: string } {
    // Logique d'extraction
    const match = text.match(/from\s+(\w+)\s+to\s+(\w+)/i);
    return {
      origin: match ? match[1] : "Paris",
      destination: match ? match[2] : "Tokyo"
    };
  }

  private async searchFlights(origin: string, destination: string): Promise<string> {
    // Appeler une API de vols ou retourner mock
    return `Found 3 flights from ${origin} to ${destination}: Flight AF123 at 9:00 AM, Flight BA456 at 2:00 PM, Flight LH789 at 6:00 PM`;
  }

  async cancelTask(): Promise<void> {
    console.log("[Flight Agent] Task cancelled");
  }
}
```

**4. Créer le Serveur** :

```typescript
// src/agents/flight-agent/server.ts
import "dotenv/config";
import { A2AExpressApp } from "@a2a-js/sdk/server";
import { flightAgentCard } from "./agent-card.js";
import { FlightAgentExecutor } from "./executor.js";

const PORT = process.env.FLIGHT_AGENT_PORT || 4005;
const flightExecutor = new FlightAgentExecutor();

const a2aApp = new A2AExpressApp({
  defaultExecutor: flightExecutor,
  agentCard: flightAgentCard
});

const app = a2aApp.getApp();

app.listen(PORT, () => {
  console.log(`[Flight Agent] Server listening on port ${PORT}`);
});
```

**5. Ajouter les Scripts npm** :

```json
// package.json
{
  "scripts": {
    "flight": "node dist/agents/flight-agent/server.js",
    "dev:flight": "tsx watch src/agents/flight-agent/server.ts"
  }
}
```

**6. Intégrer dans Travel Planner** :

```typescript
// src/agents/travel-planner-agent/executor.ts

// Ajouter propriété
private flightClient: A2AClient | null = null;

// Dans initializeA2AClients()
const FLIGHT_URL = `http://localhost:${process.env.FLIGHT_AGENT_PORT || 4005}`;
this.flightClient = await A2AClient.fromCardUrl(
  `${FLIGHT_URL}/.well-known/agent-card.json`
);

// Dans execute()
const flightInfo = await this.callAgent(
  this.flightClient!,
  "Flight Agent",
  `Find flights from ${departure} to ${destination}`
);

// Utiliser flightInfo dans generateItinerary()
```

### Ajouter un Tool MCP

#### Exemple : Tool "substract"

**1. Ouvrir Math Server** :

```typescript
// src/mcp-servers/math-server.ts

// Dans ListToolsRequestSchema handler, ajouter :
{
  name: "subtract",
  description: "Subtract second number from first number",
  inputSchema: {
    type: "object",
    properties: {
      a: { type: "number", description: "Number to subtract from" },
      b: { type: "number", description: "Number to subtract" }
    },
    required: ["a", "b"]
  }
}

// Dans CallToolRequestSchema handler, ajouter :
if (name === "subtract") {
  const { a, b } = args as { a: number; b: number };
  const result = a - b;
  console.log(`[Math Server] subtract(${a}, ${b}) = ${result}`);
  return {
    content: [
      { type: "text", text: `The difference of ${a} and ${b} is ${result}` }
    ]
  };
}
```

**2. Recompiler** :

```bash
npm run build
```

**3. Tester** :

Le Calculator Agent chargera automatiquement le nouveau tool `subtract` au prochain redémarrage.

```bash
npm run calculator

# Dans le client :
# "What is 100 minus 25?"
# → Calculator utilisera le tool subtract(100, 25)
# → Résultat : "The difference of 100 and 25 is 75"
```

---

## Troubleshooting

### Problème 1 : Port Déjà Utilisé

**Erreur** :

```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution** :

```bash
# Trouver le processus utilisant le port
lsof -i :4000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
WEATHER_AGENT_PORT=4010
```

### Problème 2 : Agent Card Non Accessible

**Erreur** :

```
[Travel Planner] Failed to connect: Request failed with status code 404
```

**Solution** :

1. Vérifier que l'agent est démarré :

```bash
curl http://localhost:4000/.well-known/agent-card.json
```

2. Vérifier l'URL dans le code :

```typescript
const WEATHER_URL = `http://localhost:${process.env.WEATHER_AGENT_PORT || 4000}`;
```

3. Vérifier les variables d'environnement :

```bash
echo $WEATHER_AGENT_PORT
```

### Problème 3 : MCP Server Ne Démarre Pas

**Erreur** :

```
[Calculator Agent] Failed to initialize MCP: spawn node ENOENT
```

**Solution** :

1. Vérifier que le serveur est compilé :

```bash
ls dist/mcp-servers/math-server.js
```

2. Recompiler si nécessaire :

```bash
npm run build
```

3. Vérifier le chemin dans connectStdio :

```typescript
await mcpClient.connectStdio({
  command: "node",
  args: ["dist/mcp-servers/math-server.js"]  // Correct
});
```

### Problème 4 : Clé API Invalide

**Erreur** :

```
[Weather Agent] API error: 401 Unauthorized
```

**Solution** :

1. Vérifier que la clé est dans `.env` :

```bash
cat .env | grep OPENWEATHER_API_KEY
```

2. Recharger les variables d'environnement :

```bash
source .env
```

3. Redémarrer l'agent :

```bash
npm run weather
```

4. Ou activer le mode mock :

```bash
USE_MOCK_DATA=true npm run weather
```

### Problème 5 : Streaming Se Ferme Prématurément

**Problème** : le client ne reçoit que quelques événements puis le stream se ferme.

**Solution** : utiliser le mode **blocking** au lieu du streaming côté client.

```typescript
// ✅ Bon : mode blocking
const response = await travelClient.sendMessage({
  message: userMessage,
  configuration: { blocking: true }
});

// ❌ Éviter : streaming avec long délai entre événements
const stream = travelClient.sendMessageStream(params);
for await (const event of stream) {
  // Peut se fermer si délai > timeout
}
```

---

## Résumé Final

### Ce Que Vous Avez Appris

#### 1. Protocole A2A

- ✅ Communication agent-à-agent standardisée
- ✅ Agent Card : métadonnées et découverte
- ✅ Messages : structure, rôles, parts
- ✅ Tasks : gestion asynchrone
- ✅ Webhooks : notifications push
- ✅ Streaming SSE : événements progressifs

#### 2. SDK JavaScript A2A

- ✅ Côté serveur : A2AExpressApp, AgentExecutor, ExecutionEventBus
- ✅ Côté client : A2AClient, sendMessage(), sendMessageStream()
- ✅ Pattern 3 fichiers : agent-card, executor, server
- ✅ Event publishing : publish(), finished()

#### 3. Protocole MCP

- ✅ Connexion LLM ↔ outils
- ✅ Tools : fonctions appelables par le LLM
- ✅ Transports : stdio, SSE, HTTP
- ✅ Différence A2A vs MCP

#### 4. Intégration MCP + A2A

- ✅ Créer serveur MCP (Math Server)
- ✅ Intégrer MCP dans agent A2A (Calculator)
- ✅ LangChain + Gemini + MCP Tools
- ✅ Architecture hybride

#### 5. Projet Complet

- ✅ 5 agents A2A coordonnés
- ✅ Orchestration multi-agents (Travel Planner)
- ✅ Mode mock pour développement
- ✅ Logs structurés pour debugging
- ✅ Extensions possibles

### Architecture Finale

```
┌──────────────────────────────────────────────────────────────────┐
│                    TRAVEL PLANNER SYSTEM                         │
│                                                                  │
│  Protocole A2A : Orchestration agent-à-agent                    │
│  Protocole MCP : Capacités LLM étendues                         │
│  SDK JS A2A : Implémentation agents                             │
│  LangChain : Intégration LLM + MCP                              │
│                                                                  │
│  5 Agents : Weather, Translator, Web Search, Calculator,        │
│             Travel Planner                                       │
│  1 MCP Server : Math (add, multiply, calculate_trip_budget)    │
│  1 Client : CLI interactif                                      │
│                                                                  │
│  Mode Mock : Développement sans API keys                        │
│  Mode Live : Production avec vraies APIs                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Compétences Acquises

Après avoir lu cette documentation, vous pouvez :

✅ **Expliquer** le protocole A2A et ses avantages
✅ **Créer** un agent A2A de A à Z
✅ **Orchestrer** plusieurs agents pour une tâche complexe
✅ **Comprendre** MCP et ses cas d'usage
✅ **Créer** un serveur MCP personnalisé
✅ **Intégrer** MCP dans un agent A2A avec LangChain
✅ **Configurer** et démarrer un système multi-agent
✅ **Débugger** et étendre le projet
✅ **Présenter** le projet à un manager ou une équipe

### Prochaines Étapes

1. **Pratiquer** : modifier le projet, ajouter des agents, créer des tools MCP
2. **Expérimenter** : tester différentes architectures, combiner d'autres LLMs
3. **Déployer** : mettre en production sur un serveur, utiliser Docker
4. **Étendre** : ajouter authentification, base de données, monitoring
5. **Partager** : présenter à votre équipe, contribuer à des projets open source

---

**Félicitations !** Vous maîtrisez maintenant l'architecture multi-agent A2A + MCP. 🎉
