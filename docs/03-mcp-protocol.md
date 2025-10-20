# 03 - Le Protocole MCP (Model Context Protocol)

## Table des Matières

1. [Introduction](#introduction)
2. [Qu'est-ce que MCP ?](#quest-ce-que-mcp)
3. [MCP vs A2A : Différences Clés](#mcp-vs-a2a--différences-clés)
4. [Composants MCP](#composants-mcp)
   - [Serveurs MCP](#serveurs-mcp)
   - [Clients MCP](#clients-mcp)
   - [Tools](#tools)
   - [Resources](#resources)
   - [Prompts](#prompts)
5. [Transports MCP](#transports-mcp)
6. [Flow MCP Complet](#flow-mcp-complet)
7. [Cas d'Usage](#cas-dusage)
8. [Résumé](#résumé)

---

## Introduction

Le **MCP (Model Context Protocol)** est un protocole permettant de connecter des **modèles de langage (LLMs)** à des **outils et sources de données externes**.

### Problème Résolu par MCP

Les LLMs (comme GPT, Claude, Gemini) sont puissants mais limités :

❌ **Sans MCP** :
- Pas d'accès aux données en temps réel
- Pas de capacité de calcul précis
- Pas d'interaction avec des systèmes externes
- Hallucinations sur des informations spécifiques

✅ **Avec MCP** :
- Le LLM peut appeler des fonctions (tools)
- Accès à des bases de données
- Exécution de calculs complexes
- Interaction avec des APIs externes
- Informations à jour et vérifiables

### Exemple Concret

**Requête utilisateur** : "Calculate the budget for a 7-night trip at $150 per night with $25 meals per day"

**Sans MCP** :
```
LLM : "Le budget total serait d'environ 1200-1300 dollars"
→ Approximation, peut être incorrect
```

**Avec MCP** :
```
LLM → Identifie qu'il a besoin du tool "calculate_trip_budget"
LLM → Appelle calculate_trip_budget(nights=7, pricePerNight=150, mealsPerDay=25)
MCP Server → Exécute le calcul : (7 × 150) + (7 × 25) = 1225
MCP Server → Retourne 1225
LLM → "Le budget total est exactement $1225"
→ Résultat précis et vérifiable
```

---

## Qu'est-ce que MCP ?

### Définition

**MCP (Model Context Protocol)** est un protocole standardisé permettant aux LLMs d'interagir avec des ressources externes via des serveurs spécialisés.

### Architecture de Base

```
┌──────────────┐           ┌──────────────┐           ┌──────────────┐
│              │           │              │           │              │
│     LLM      │ ◄───────► │  MCP Client  │ ◄───────► │  MCP Server  │
│   (Gemini,   │           │  (Adapter)   │           │   (Tools)    │
│   Claude)    │           │              │           │              │
└──────────────┘           └──────────────┘           └──────────────┘
     │                            │                          │
     │                            │                          │
     └─────── Raisonne ───────────┼────── Communique ───────┼──── Exécute
             (quel tool?)         │     (appel tool)        │    (fonction)
                                  │                          │
                                  └──────── Retour ──────────┘
```

### Composants Principaux

1. **LLM** : le modèle de langage qui raisonne et décide
2. **MCP Client** : connecte le LLM au serveur MCP
3. **MCP Server** : expose des tools, resources, et prompts
4. **Transport** : protocole de communication (stdio, SSE, HTTP)

---

## MCP vs A2A : Différences Clés

### Vue d'Ensemble

| Aspect | A2A | MCP |
|--------|-----|-----|
| **Communication** | Agent ↔ Agent | LLM ↔ Outils |
| **Niveau** | Orchestration horizontale | Augmentation verticale |
| **Autonomie** | Agents autonomes | Tools passifs |
| **Cas d'usage** | Collaboration multi-agents | Capacités LLM étendues |
| **Exemple** | Travel Planner → Weather Agent | Calculator Agent → Math Tools |

### Architecture Comparée

#### A2A : Communication Agent-à-Agent

```
┌──────────────────┐
│ Travel Planner   │  ← Agent autonome (orchestrateur)
│  (Agent A2A)     │
└─────────┬────────┘
          │
          ├───────────> ┌──────────────────┐
          │             │  Weather Agent   │  ← Agent autonome
          │             └──────────────────┘
          │
          ├───────────> ┌──────────────────┐
          │             │  Translator      │  ← Agent autonome
          │             └──────────────────┘
          │
          └───────────> ┌──────────────────┐
                        │  Calculator      │  ← Agent autonome
                        └──────────────────┘

→ Communication horizontale entre pairs autonomes
```

#### MCP : LLM ↔ Outils

```
┌──────────────────┐
│  Calculator      │  ← Agent A2A
│  (utilise LLM)   │
└─────────┬────────┘
          │
          ├───────────> ┌──────────────────┐
          │             │   LangChain      │
          │             │   (Agent)        │
          │             └─────────┬────────┘
          │                       │
          │                       │ Utilise tools via MCP
          │                       │
          │                       ▼
          │             ┌──────────────────┐
          └───────────> │  Math MCP Server │
                        │  - add()         │  ← Tools passifs
                        │  - multiply()    │
                        │  - budget()      │
                        └──────────────────┘

→ Augmentation verticale : LLM + outils spécialisés
```

### Quand Utiliser Quoi ?

#### Utiliser A2A quand :

✅ Vous avez **plusieurs agents spécialisés** qui doivent collaborer
✅ Chaque agent a sa **propre logique métier** complexe
✅ Les agents sont **autonomes** et peuvent être utilisés indépendamment
✅ Besoin d'**orchestration** de workflows multi-étapes

**Exemple** : Travel Planner qui coordonne Weather, Translator, Web Search

#### Utiliser MCP quand :

✅ Vous voulez donner des **capacités supplémentaires** à un LLM
✅ Les opérations sont des **fonctions simples** (calculs, accès données)
✅ Besoin de **précision** (calculs exacts, données structurées)
✅ Le LLM doit **choisir dynamiquement** quel outil utiliser

**Exemple** : Calculator Agent qui a besoin d'effectuer des calculs mathématiques précis

#### Combiner A2A + MCP :

🎯 **Architecture hybride** (notre projet) :

```
Client A2A
    │
    └──> Travel Planner (Agent A2A)
              │
              ├──> Weather Agent (A2A)
              ├──> Translator Agent (A2A)
              ├──> Web Search Agent (A2A)
              └──> Calculator Agent (A2A)
                        │
                        └──> LLM + MCP Tools
                                  │
                                  └──> Math Server (MCP)
```

**Avantages** :
- A2A pour l'orchestration globale
- MCP pour les capacités spécialisées
- Modularité maximale

---

## Composants MCP

### Serveurs MCP

Un **serveur MCP** expose des capacités (tools, resources, prompts) que les LLMs peuvent utiliser.

#### Caractéristiques

- Expose des **tools** (fonctions appelables)
- Expose des **resources** (données contextuelles)
- Expose des **prompts** (templates pré-configurés)
- Communique via un **transport** (stdio, SSE, HTTP)
- Peut être en local ou distant

#### Exemple : Math Server

Fichier : `src/mcp-servers/math-server.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Créer le serveur MCP
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

// Définir les tools disponibles
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
        description: "Calculate total trip budget",
        inputSchema: {
          type: "object",
          properties: {
            nights: { type: "number", description: "Number of nights" },
            pricePerNight: { type: "number", description: "Price per night" },
            mealsPerDay: { type: "number", description: "Meals cost per day" },
          },
          required: ["nights", "pricePerNight", "mealsPerDay"],
        },
      },
    ],
  };
});

// Gérer les appels de tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "add") {
    const result = args.a + args.b;
    return {
      content: [{ type: "text", text: `Result: ${result}` }],
    };
  }

  if (name === "multiply") {
    const result = args.a * args.b;
    return {
      content: [{ type: "text", text: `Result: ${result}` }],
    };
  }

  if (name === "calculate_trip_budget") {
    const accommodation = args.nights * args.pricePerNight;
    const meals = args.nights * args.mealsPerDay;
    const total = accommodation + meals;

    return {
      content: [
        {
          type: "text",
          text: `Total trip budget: $${total} (Accommodation: $${accommodation}, Meals: $${meals})`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Démarrer le serveur avec transport stdio
const transport = new StdioServerTransport();
await server.connect(transport);
```

#### Structure d'un Tool

```typescript
interface Tool {
  name: string              // Nom unique du tool
  description: string       // Description pour le LLM
  inputSchema: JSONSchema   // Schéma des paramètres (JSON Schema)
}
```

**Exemple** :

```typescript
{
  name: "calculate_trip_budget",
  description: "Calculate total budget for a trip including accommodation and meals",
  inputSchema: {
    type: "object",
    properties: {
      nights: {
        type: "number",
        description: "Number of nights staying"
      },
      pricePerNight: {
        type: "number",
        description: "Price per night for accommodation"
      },
      mealsPerDay: {
        type: "number",
        description: "Daily cost for meals"
      }
    },
    required: ["nights", "pricePerNight", "mealsPerDay"]
  }
}
```

---

### Clients MCP

Un **client MCP** connecte un LLM à un ou plusieurs serveurs MCP.

#### Responsabilités

1. Se connecter aux serveurs MCP
2. Récupérer la liste des tools disponibles
3. Fournir les tools au LLM
4. Router les appels du LLM vers les bons serveurs
5. Retourner les résultats au LLM

#### Exemple avec LangChain

Fichier : `src/agents/calculator-agent/executor.ts`

```typescript
import { MCPClient } from "@langchain/mcp";
import { loadMCPTools } from "@langchain/mcp";

// Créer le client MCP
const mcpClient = new MCPClient({
  name: "math-client",
  version: "1.0.0",
});

// Se connecter au serveur via stdio
await mcpClient.connectStdio({
  command: "node",
  args: ["dist/mcp-servers/math-server.js"],
});

// Charger les tools depuis le serveur
const tools = await loadMCPTools({
  client: mcpClient,
});

console.log(`Loaded ${tools.length} MCP tools`);
// → Loaded 3 MCP tools (add, multiply, calculate_trip_budget)
```

---

### Tools

Les **tools** sont des fonctions que le LLM peut appeler.

#### Caractéristiques d'un Good Tool

✅ **Nom descriptif** : `calculate_trip_budget` plutôt que `calc`
✅ **Description claire** : expliquer ce que fait le tool et quand l'utiliser
✅ **Schéma complet** : tous les paramètres avec types et descriptions
✅ **Résultat structuré** : format cohérent et parseable
✅ **Gestion d'erreurs** : messages d'erreur clairs

#### Exemple : Tool `add`

```typescript
{
  name: "add",
  description: "Add two numbers together and return the sum",
  inputSchema: {
    type: "object",
    properties: {
      a: {
        type: "number",
        description: "The first number to add"
      },
      b: {
        type: "number",
        description: "The second number to add"
      }
    },
    required: ["a", "b"]
  }
}
```

**Handler** :

```typescript
if (name === "add") {
  const { a, b } = args;

  // Validation
  if (typeof a !== "number" || typeof b !== "number") {
    throw new Error("Both a and b must be numbers");
  }

  const result = a + b;

  return {
    content: [
      { type: "text", text: `The sum of ${a} and ${b} is ${result}` }
    ]
  };
}
```

#### Flow d'Utilisation d'un Tool

```
1. LLM reçoit : "Calculate 150 times 7"
2. LLM analyse : besoin du tool "multiply"
3. LLM génère appel : multiply(a=150, b=7)
4. MCP Client route l'appel au serveur
5. MCP Server exécute : 150 * 7 = 1050
6. MCP Server retourne : "Result: 1050"
7. MCP Client transmet au LLM
8. LLM formule réponse : "150 multiplied by 7 equals 1050"
```

---

### Resources

Les **resources** sont des sources de données que le LLM peut consulter.

#### Exemples de Resources

- 📄 Documents texte
- 📊 Bases de données
- 🌐 APIs externes
- 📁 Systèmes de fichiers
- 💾 Caches de données

#### Structure d'une Resource

```typescript
interface Resource {
  uri: string              // URI unique de la resource
  name: string             // Nom humain
  description?: string     // Description
  mimeType?: string        // Type MIME (text/plain, application/json)
}
```

#### Exemple (non utilisé dans notre projet)

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "file:///data/weather-history.json",
        name: "Weather History",
        description: "Historical weather data for major cities",
        mimeType: "application/json"
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "file:///data/weather-history.json") {
    const data = await fs.readFile("data/weather-history.json", "utf-8");
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: data
        }
      ]
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});
```

**Note** : notre projet utilise uniquement des **tools**, pas de resources.

---

### Prompts

Les **prompts** sont des templates de prompts pré-configurés.

#### Utilité

- Standardiser des requêtes courantes
- Guider l'utilisateur
- Fournir des exemples
- Configurer le comportement du LLM

#### Exemple (non utilisé dans notre projet)

```typescript
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "calculate-budget",
        description: "Calculate travel budget with accommodation and meals",
        arguments: [
          {
            name: "nights",
            description: "Number of nights",
            required: true
          },
          {
            name: "pricePerNight",
            description: "Accommodation price per night",
            required: true
          }
        ]
      }
    ]
  };
});
```

**Note** : notre projet n'utilise pas de prompts MCP (les agents A2A gèrent déjà les prompts).

---

## Transports MCP

Les **transports** définissent comment le client et le serveur communiquent.

### Types de Transports

| Transport | Description | Cas d'Usage |
|-----------|-------------|-------------|
| **stdio** | Standard Input/Output | Processus local, simple |
| **SSE** | Server-Sent Events | Serveur distant, streaming |
| **HTTP** | HTTP classique | APIs distantes, RESTful |

### 1. Transport stdio (utilisé dans notre projet)

Le serveur MCP s'exécute comme un **processus enfant** et communique via stdin/stdout.

#### Avantages

✅ Très simple
✅ Pas de configuration réseau
✅ Sécurisé (local uniquement)
✅ Faible latence

#### Inconvénients

❌ Serveur doit être en local
❌ Un processus par connexion
❌ Pas de partage entre clients

#### Exemple : Math Server avec stdio

**Serveur** : `src/mcp-servers/math-server.ts`

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Client** : `src/agents/calculator-agent/executor.ts`

```typescript
await mcpClient.connectStdio({
  command: "node",                            // Commande pour lancer le processus
  args: ["dist/mcp-servers/math-server.js"], // Arguments
});
```

**Flow** :

```
Calculator Agent
      │
      │ fork()
      ▼
┌─────────────────┐
│  node process   │
│  math-server.js │
└─────────────────┘
      │
      │ stdin/stdout
      ▼
  Communication
```

### 2. Transport SSE

Le serveur expose une route SSE, le client se connecte via HTTP.

#### Exemple (non utilisé)

**Serveur** :

```typescript
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const transport = new SSEServerTransport("/mcp/sse", res);
await server.connect(transport);
```

**Client** :

```typescript
await mcpClient.connectSSE("http://localhost:3000/mcp/sse");
```

### 3. Transport HTTP

Communication via requêtes HTTP POST classiques.

#### Exemple (non utilisé)

**Serveur** :

```typescript
app.post("/mcp", async (req, res) => {
  const result = await server.handleRequest(req.body);
  res.json(result);
});
```

**Client** :

```typescript
await mcpClient.connectHTTP("http://localhost:3000/mcp");
```

---

## Flow MCP Complet

### Diagramme de Séquence

```
User                Calculator Agent       LangChain Agent        MCP Client        Math MCP Server
 │                         │                      │                     │                   │
 │  "Calculate budget"     │                      │                     │                   │
 │ ───────────────────────>│                      │                     │                   │
 │                         │                      │                     │                   │
 │                         │  invoke(prompt)      │                     │                   │
 │                         │ ──────────────────> │                     │                   │
 │                         │                      │                     │                   │
 │                         │                      │  LLM décide :       │                   │
 │                         │                      │  "Besoin de         │                   │
 │                         │                      │   calculate_trip_   │                   │
 │                         │                      │   budget tool"      │                   │
 │                         │                      │                     │                   │
 │                         │                      │  call tool          │                   │
 │                         │                      │ ─────────────────> │                   │
 │                         │                      │                     │                   │
 │                         │                      │                     │  CallTool RPC     │
 │                         │                      │                     │ ───────────────> │
 │                         │                      │                     │                   │
 │                         │                      │                     │   Exécute calcul  │
 │                         │                      │                     │   (7*150)+(7*25)  │
 │                         │                      │                     │                   │
 │                         │                      │                     │  Result: 1225     │
 │                         │                      │                     │ <─────────────── │
 │                         │                      │                     │                   │
 │                         │                      │  tool result        │                   │
 │                         │                      │ <───────────────── │                   │
 │                         │                      │                     │                   │
 │                         │                      │  LLM formule :      │                   │
 │                         │                      │  "Total: $1225"     │                   │
 │                         │                      │                     │                   │
 │                         │  response            │                     │                   │
 │                         │ <────────────────── │                     │                   │
 │                         │                      │                     │                   │
 │  "Total: $1225"         │                      │                     │                   │
 │ <───────────────────────│                      │                     │                   │
 │                         │                      │                     │                   │
```

### Étapes Détaillées

1. **Utilisateur** envoie "Calculate trip budget for 7 nights at $150 per night with $25 meals per day"

2. **Calculator Agent** reçoit la requête via A2A

3. **Calculator Agent** initialise le LangChain Agent avec les MCP tools

4. **LangChain Agent** analyse la requête avec le LLM (Gemini)

5. **LLM** décide : "Je dois utiliser le tool `calculate_trip_budget`"

6. **LangChain Agent** appelle le MCP Client avec :
   ```json
   {
     "tool": "calculate_trip_budget",
     "arguments": {
       "nights": 7,
       "pricePerNight": 150,
       "mealsPerDay": 25
     }
   }
   ```

7. **MCP Client** envoie l'appel au Math Server via stdio

8. **Math Server** exécute le calcul :
   - Accommodation : 7 × 150 = 1050
   - Meals : 7 × 25 = 175
   - Total : 1050 + 175 = 1225

9. **Math Server** retourne :
   ```json
   {
     "content": [
       {
         "type": "text",
         "text": "Total trip budget: $1225 (Accommodation: $1050, Meals: $175)"
       }
     ]
   }
   ```

10. **MCP Client** transmet le résultat au LangChain Agent

11. **LLM** formule la réponse finale : "The total trip budget is $1225..."

12. **Calculator Agent** publie la réponse via A2A EventBus

13. **Utilisateur** reçoit : "Total trip budget: $1225"

---

## Cas d'Usage

### Cas d'Usage 1 : Calculs Précis

**Problème** : LLM n'est pas fiable pour les calculs

**Solution MCP** : tool `calculate_trip_budget`

```
User : "Budget for 7 nights at $150/night + $25/day meals"
LLM → Tool : calculate_trip_budget(7, 150, 25)
Tool → LLM : $1225
LLM → User : "The total is $1225"
```

### Cas d'Usage 2 : Accès Base de Données

**Problème** : LLM ne connaît pas les données internes

**Solution MCP** : tool `query_database`

```
User : "How many users signed up last month?"
LLM → Tool : query_database("SELECT COUNT(*) FROM users WHERE signup_date >= '2025-09-01'")
Tool → LLM : 1523
LLM → User : "1,523 users signed up last month"
```

### Cas d'Usage 3 : Manipulation de Fichiers

**Problème** : LLM ne peut pas lire/écrire des fichiers

**Solution MCP** : tools `read_file`, `write_file`

```
User : "Read config.json and update the timeout to 30"
LLM → Tool : read_file("config.json")
Tool → LLM : { "timeout": 10, ... }
LLM : (modifie en mémoire)
LLM → Tool : write_file("config.json", { "timeout": 30, ... })
Tool → LLM : Success
LLM → User : "Timeout updated to 30 seconds"
```

### Cas d'Usage 4 : API Externes

**Problème** : LLM n'a pas accès à Internet en temps réel

**Solution MCP** : tool `fetch_api`

```
User : "What's the current Bitcoin price?"
LLM → Tool : fetch_api("https://api.coinbase.com/v2/prices/BTC-USD/spot")
Tool → LLM : { "amount": "63421.50", "currency": "USD" }
LLM → User : "The current Bitcoin price is $63,421.50"
```

---

## Résumé

### Points Clés

1. **MCP** = protocole pour connecter LLMs aux outils
2. **Différence A2A/MCP** : A2A = agent↔agent, MCP = LLM↔tools
3. **Architecture MCP** : LLM ↔ Client ↔ Server ↔ Tools
4. **Tools** : fonctions que le LLM peut appeler
5. **Transports** : stdio (local), SSE (distant streaming), HTTP (distant classique)
6. **Use case** : calculs précis, accès données, APIs externes

### Pourquoi MCP dans notre Projet ?

Le **Calculator Agent** a besoin de :

✅ **Calculs précis** : le LLM seul peut faire des erreurs
✅ **Flexibilité** : le LLM choisit le bon tool selon la requête
✅ **Extensibilité** : facile d'ajouter de nouveaux tools mathématiques
✅ **Séparation des responsabilités** : logique calcul isolée dans le MCP server

### Architecture Hybride A2A + MCP

```
┌─────────────────────────────────────────────┐
│          A2A Orchestration Layer            │
│                                             │
│  Travel Planner → Weather                   │
│                → Translator                 │
│                → Web Search                 │
│                → Calculator ─┐              │
│                              │              │
└──────────────────────────────┼──────────────┘
                               │
                   ┌───────────▼────────────┐
                   │   MCP Capability Layer │
                   │                        │
                   │  LLM + Math Tools      │
                   │  (add, multiply, etc)  │
                   └────────────────────────┘
```

**Avantages** :

- **A2A** pour orchestrer des agents autonomes
- **MCP** pour donner des capacités précises au LLM
- **Modularité** : chaque composant a sa responsabilité
- **Extensibilité** : ajouter des agents A2A ou des tools MCP indépendamment

### Prochaines Étapes

Maintenant que vous comprenez MCP, passez au fichier suivant pour voir **comment créer un serveur MCP** et **l'intégrer dans un agent A2A** :

---

**Fichier suivant** : [04 - MCP + A2A : Création et Intégration](./04-mcp-integration.md)
