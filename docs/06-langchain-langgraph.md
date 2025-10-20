# 06 - LangChain et LangGraph

## Table des Matières

1. [Introduction](#introduction)
2. [Qu'est-ce que LangChain ?](#quest-ce-que-langchain)
3. [Qu'est-ce que LangGraph ?](#quest-ce-que-langgraph)
4. [LangChain vs LangGraph](#langchain-vs-langgraph)
5. [Utilisation dans le Projet](#utilisation-dans-le-projet)
6. [Intégration avec Gemini](#intégration-avec-gemini)
7. [ReAct Agent Pattern](#react-agent-pattern)
8. [MCP Adapters pour LangChain](#mcp-adapters-pour-langchain)
9. [Exemples Concrets du Projet](#exemples-concrets-du-projet)
10. [Résumé et Bonnes Pratiques](#résumé-et-bonnes-pratiques)

---

## Introduction

**LangChain** et **LangGraph** sont deux bibliothèques complémentaires pour construire des applications avec des LLMs (Large Language Models).

### Pourquoi Ces Bibliothèques ?

Les LLMs comme GPT, Claude, ou Gemini sont puissants, mais leur intégration dans des applications réelles nécessite :

❌ **Sans LangChain/LangGraph** :
- Code répétitif pour appeler les APIs LLM
- Gestion manuelle des prompts
- Connexion manuelle aux outils externes
- Orchestration complexe de workflows

✅ **Avec LangChain/LangGraph** :
- Abstractions pour appeler n'importe quel LLM
- Gestion de prompts standardisée
- Intégration facile d'outils (tools)
- Workflows multi-étapes avec état

### Dans Notre Projet

Nous utilisons LangChain et LangGraph dans **3 agents** :

1. **Calculator Agent** : LangChain + LangGraph + MCP Tools
2. **Web Search Agent** : LangChain + LangGraph + MCP Tools
3. **Travel Planner Agent** : LangChain uniquement (génération de texte)

---

## Qu'est-ce que LangChain ?

### Définition

**LangChain** est un framework pour développer des applications alimentées par des LLMs. Il fournit des **abstractions** et des **composants réutilisables** pour :

- Appeler des LLMs (OpenAI, Anthropic, Google, etc.)
- Gérer des prompts
- Connecter des outils (tools)
- Gérer la mémoire et le contexte
- Chaîner des opérations

### Architecture de Base

```
┌──────────────────────────────────────────────────┐
│                  LangChain                       │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │    LLMs    │  │   Prompts  │  │   Tools   │ │
│  │  (Gemini,  │  │ (Templates)│  │(Functions)│ │
│  │   GPT...)  │  │            │  │           │ │
│  └────────────┘  └────────────┘  └───────────┘ │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │   Chains   │  │   Memory   │  │ Retrieval │ │
│  │ (Sequences)│  │  (Context) │  │   (RAG)   │ │
│  └────────────┘  └────────────┘  └───────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Composants Principaux

#### 1. LLMs (Language Models)

Abstractions pour appeler différents LLMs avec une interface unifiée.

```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Créer une instance du LLM Gemini
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash-exp",
  temperature: 0.7,  // Créativité : 0 = déterministe, 1 = créatif
});

// Utiliser le modèle
const result = await model.invoke("Quelle est la capitale de la France ?");
console.log(result.content);  // → "La capitale de la France est Paris."
```

**Avantages** :
- Interface unifiée pour tous les LLMs
- Facile de changer de modèle (GPT → Claude → Gemini)
- Gestion automatique des requêtes/réponses
- Retry automatique en cas d'erreur

#### 2. Prompts (Templates)

Gérer et réutiliser des prompts complexes.

```typescript
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Créer un template de prompt
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "Tu es un assistant de voyage spécialisé en {specialty}."],
  ["user", "Crée un itinéraire pour {destination} en {duration} jours."]
]);

// Utiliser le template
const prompt = await promptTemplate.format({
  specialty: "voyages culturels",
  destination: "Tokyo",
  duration: 3
});

const result = await model.invoke(prompt);
```

**Avantages** :
- Prompts réutilisables
- Variables dynamiques
- Versionning des prompts
- Séparation prompt / logique

#### 3. Tools (Outils)

Donner au LLM des capacités externes.

```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Définir un tool
const weatherTool = tool(
  async ({ city }) => {
    const response = await fetch(`https://api.weather.com/${city}`);
    const data = await response.json();
    return `Température à ${city}: ${data.temp}°C`;
  },
  {
    name: "get_weather",
    description: "Obtenir la météo pour une ville",
    schema: z.object({
      city: z.string().describe("Nom de la ville")
    })
  }
);

// Le LLM peut maintenant "appeler" ce tool
```

#### 4. Chains (Chaînes)

Séquencer plusieurs opérations.

```typescript
import { LLMChain } from "langchain/chains";

// Chaîne simple : prompt → LLM
const chain = new LLMChain({
  llm: model,
  prompt: promptTemplate
});

const result = await chain.call({
  destination: "Tokyo",
  duration: 3
});
```

### Utilisation Simple dans le Projet

**Exemple : Travel Planner Agent**

Fichier : `src/agents/travel-planner-agent/executor.ts`

```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export class TravelPlannerAgentExecutor {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    // Créer le modèle Gemini
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
      model: "gemini-2.0-flash-exp",
      temperature: 0.7
    });
  }

  private async generateItinerary(
    departure: string,
    destination: string,
    activitiesInfo: string,
    weatherInfo: string,
    budgetInfo: string
  ): Promise<string> {
    // Construire le prompt
    const prompt = `Create a 1-day travel itinerary from ${departure} to ${destination}.

Context:
- Activities: ${activitiesInfo}
- Weather: ${weatherInfo}
- Budget: ${budgetInfo}

Include morning, afternoon, and evening activities.`;

    // Appeler le LLM
    const result = await this.model.invoke(prompt);
    return result.content as string;
  }
}
```

**Ce qui se passe** :
1. `ChatGoogleGenerativeAI` : wrapper LangChain pour Gemini
2. `invoke()` : méthode standardisée pour appeler le LLM
3. Résultat retourné dans un format unifié

**Pourquoi LangChain ici ?**
- Simplifie l'appel à Gemini (pas besoin de gérer l'API directement)
- Interface standardisée (facile de changer de modèle)
- Gestion automatique des erreurs et retry

---

## Qu'est-ce que LangGraph ?

### Définition

**LangGraph** est une extension de LangChain pour créer des **workflows multi-agents avec état** (stateful multi-agent workflows). C'est comme un "graphe" où chaque nœud représente une action.

### Différence avec LangChain

| Aspect | LangChain | LangGraph |
|--------|-----------|-----------|
| **Usage** | Appeler LLMs, gérer prompts | Orchestrer workflows complexes |
| **État** | Stateless (sans mémoire) | Stateful (avec mémoire) |
| **Structure** | Chaînes linéaires | Graphes avec branches |
| **Complexité** | Simple | Avancé |
| **Cas d'usage** | Génération de texte | Agents autonomes, multi-steps |

### Architecture LangGraph

```
┌─────────────────────────────────────────────────┐
│              LangGraph Workflow                 │
│                                                 │
│   ┌─────────┐                                  │
│   │  Start  │                                  │
│   └────┬────┘                                  │
│        │                                        │
│        ▼                                        │
│   ┌─────────┐                                  │
│   │  Agent  │  ← Raisonne : quel tool ?       │
│   │ (LLM)   │                                  │
│   └────┬────┘                                  │
│        │                                        │
│        ▼                                        │
│   ┌─────────┐                                  │
│   │  Tool   │  ← Exécute le tool               │
│   │ Call    │                                  │
│   └────┬────┘                                  │
│        │                                        │
│        ▼                                        │
│   ┌─────────┐                                  │
│   │  Agent  │  ← Analyse le résultat           │
│   │ (LLM)   │                                  │
│   └────┬────┘                                  │
│        │                                        │
│   ┌────┴────┐                                  │
│   │Terminé? │                                  │
│   └────┬────┘                                  │
│        │ Non → Retour à "Tool Call"            │
│        │ Oui ↓                                 │
│   ┌─────────┐                                  │
│   │   End   │                                  │
│   └─────────┘                                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Pattern ReAct

LangGraph implémente le pattern **ReAct** (Reasoning + Acting) :

1. **Reason** : le LLM raisonne sur l'action à prendre
2. **Act** : le LLM appelle un tool
3. **Observe** : le LLM observe le résultat du tool
4. **Repeat** : répète jusqu'à avoir la réponse finale

**Exemple de cycle ReAct** :

```
User : "Calculate the budget for 7 nights at $150/night with $25/day meals"

┌─ Cycle 1 ──────────────────────────────────────┐
│ Reason : "Je dois calculer un budget de voyage"│
│ Act    : call tool "calculate_trip_budget"     │
│          args: {nights: 7, price: 150, meals:25}│
│ Observe: "$1225 (Accommodation: $1050, ...)"   │
│ Reason : "J'ai le résultat, je peux répondre"  │
└────────────────────────────────────────────────┘

Response : "The total budget is $1225..."
```

---

## LangChain vs LangGraph

### Comparaison Détaillée

| Critère | LangChain | LangGraph |
|---------|-----------|-----------|
| **Objectif** | Appeler LLMs et tools | Créer des agents autonomes |
| **Complexité** | Simple | Avancé |
| **État** | Pas de mémoire entre appels | Garde l'état du workflow |
| **Pattern** | Chaînes linéaires | Graphes avec boucles |
| **Tools** | Peut utiliser des tools | Agents qui choisissent les tools |
| **Use case** | Génération de texte simple | Agents qui raisonnent et agissent |

### Quand Utiliser Quoi ?

#### Utiliser LangChain (simple) quand :

✅ Vous voulez juste **appeler un LLM** pour générer du texte
✅ Pas besoin de tools
✅ Workflow linéaire (A → B → C)
✅ Pas besoin de mémoire entre étapes

**Exemple du projet** : Travel Planner génère un itinéraire

```typescript
// Simple : juste appeler Gemini
const result = await this.model.invoke(prompt);
return result.content as string;
```

#### Utiliser LangGraph (avancé) quand :

✅ Vous voulez un **agent autonome** qui décide quoi faire
✅ L'agent doit **choisir parmi plusieurs tools**
✅ Workflow avec **boucles** (réessayer, itérer)
✅ Besoin de **mémoire** entre étapes

**Exemple du projet** : Calculator Agent choisit le bon tool mathématique

```typescript
// Avancé : agent qui décide quel tool utiliser
const agent = createReactAgent({
  llm: this.model,
  tools: [addTool, multiplyTool, budgetTool]
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "Calculate 150 + 75" }]
});
// L'agent choisit automatiquement le tool "add"
```

### Diagramme de Décision

```
Votre besoin
     │
     ▼
┌─────────────────────┐
│ Besoin d'un agent   │
│ qui choisit parmi   │  Oui
│ plusieurs tools ?   ├────────> LangGraph + createReactAgent
│                     │
└──────────┬──────────┘
           │ Non
           ▼
┌─────────────────────┐
│ Juste générer du    │  Oui
│ texte avec un LLM ? ├────────> LangChain (model.invoke)
│                     │
└─────────────────────┘
```

---

## Utilisation dans le Projet

### Vue d'Ensemble

| Agent | LangChain | LangGraph | Tools | Pattern |
|-------|-----------|-----------|-------|---------|
| **Travel Planner** | ✅ | ❌ | ❌ | Simple invoke |
| **Calculator** | ✅ | ✅ | ✅ MCP | ReAct Agent |
| **Web Search** | ✅ | ✅ | ✅ MCP | ReAct Agent |
| **Translator** | ❌ | ❌ | ❌ | Direct Gemini SDK |
| **Weather** | ❌ | ❌ | ❌ | Direct API |

### Pattern 1 : LangChain Simple (Travel Planner)

**Besoin** : Générer un itinéraire de voyage avec contexte

**Solution** : LangChain uniquement

```typescript
// Créer le modèle
this.model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash-exp",
  temperature: 0.7
});

// Construire un prompt avec contexte
const prompt = `Create itinerary from ${departure} to ${destination}.
Context:
- Activities: ${activitiesInfo}
- Weather: ${weatherInfo}
- Budget: ${budgetInfo}`;

// Appeler le modèle
const result = await this.model.invoke(prompt);
```

**Pourquoi ce pattern ?**
- Pas besoin de tools (juste génération de texte)
- Workflow simple et linéaire
- LangChain simplifie l'appel à Gemini

### Pattern 2 : LangGraph + MCP (Calculator Agent)

**Besoin** : Agent qui choisit automatiquement le bon tool mathématique

**Solution** : LangGraph avec ReAct Agent

```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";

// 1. Créer le LLM
this.model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash-exp",
  temperature: 0  // Déterministe pour calculs
});

// 2. Connecter au serveur MCP
this.mcpClient = new Client(...);
await this.mcpClient.connect(transport);

// 3. Charger les tools MCP
const tools = await loadMcpTools("custom-math", this.mcpClient);
// → [addTool, multiplyTool, calculate_trip_budget]

// 4. Créer l'agent ReAct
this.agent = createReactAgent({
  llm: this.model,
  tools: tools
});

// 5. Utiliser l'agent
const result = await this.agent.invoke({
  messages: [{ role: "user", content: "Calculate 7 nights at $150/night + $25/day meals" }]
});

// L'agent va :
// - Raisonner : "Je dois utiliser calculate_trip_budget"
// - Appeler : calculate_trip_budget(7, 150, 25)
// - Observer : "$1225"
// - Répondre : "The total budget is $1225..."
```

**Pourquoi ce pattern ?**
- Agent doit **choisir** parmi 3 tools (add, multiply, calculate_trip_budget)
- LLM décide automatiquement quel tool utiliser
- Pas besoin de logique if/else pour choisir le tool

---

## Intégration avec Gemini

### ChatGoogleGenerativeAI

LangChain fournit un wrapper pour Google Gemini.

```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,  // Clé API Google
  model: "gemini-2.0-flash-exp",       // Modèle à utiliser
  temperature: 0.7,                     // 0 = déterministe, 1 = créatif
  maxOutputTokens: 2048,                // Limite de tokens en sortie
  topP: 0.9,                            // Sampling (optionnel)
  topK: 40                              // Sampling (optionnel)
});
```

### Paramètres Importants

| Paramètre | Description | Valeur Recommandée |
|-----------|-------------|-------------------|
| **model** | Modèle Gemini à utiliser | `gemini-2.0-flash-exp` (rapide) ou `gemini-pro` (puissant) |
| **temperature** | Créativité du modèle | `0` = calculs précis, `0.7` = génération créative, `1` = très créatif |
| **maxOutputTokens** | Limite de tokens générés | `2048` par défaut, augmenter si besoin de longs textes |

### Méthodes Principales

#### 1. invoke() : Appel Simple

```typescript
const result = await model.invoke("Quelle est la capitale de la France ?");
console.log(result.content);  // → "La capitale de la France est Paris."
```

#### 2. stream() : Streaming

```typescript
const stream = await model.stream("Raconte-moi une histoire");

for await (const chunk of stream) {
  process.stdout.write(chunk.content);  // Affiche mot par mot
}
```

#### 3. batch() : Batch Processing

```typescript
const results = await model.batch([
  "Capitale de la France ?",
  "Capitale de l'Allemagne ?",
  "Capitale de l'Italie ?"
]);

// → ["Paris", "Berlin", "Rome"]
```

---

## ReAct Agent Pattern

### Qu'est-ce que ReAct ?

**ReAct** = **Rea**soning (Raisonnement) + **Act**ing (Action)

C'est un pattern où l'agent :
1. **Raisonne** : analyse la situation et décide quoi faire
2. **Agit** : exécute une action (appeler un tool)
3. **Observe** : regarde le résultat
4. **Répète** : continue jusqu'à avoir la réponse

### Diagramme ReAct

```
User: "Calculate trip budget for 7 nights at $150/night with $25/day meals"
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Step 1: Reason (Raisonnement)                            │
│  ─────────────────────────────────────────────────────    │
│  LLM pense : "L'utilisateur veut un budget de voyage.    │
│               J'ai 3 tools disponibles : add, multiply,   │
│               calculate_trip_budget.                      │
│               Le tool approprié est calculate_trip_budget"│
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Step 2: Act (Action)                                     │
│  ─────────────────────────────────────────────────────    │
│  LLM décide d'appeler :                                   │
│  Tool: calculate_trip_budget                              │
│  Args: { nights: 7, pricePerNight: 150, mealsPerDay: 25 }│
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Step 3: Tool Execution (via MCP)                         │
│  ─────────────────────────────────────────────────────    │
│  Math Server exécute :                                    │
│  - Accommodation: 7 × 150 = 1050                          │
│  - Meals: 7 × 25 = 175                                    │
│  - Total: 1050 + 175 = 1225                               │
│  → Retour: "Total trip budget: $1225 (...)"              │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Step 4: Observe (Observation)                            │
│  ─────────────────────────────────────────────────────    │
│  LLM reçoit le résultat du tool :                         │
│  "Total trip budget: $1225 (Accommodation: $1050, ...)"  │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Step 5: Reason Again (Re-raisonnement)                   │
│  ─────────────────────────────────────────────────────    │
│  LLM pense : "J'ai le résultat du calcul.                │
│               Je peux maintenant répondre à l'utilisateur"│
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Step 6: Final Response                                   │
│  ─────────────────────────────────────────────────────    │
│  "The total trip budget is $1225, which includes $1050   │
│   for accommodation (7 nights at $150/night) and $175    │
│   for meals (7 days at $25/day)."                        │
└───────────────────────────────────────────────────────────┘
```

### Créer un Agent ReAct

```typescript
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const agent = createReactAgent({
  llm: model,        // Le LLM qui raisonne
  tools: tools,      // Les tools disponibles
  messageModifier: systemPrompt  // Optionnel : instructions système
});
```

**Paramètres** :

- **llm** : l'instance du LLM (ChatGoogleGenerativeAI)
- **tools** : array de tools que l'agent peut utiliser
- **messageModifier** : optionnel, instructions système pour guider l'agent

### Invoquer l'Agent

```typescript
const result = await agent.invoke({
  messages: [
    { role: "user", content: "Calculate 150 + 75" }
  ]
});

// Extraire la réponse
const response = result.messages[result.messages.length - 1].content;
console.log(response);  // → "150 + 75 = 225"
```

**Structure de la réponse** :

```typescript
{
  messages: [
    { role: "user", content: "Calculate 150 + 75" },
    { role: "assistant", content: "I need to use the add tool", tool_calls: [...] },
    { role: "tool", content: "225", tool_call_id: "..." },
    { role: "assistant", content: "150 + 75 = 225" }
  ]
}
```

L'agent retourne **tous les messages** de la conversation interne (raisonnement + appels tools + résultats).

---

## MCP Adapters pour LangChain

### Qu'est-ce que MCP Adapters ?

**MCP Adapters** (`@langchain/mcp-adapters`) est un package qui permet de **charger des tools MCP** et de les utiliser avec LangChain/LangGraph.

### Architecture

```
┌─────────────────────────────────────────────────┐
│          LangChain / LangGraph                  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │        ReAct Agent                       │  │
│  │   (LLM qui choisit les tools)            │  │
│  └─────────────────┬────────────────────────┘  │
│                    │                            │
│                    │ Utilise                    │
│                    ▼                            │
│  ┌──────────────────────────────────────────┐  │
│  │      LangChain Tools                     │  │
│  │   (format LangChain standard)            │  │
│  └─────────────────┬────────────────────────┘  │
└────────────────────┼────────────────────────────┘
                     │
                     │ Chargés via loadMcpTools()
                     │
┌────────────────────▼────────────────────────────┐
│          @langchain/mcp-adapters                │
│   (Convertit MCP tools → LangChain tools)       │
└─────────────────┬───────────────────────────────┘
                  │
                  │ Communique via MCP Client
                  │
┌─────────────────▼───────────────────────────────┐
│            MCP Server                           │
│   (Math Server, Brave Search, etc.)             │
│   - Expose des tools MCP                        │
│   - Exécute les fonctions                       │
└─────────────────────────────────────────────────┘
```

### loadMcpTools()

Fonction pour charger les tools depuis un serveur MCP.

```typescript
import { loadMcpTools } from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// 1. Créer et connecter le client MCP
const mcpClient = new Client({ name: "my-client", version: "1.0.0" }, { capabilities: {} });
await mcpClient.connect(transport);

// 2. Charger les tools
const tools = await loadMcpTools("server-name", mcpClient);

// 3. Les tools sont maintenant au format LangChain
console.log(tools.length);  // → 3
console.log(tools[0].name);  // → "add"
console.log(tools[1].name);  // → "multiply"
console.log(tools[2].name);  // → "calculate_trip_budget"
```

**Ce qui se passe** :

1. `loadMcpTools()` appelle le serveur MCP : `ListToolsRequest`
2. Le serveur retourne la liste des tools (nom, description, schéma)
3. `loadMcpTools()` convertit chaque tool MCP en tool LangChain
4. Les tools peuvent maintenant être utilisés par un agent LangChain/LangGraph

### Format de Tool

**MCP Tool** (côté serveur) :

```typescript
{
  name: "add",
  description: "Add two numbers",
  inputSchema: {
    type: "object",
    properties: {
      a: { type: "number" },
      b: { type: "number" }
    },
    required: ["a", "b"]
  }
}
```

**LangChain Tool** (après conversion) :

```typescript
{
  name: "add",
  description: "Add two numbers",
  schema: z.object({
    a: z.number(),
    b: z.number()
  }),
  func: async (args) => {
    // Appelle le serveur MCP avec CallToolRequest
    const result = await mcpClient.callTool("add", args);
    return result.content[0].text;
  }
}
```

---

## Exemples Concrets du Projet

### Exemple 1 : Travel Planner (LangChain Simple)

**Fichier** : `src/agents/travel-planner-agent/executor.ts`

```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export class TravelPlannerAgentExecutor implements AgentExecutor {
  private model: ChatGoogleGenerativeAI | null = null;
  private useMock: boolean;

  constructor() {
    this.useMock = process.env.USE_MOCK_DATA === "true";

    if (!this.useMock) {
      // Créer le modèle Gemini via LangChain
      this.model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY!,
        model: "gemini-2.0-flash-exp",
        temperature: 0.7
      });
    }
  }

  private async generateItinerary(
    departure: string,
    destination: string,
    activitiesInfo: string,
    weatherInfo: string,
    budgetInfo: string
  ): Promise<string> {
    console.log(`[Travel Planner] Generating itinerary`);

    // Mode mock : retourner données pré-définies
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return getMockItinerary(departure, destination);
    }

    // Construire le prompt avec contexte
    const itineraryPrompt = `Create a 1-day travel itinerary from ${departure} to ${destination}.

Context:
- Activities: ${activitiesInfo}
- Weather: ${weatherInfo}
- Budget: ${budgetInfo}

Include morning, afternoon, and evening activities. Keep it simple and concise.`;

    // Appeler Gemini via LangChain
    const result = await this.model!.invoke(itineraryPrompt);
    return result.content as string;
  }
}
```

**Utilisation** :

```
Travel Planner reçoit : "Tokyo, Paris, French"
  ↓
1. Orchestre tous les agents pour récupérer :
   - activitiesInfo (Web Search Agent)
   - weatherInfo (Weather Agent)
   - budgetInfo (Calculator Agent)
  ↓
2. Appelle generateItinerary() avec tout le contexte
  ↓
3. LangChain → Gemini : génère l'itinéraire
  ↓
4. Retourne : "Morning: Visit Senso-ji Temple..."
```

**Pourquoi LangChain ?**
- Simplifie l'appel à Gemini (pas besoin de gérer l'API REST)
- Interface unifiée (facile de changer de modèle)
- Gestion automatique des erreurs

---

### Exemple 2 : Calculator Agent (LangGraph + MCP)

**Fichier** : `src/agents/calculator-agent/executor.ts`

```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class CalculatorAgentExecutor implements AgentExecutor {
  private model: ChatGoogleGenerativeAI;
  private mcpClient: Client | null = null;
  private agent: any = null;

  constructor() {
    // Créer le LLM Gemini
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
      model: "gemini-2.0-flash-exp",
      temperature: 0  // Déterministe pour calculs
    });
  }

  private async initializeMcpAgent() {
    if (this.agent) return this.agent;

    console.log("[Calculator Agent] Initializing MCP connection...");

    // 1. Créer le client MCP
    this.mcpClient = new Client(
      { name: "calculator-client", version: "1.0.0" },
      { capabilities: {} }
    );

    // 2. Se connecter au Math Server via stdio
    const serverPath = path.join(process.cwd(), "dist", "mcp-servers", "math-server.js");
    const transport = new StdioClientTransport({
      command: "node",
      args: [serverPath]
    });
    await this.mcpClient.connect(transport);

    console.log("[Calculator Agent] MCP connected");

    // 3. Charger les tools MCP (convertis en tools LangChain)
    const tools = await loadMcpTools("custom-math", this.mcpClient);
    console.log(`[Calculator Agent] Loaded ${tools.length} tools`);
    // → 3 tools : add, multiply, calculate_trip_budget

    // 4. Créer l'agent ReAct avec LangGraph
    this.agent = createReactAgent({
      llm: this.model,
      tools: tools
    });

    console.log("[Calculator Agent] Agent initialized");
    return this.agent;
  }

  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus
  ): Promise<void> {
    try {
      const userText = requestContext.userMessage.parts.find((p) => p.kind === "text")?.text || "";
      console.log(`[Calculator Agent] Processing: ${userText}`);

      // Initialiser l'agent MCP
      const agent = await this.initializeMcpAgent();

      // Invoquer l'agent
      // L'agent va automatiquement :
      // 1. Raisonner : quel tool utiliser ?
      // 2. Appeler le tool via MCP
      // 3. Formuler la réponse
      const result = await agent.invoke({
        messages: [{ role: "user", content: userText }]
      });

      // Extraire la réponse finale
      const agentResponse = result.messages[result.messages.length - 1].content;

      console.log(`[Calculator Agent] Calculation completed`);

      // Publier la réponse via A2A
      eventBus.publish({
        kind: "message",
        messageId: uuidv4(),
        role: "agent",
        parts: [{ kind: "text", text: agentResponse }],
        contextId: requestContext.userMessage.contextId,
        taskId: requestContext.task?.id || uuidv4()
      });
      eventBus.finished();

    } catch (error: any) {
      console.error("[Calculator Agent] Error:", error);
      // Publier erreur...
    }
  }
}
```

**Flow complet** :

```
User: "Calculate trip budget for 7 nights at $150/night with $25/day meals"
  ↓
Travel Planner → Calculator Agent (A2A)
  ↓
Calculator Agent:
  1. initializeMcpAgent()
     - Connecte au Math Server (stdio)
     - Charge 3 tools MCP → convertis en tools LangChain
     - Crée agent ReAct (LangGraph)
  ↓
  2. agent.invoke({ messages: [{ role: "user", content: "Calculate..." }] })
     ↓
     LLM (Gemini) raisonne :
     "Je dois utiliser calculate_trip_budget"
     ↓
     LangGraph appelle le tool :
     calculate_trip_budget(nights=7, pricePerNight=150, mealsPerDay=25)
     ↓
     MCP Client → Math Server (stdio)
     ↓
     Math Server calcule : 1050 + 175 = 1225
     ↓
     Math Server → MCP Client : "Total: $1225"
     ↓
     LLM formule réponse : "The total trip budget is $1225..."
  ↓
  3. Publier réponse via A2A EventBus
  ↓
Travel Planner reçoit : "Total trip budget: $1225..."
```

**Pourquoi LangGraph + MCP ?**
- **LangGraph** : agent qui choisit automatiquement le bon tool
- **MCP** : tools mathématiques précis et réutilisables
- **LangChain** : interface unifiée pour LLM + tools

---

### Exemple 3 : Web Search Agent (LangGraph + Brave MCP)

**Fichier** : `src/agents/web-search-agent/executor.ts`

Même pattern que Calculator Agent, mais avec Brave Search au lieu de Math.

```typescript
// 1. Connecter au serveur Brave Search MCP
this.mcpClient = new Client(...);
await this.mcpClient.connect(transport);

// 2. Charger les tools de recherche
const tools = await loadMcpTools("brave-search", this.mcpClient);
// → brave_web_search, brave_local_search

// 3. Créer l'agent ReAct
this.agent = createReactAgent({
  llm: this.model,
  tools: tools
});

// 4. L'agent choisit automatiquement quel type de recherche utiliser
const result = await this.agent.invoke({
  messages: [{ role: "user", content: "best things to do in Tokyo" }]
});
```

---

## Résumé et Bonnes Pratiques

### Points Clés à Retenir

| Concept | Description | Usage Projet |
|---------|-------------|--------------|
| **LangChain** | Framework pour appeler LLMs | Travel Planner (génération itinéraire) |
| **LangGraph** | Extension pour agents autonomes | Calculator, Web Search (agents ReAct) |
| **ChatGoogleGenerativeAI** | Wrapper LangChain pour Gemini | Tous les agents utilisant Gemini |
| **createReactAgent** | Créer un agent ReAct | Calculator, Web Search |
| **loadMcpTools** | Charger tools MCP dans LangChain | Calculator (Math), Web Search (Brave) |
| **ReAct Pattern** | Reasoning + Acting en boucle | Agents qui choisissent des tools |

### Quand Utiliser Quoi ?

#### Pattern 1 : LangChain Simple

```typescript
// Juste générer du texte
const model = new ChatGoogleGenerativeAI({...});
const result = await model.invoke(prompt);
```

**Utilisé par** : Travel Planner

**Quand** :
- Pas besoin de tools
- Génération de texte simple
- Workflow linéaire

#### Pattern 2 : LangGraph + MCP

```typescript
// Agent autonome avec tools
const model = new ChatGoogleGenerativeAI({...});
const tools = await loadMcpTools("server-name", mcpClient);
const agent = createReactAgent({ llm: model, tools });
const result = await agent.invoke({...});
```

**Utilisé par** : Calculator, Web Search

**Quand** :
- Agent doit choisir parmi plusieurs tools
- Besoin de raisonnement dynamique
- Tools via MCP

### Checklist : Intégrer LangChain/LangGraph

#### LangChain Simple

- [ ] Installer : `npm install @langchain/google-genai`
- [ ] Créer le modèle : `new ChatGoogleGenerativeAI({...})`
- [ ] Appeler : `await model.invoke(prompt)`
- [ ] Extraire réponse : `result.content`

#### LangGraph + MCP

- [ ] Installer : `npm install @langchain/google-genai @langchain/langgraph @langchain/mcp-adapters`
- [ ] Créer le modèle : `new ChatGoogleGenerativeAI({...})`
- [ ] Créer client MCP : `new Client({...})`
- [ ] Connecter au serveur MCP : `await client.connect(transport)`
- [ ] Charger tools : `await loadMcpTools("name", client)`
- [ ] Créer agent : `createReactAgent({ llm, tools })`
- [ ] Invoquer : `await agent.invoke({ messages: [...] })`
- [ ] Extraire réponse : `result.messages[result.messages.length - 1].content`

### Pièges à Éviter

❌ **Utiliser LangGraph pour génération simple**

```typescript
// ❌ Mauvais : overkill pour juste générer du texte
const agent = createReactAgent({ llm: model, tools: [] });
const result = await agent.invoke({...});
```

```typescript
// ✅ Bon : LangChain simple suffit
const result = await model.invoke(prompt);
```

❌ **Ne pas gérer les erreurs MCP**

```typescript
// ❌ Mauvais : pas de gestion d'erreur
const tools = await loadMcpTools("server", client);
```

```typescript
// ✅ Bon : try/catch
try {
  const tools = await loadMcpTools("server", client);
} catch (error) {
  console.error("Failed to load MCP tools:", error);
  // Fallback ou mode mock
}
```

❌ **Température trop élevée pour calculs**

```typescript
// ❌ Mauvais : créatif = imprécis
const model = new ChatGoogleGenerativeAI({
  temperature: 0.9  // Trop créatif pour calculs !
});
```

```typescript
// ✅ Bon : déterministe pour précision
const model = new ChatGoogleGenerativeAI({
  temperature: 0  // Déterministe
});
```

### Comparaison Finale

| Besoin | Solution | Package |
|--------|----------|---------|
| Appeler Gemini simplement | `ChatGoogleGenerativeAI` | `@langchain/google-genai` |
| Générer texte avec LLM | `model.invoke()` | `@langchain/google-genai` |
| Agent qui choisit tools | `createReactAgent()` | `@langchain/langgraph` |
| Charger tools MCP | `loadMcpTools()` | `@langchain/mcp-adapters` |

### Architecture Complète du Projet

```
┌────────────────────────────────────────────────────────┐
│                   Travel Planner                       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  LangChain (Simple)                              │ │
│  │  - ChatGoogleGenerativeAI                        │ │
│  │  - model.invoke(prompt)                          │ │
│  │  - Génère itinéraire                             │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└─────────┬──────────────────────────────────────────────┘
          │
          │ Orchestre (A2A)
          │
   ┌──────┼────────┬────────────┐
   │      │        │            │
   ▼      ▼        ▼            ▼
┌──────┐┌─────┐┌──────┐┌───────────────────────────────┐
│Weather││Trans││ Web  ││     Calculator Agent          │
│      ││lator││Search││                               │
└──────┘└─────┘│      ││  ┌─────────────────────────┐  │
               │      ││  │ LangGraph + MCP         │  │
               │      ││  │ - createReactAgent()    │  │
               │      ││  │ - loadMcpTools()        │  │
               │      ││  │ - ReAct Pattern         │  │
               │      ││  └────────┬────────────────┘  │
               │      ││           │                   │
               │      ││           │ MCP               │
               │      ││           ▼                   │
               │      ││  ┌─────────────────────────┐  │
               │      ││  │   Math MCP Server       │  │
               │      ││  │   (add, multiply, ...)  │  │
               │      ││  └─────────────────────────┘  │
               └──────┘└───────────────────────────────┘
                  │
                  │ LangGraph + MCP (Brave)
                  │
               ┌──▼──────────────────────┐
               │ Brave Search MCP Server │
               └─────────────────────────┘
```

### Prochaines Étapes

Vous maîtrisez maintenant :

✅ **LangChain** : appeler des LLMs simplement
✅ **LangGraph** : créer des agents autonomes
✅ **ReAct Pattern** : agents qui raisonnent et agissent
✅ **MCP Adapters** : charger des tools MCP dans LangChain
✅ **Intégration Gemini** : utiliser Google Gemini via LangChain
✅ **Architecture du projet** : où et pourquoi utiliser chaque composant

---

**Félicitations !** Vous comprenez maintenant comment LangChain et LangGraph sont utilisés dans le projet. 🎉

**Fichier précédent** : [05 - Guide Pratique du Projet](./05-project-walkthrough.md)
**Retour au début** : [README](./README.md)
