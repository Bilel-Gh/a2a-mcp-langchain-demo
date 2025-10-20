# 01 - Le Protocole A2A (Agent-to-Agent)

## Table des Matières

1. [Introduction](#introduction)
2. [Qu'est-ce que A2A ?](#quest-ce-que-a2a)
3. [Concepts Fondamentaux](#concepts-fondamentaux)
   - [Agent Card](#agent-card)
   - [Messages](#messages)
   - [Parts](#parts)
   - [Tasks](#tasks)
4. [Types de Communication](#types-de-communication)
   - [Mode Blocking (Synchrone)](#mode-blocking-synchrone)
   - [Mode Non-Blocking (Asynchrone)](#mode-non-blocking-asynchrone)
5. [Streaming avec Server-Sent Events (SSE)](#streaming-avec-server-sent-events-sse)
6. [Webhooks et Push Notifications](#webhooks-et-push-notifications)
7. [Résumé et Bonnes Pratiques](#résumé-et-bonnes-pratiques)

---

## Introduction

Le protocole **A2A (Agent-to-Agent)** est un protocole de communication standardisé permettant à des agents autonomes (programmes intelligents) de communiquer entre eux de manière structurée et interopérable.

### Pourquoi A2A ?

Dans un monde où les systèmes d'intelligence artificielle deviennent de plus en plus complexes, nous avons besoin :

- **D'interopérabilité** : différents agents doivent pouvoir communiquer sans connaître leur implémentation interne
- **De standardisation** : un langage commun pour que tous les agents se comprennent
- **De modularité** : chaque agent a une responsabilité unique et peut être remplacé/amélioré indépendamment
- **D'orchestration** : des agents peuvent coordonner d'autres agents pour accomplir des tâches complexes

### Cas d'Usage Concrets

Notre projet **Travel Planner** illustre parfaitement ces besoins :

- Un agent **Travel Planner** orchestre plusieurs agents spécialisés
- Un agent **Weather** fournit des informations météo
- Un agent **Translator** traduit du contenu
- Un agent **Web Search** recherche des informations en ligne
- Un agent **Calculator** effectue des calculs complexes

**Sans A2A** : chaque agent aurait sa propre API, son propre format de données, sa propre façon de gérer les erreurs. Le Travel Planner devrait connaître intimement chaque agent.

**Avec A2A** : tous les agents parlent le même langage. Le Travel Planner envoie des `Messages`, reçoit des `Messages`, et peut traiter n'importe quel agent A2A compatible.

---

## Qu'est-ce que A2A ?

### Définition

A2A est un **protocole de communication** basé sur HTTP qui définit :

1. **Comment les agents se décrivent** (Agent Card)
2. **Comment ils échangent des informations** (Messages)
3. **Comment ils gèrent des tâches asynchrones** (Tasks)
4. **Comment ils notifient des événements** (Webhooks)

### Architecture Générale

```
┌─────────────────┐                    ┌─────────────────┐
│                 │   HTTP Request     │                 │
│  Agent Client   │ ─────────────────> │  Agent Server   │
│  (Appelant)     │                    │  (Appelé)       │
│                 │ <───────────────── │                 │
│                 │   HTTP Response    │                 │
└─────────────────┘                    └─────────────────┘
```

**Dans notre projet** :

```
┌──────────────────┐
│  Travel Planner  │ ──┐
│   (Orchestrateur)│   │
└──────────────────┘   │
         │             │
         │ Appelle     │ Tous sont des
         │             │ agents A2A
         ▼             │
┌──────────────────┐   │
│  Weather Agent   │ ──┤
│  Translator      │ ──┤
│  Web Search      │ ──┤
│  Calculator      │ ──┘
└──────────────────┘
```

### Principes Clés

1. **Décentralisé** : pas de serveur central, chaque agent est autonome
2. **Découvrable** : chaque agent expose une "carte d'identité" (Agent Card)
3. **Flexible** : communication synchrone ou asynchrone selon les besoins
4. **Extensible** : nouveaux types de messages et capacités peuvent être ajoutés

---

## Concepts Fondamentaux

### Agent Card

L'**Agent Card** est la carte d'identité d'un agent A2A. C'est un fichier JSON accessible publiquement qui décrit :

- Le nom et la description de l'agent
- Ses capacités (skills)
- La version du protocole A2A supportée
- L'URL pour envoyer des messages

#### Structure d'une Agent Card

```typescript
interface AgentCard {
  name: string              // Nom de l'agent
  description: string       // Description de ses capacités
  skills: Skill[]          // Liste des compétences
  url: string              // URL de base de l'agent
  protocolVersion: string  // Version du protocole A2A
}

interface Skill {
  name: string             // Nom de la compétence
  description: string      // Description détaillée
  tags?: string[]         // Tags pour catégorisation
  examples?: string[]     // Exemples d'utilisation
}
```

#### Exemple : Weather Agent Card

Fichier : `src/agents/weather-agent/agent-card.ts`

```typescript
export const weatherAgentCard: AgentCard = {
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
};
```

**Points clés** :

- **name** : identifiant humain de l'agent
- **description** : explique à quoi sert l'agent (pour les humains et les LLMs)
- **skills** : liste des capacités avec exemples d'utilisation
- **url** : où envoyer les requêtes
- **protocolVersion** : version A2A pour compatibilité

#### Exemple : Travel Planner Agent Card

Fichier : `src/agents/travel-planner-agent/agent-card.ts`

```typescript
export const travelPlannerCard: AgentCard = {
  name: "Travel Planner Agent",
  description: "Travel planning orchestrator that coordinates multiple agents",
  skills: [
    {
      name: "plan_trip",
      description: "Create comprehensive travel itineraries",
      tags: ["travel", "planning", "orchestration"],
      examples: [
        "Plan a trip to Tokyo",
        "Tokyo, Paris, French"  // destination, departure, language
      ]
    }
  ],
  url: "http://localhost:4002",
  protocolVersion: "1.0"
};
```

#### Découverte d'un Agent

L'Agent Card est toujours accessible à l'URL : `/.well-known/agent-card.json`

```bash
# Découvrir le Weather Agent
curl http://localhost:4000/.well-known/agent-card.json

# Découvrir le Travel Planner
curl http://localhost:4002/.well-known/agent-card.json
```

**Pourquoi c'est important ?**

- Un agent peut découvrir dynamiquement les capacités d'un autre agent
- Permet l'auto-documentation
- Facilite l'intégration de nouveaux agents

---

### Messages

Un **Message** est l'unité de communication de base en A2A. C'est l'équivalent d'un message dans une conversation.

#### Structure d'un Message

```typescript
interface Message {
  kind: "message"           // Type : toujours "message"
  messageId: string         // ID unique du message
  role: "user" | "agent"   // Qui parle ?
  parts: Part[]            // Contenu du message (voir section Parts)
  contextId?: string       // ID de contexte pour grouper les messages
  taskId?: string          // ID de tâche associée (optionnel)
}
```

#### Exemple : Message Utilisateur

Quand le client envoie une requête au Travel Planner :

```typescript
const userMessage: Message = {
  kind: "message",
  messageId: "550e8400-e29b-41d4-a716-446655440000",
  role: "user",
  parts: [
    {
      kind: "text",
      text: "Tokyo, Paris, French"
    }
  ]
};
```

**Détails** :

- `messageId` : UUID unique généré pour ce message
- `role: "user"` : indique que c'est un message envoyé par l'utilisateur
- `parts` : tableau contenant les différentes parties du message (ici, juste du texte)

#### Exemple : Message Agent (Réponse)

Quand le Weather Agent répond :

```typescript
const agentResponse: Message = {
  kind: "message",
  messageId: "660e8400-e29b-41d4-a716-446655440001",
  role: "agent",
  parts: [
    {
      kind: "text",
      text: "Current temperature in Tokyo is 22°C with partly cloudy skies..."
    }
  ],
  contextId: "context-123",
  taskId: "task-456"
};
```

**Détails** :

- `role: "agent"` : indique que c'est une réponse de l'agent
- `contextId` : permet de regrouper plusieurs messages liés (conversation)
- `taskId` : si associé à une tâche asynchrone

#### Rôles : User vs Agent

| Rôle | Description | Qui l'envoie |
|------|-------------|--------------|
| `user` | Message envoyé par un utilisateur ou un agent appelant | Client, Agent orchestrateur |
| `agent` | Réponse ou message généré par l'agent | Agent serveur |

**Dans notre projet** :

```
Client Demo ──[role: user]──> Travel Planner
Travel Planner ──[role: user]──> Weather Agent
Weather Agent ──[role: agent]──> Travel Planner
Travel Planner ──[role: agent]──> Client Demo
```

---

### Parts

Les **Parts** sont les composants d'un message. Un message peut contenir plusieurs parts de différents types.

#### Types de Parts

```typescript
type Part =
  | TextPart          // Texte simple
  | DataPart          // Données structurées (JSON)
  | ToolCallPart      // Appel d'outil (pour LLMs)
  | ToolResultPart    // Résultat d'un appel d'outil
```

#### 1. TextPart : Texte Simple

Le type le plus courant.

```typescript
interface TextPart {
  kind: "text"
  text: string
}
```

**Exemple du projet** :

```typescript
// Requête utilisateur
{
  kind: "text",
  text: "Tokyo, Paris, French"
}

// Réponse du Weather Agent
{
  kind: "text",
  text: "Current temperature in Tokyo is 22°C with partly cloudy skies."
}
```

#### 2. DataPart : Données Structurées

Pour envoyer des données JSON complexes.

```typescript
interface DataPart {
  kind: "data"
  data: any  // Objet JSON
  mimeType?: string
}
```

**Exemple hypothétique** :

```typescript
{
  kind: "data",
  data: {
    temperature: 22,
    condition: "partly_cloudy",
    humidity: 65,
    forecast: [
      { day: "Monday", temp: 24, condition: "sunny" },
      { day: "Tuesday", temp: 20, condition: "rainy" }
    ]
  },
  mimeType: "application/json"
}
```

#### 3. ToolCallPart : Appel d'Outil

Utilisé quand un LLM décide d'appeler un outil (fonction).

```typescript
interface ToolCallPart {
  kind: "tool_call"
  toolCallId: string
  toolName: string
  args: Record<string, any>
}
```

**Exemple** : le Calculator Agent utilise des tools via MCP

```typescript
{
  kind: "tool_call",
  toolCallId: "call-123",
  toolName: "calculate_trip_budget",
  args: {
    nights: 7,
    pricePerNight: 150,
    mealsPerDay: 25
  }
}
```

#### 4. ToolResultPart : Résultat d'Outil

Le résultat d'un appel d'outil.

```typescript
interface ToolResultPart {
  kind: "tool_result"
  toolCallId: string
  result: any
}
```

**Exemple** :

```typescript
{
  kind: "tool_result",
  toolCallId: "call-123",
  result: {
    total: 1225,
    breakdown: {
      accommodation: 1050,
      meals: 175
    }
  }
}
```

#### Messages Multi-Parts

Un message peut contenir plusieurs parts :

```typescript
const complexMessage: Message = {
  kind: "message",
  messageId: "msg-789",
  role: "agent",
  parts: [
    {
      kind: "text",
      text: "Voici le rapport météo détaillé :"
    },
    {
      kind: "data",
      data: {
        temperature: 22,
        condition: "partly_cloudy"
      }
    },
    {
      kind: "text",
      text: "Prévisions favorables pour votre voyage."
    }
  ]
};
```

**Dans notre projet**, nous utilisons principalement des `TextPart` pour la simplicité, mais le protocole supporte la complexité quand nécessaire.

---

### Tasks

Une **Task** représente une tâche asynchrone de longue durée. Elle est utilisée quand :

- L'opération prend du temps (plusieurs secondes/minutes)
- Le client ne veut pas attendre en bloquant
- L'agent veut notifier la progression via webhooks

#### Structure d'une Task

```typescript
interface Task {
  kind: "task"
  id: string                    // ID unique de la tâche
  contextId?: string            // Contexte associé
  status: TaskStatus            // État actuel
  artifacts?: Artifact[]        // Résultats intermédiaires
  progressInfo?: ProgressInfo   // Information de progression
}

type TaskStatus =
  | "pending"      // En attente de démarrage
  | "running"      // En cours d'exécution
  | "completed"    // Terminée avec succès
  | "failed"       // Échouée

interface ProgressInfo {
  currentStep: number
  totalSteps: number
  description?: string
}
```

#### Exemple : Task en Progression

```typescript
const travelTask: Task = {
  kind: "task",
  id: "task-travel-123",
  contextId: "context-456",
  status: "running",
  progressInfo: {
    currentStep: 2,
    totalSteps: 5,
    description: "Collecting weather information"
  }
};
```

#### Cycle de Vie d'une Task

```
pending ──> running ──> completed
                 │
                 └────> failed
```

**Dans notre projet actuel**, nous utilisons le **mode blocking** donc nous ne gérons pas explicitement les tasks côté client. Cependant, le Travel Planner crée des tasks en interne pour le suivi.

---

## Types de Communication

A2A supporte deux modes de communication principaux :

### Mode Blocking (Synchrone)

Le client envoie une requête et **attend** la réponse complète avant de continuer.

#### Caractéristiques

- ✅ Simple à implémenter
- ✅ Réponse immédiate
- ✅ Pas de gestion de webhooks
- ❌ Bloque le client pendant l'exécution
- ❌ Timeout si l'opération est trop longue

#### Structure de Requête

```typescript
interface MessageSendParams {
  message: Message              // Le message à envoyer
  configuration?: {
    blocking?: boolean         // true = mode synchrone
  }
}
```

#### Exemple : Client Demo

Fichier : `src/client/travel-demo.ts`

```typescript
// Configuration en mode blocking
const params: MessageSendParams = {
  message: {
    messageId: uuidv4(),
    role: "user",
    parts: [{ kind: "text", text: userInput }],
    kind: "message"
  },
  configuration: {
    blocking: true  // Mode synchrone
  }
};

// Envoi et attente de la réponse
console.log("Sending request to Travel Planner...");
const response = await travelClient.sendMessage(params);

// Traitement immédiat de la réponse
if (response.result.kind === "message") {
  const text = response.result.parts
    .filter(p => p.kind === "text")
    .map(p => p.text)
    .join("\n");

  console.log("TRAVEL REPORT");
  console.log(text);
}
```

#### Diagramme de Séquence : Mode Blocking

```
Client                          Travel Planner
  │                                   │
  │  POST /sendMessage               │
  │  blocking: true                  │
  │ ──────────────────────────────> │
  │                                   │
  │        [Agent travaille]         │
  │        [Appelle autres agents]   │
  │        [Génère itinéraire]       │
  │                                   │
  │  HTTP 200 OK                     │
  │  { result: Message }             │
  │ <────────────────────────────── │
  │                                   │
  │ [Affiche le résultat]            │
  │                                   │
```

**Quand l'utiliser ?**

- Opérations rapides (< 30 secondes)
- Interfaces synchrones (CLI, scripts)
- Démos et prototypes (notre cas)

---

### Mode Non-Blocking (Asynchrone)

Le client envoie une requête, reçoit immédiatement une **Task**, et est notifié via **webhooks** de la progression.

#### Caractéristiques

- ✅ Ne bloque pas le client
- ✅ Idéal pour opérations longues
- ✅ Notifications de progression
- ✅ Peut gérer des timeouts longs
- ❌ Plus complexe à implémenter
- ❌ Nécessite un serveur webhook

#### Structure de Requête

```typescript
const params: MessageSendParams = {
  message: userMessage,
  configuration: {
    blocking: false,  // Mode asynchrone
    pushNotificationConfig: {
      url: "http://localhost:5001/webhook",  // URL du webhook
      headers: {
        "Authorization": "Bearer token123"
      }
    }
  }
};
```

#### Exemple Hypothétique : Mode Asynchrone

```typescript
// Envoi en mode non-blocking
const response = await travelClient.sendMessage(params);

// Réponse immédiate = Task
if (response.result.kind === "task") {
  console.log(`Task created: ${response.result.id}`);
  console.log(`Status: ${response.result.status}`);

  // Le client continue son travail
  // Les mises à jour arriveront via webhook
}
```

#### Diagramme de Séquence : Mode Non-Blocking

```
Client                  Travel Planner               Webhook Server
  │                            │                            │
  │  POST /sendMessage        │                            │
  │  blocking: false          │                            │
  │  webhookUrl: ...          │                            │
  │ ────────────────────────> │                            │
  │                            │                            │
  │  HTTP 200 OK              │                            │
  │  { result: Task }         │                            │
  │ <──────────────────────── │                            │
  │                            │                            │
  │ [Client continue]         │ [Agent travaille]         │
  │                            │                            │
  │                            │  POST /webhook            │
  │                            │  Task: running            │
  │                            │ ────────────────────────> │
  │                            │                            │
  │                            │  POST /webhook            │
  │                            │  Task: completed          │
  │                            │ ────────────────────────> │
  │                            │                            │
  │ <──────────── Notification via webhook ──────────────  │
  │                            │                            │
```

**Quand l'utiliser ?**

- Opérations longues (> 30 secondes)
- Interfaces asynchrones (web apps, mobile)
- Besoin de progression en temps réel
- Production avec haute disponibilité

---

## Streaming avec Server-Sent Events (SSE)

Le **streaming** permet à l'agent de renvoyer des événements progressifs au lieu d'attendre la fin complète de l'opération.

### Qu'est-ce que SSE ?

**Server-Sent Events (SSE)** est une technologie permettant au serveur d'envoyer des mises à jour en temps réel au client via une connexion HTTP persistante.

#### Caractéristiques SSE

- Connexion HTTP unidirectionnelle (serveur → client)
- Format texte simple (event stream)
- Reconnexion automatique en cas de déconnexion
- Léger et simple (contrairement à WebSockets qui est bidirectionnel)

### Streaming en A2A

#### Structure d'un Stream

Quand un agent stream, il envoie une séquence d'événements :

```typescript
type StreamEvent =
  | Message           // Message complet ou partiel
  | Task              // Mise à jour de task
  | Error             // Erreur
```

#### Exemple : Travel Planner Appelle Weather Agent

Fichier : `src/agents/travel-planner-agent/executor.ts`

```typescript
private async callAgent(
  client: A2AClient,
  agentName: string,
  query: string
): Promise<string> {
  console.log(`[Travel Planner] Calling ${agentName}`);

  const params: MessageSendParams = {
    message: {
      messageId: uuidv4(),
      role: "user",
      parts: [{ kind: "text", text: query }],
      kind: "message"
    }
  };

  // Streaming : itération sur les événements
  const stream = client.sendMessageStream(params);
  let finalResponse = "";

  try {
    for await (const event of stream) {
      // Traiter chaque événement du stream
      if (event.kind === "message" && event.role === "agent") {
        const text = event.parts
          .filter(p => p.kind === "text")
          .map(p => p.text)
          .join(" ");

        if (text) finalResponse = text;
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

**Flux d'exécution** :

1. Travel Planner crée un stream vers Weather Agent
2. Weather Agent traite la requête
3. Weather Agent peut envoyer plusieurs événements :
   - Message partiel : "Récupération des données..."
   - Message partiel : "Analyse de la météo..."
   - Message final : "Current temperature in Tokyo is 22°C..."
4. Travel Planner reçoit tous les événements et garde le dernier

### Pourquoi Utiliser le Streaming ?

#### Avantages

- **Feedback temps réel** : l'utilisateur voit la progression
- **Expérience utilisateur** : pas d'écran figé pendant 30 secondes
- **Débogage** : voir exactement où l'agent en est
- **Interruption** : possibilité d'annuler en cours de route

#### Exemple Visuel : Sans Streaming vs Avec Streaming

**Sans streaming (blocking)** :

```
[Client] Sending request...
[Client] ⏳ Waiting...
[Client] ⏳ Waiting...
[Client] ⏳ Waiting... (30 secondes plus tard)
[Client] ✅ Received: "Here is your complete travel plan..."
```

**Avec streaming** :

```
[Client] Sending request...
[Client] 📡 Calling Weather Agent...
[Client] 📡 Weather data received
[Client] 📡 Calling Translator Agent...
[Client] 📡 Translation completed
[Client] 📡 Generating itinerary...
[Client] ✅ Final report ready
```

### Streaming Interne vs Externe

**Dans notre projet** :

- **Streaming interne** : Travel Planner ↔ autres agents (Weather, Translator, etc.)
- **Pas de streaming externe** : Client ↔ Travel Planner (mode blocking simple)

**Pourquoi cette architecture ?**

1. **Simplicité client** : le client reçoit une seule réponse finale
2. **Complexité masquée** : l'orchestration se fait en interne
3. **Facile à expliquer** : une requête → une réponse

**Architecture simplifiée** :

```
Client Demo
    │
    │ sendMessage(blocking: true)
    │ ──────────────────────────────> Travel Planner
    │                                       │
    │                                       │ sendMessageStream()
    │                                       ├──────────────> Weather Agent
    │                                       │                    │
    │                                       │ <──────────────────┤
    │                                       │  [events stream]
    │                                       │
    │                                       │ sendMessageStream()
    │                                       ├──────────────> Translator
    │                                       │                    │
    │                                       │ <──────────────────┤
    │                                       │  [events stream]
    │                                       │
    │                                       │ [Génère rapport]
    │                                       │
    │ <────────────────────────────────────┤
    │     Single Message Response
    │
```

---

## Webhooks et Push Notifications

Les **webhooks** permettent à l'agent de notifier le client de manière asynchrone quand des événements se produisent.

### Concept des Webhooks

Un webhook est une **URL HTTP** que le client fournit à l'agent. L'agent envoie des requêtes POST à cette URL pour notifier le client.

```
Client fournit : http://localhost:5001/webhook
Agent envoie des POST à cette URL avec des mises à jour
```

### Configuration des Webhooks

#### PushNotificationConfig

```typescript
interface PushNotificationConfig {
  url: string                      // URL du webhook
  headers?: Record<string, string> // Headers HTTP (auth, etc.)
}
```

#### Exemple : Client avec Webhook

Fichier : `src/client/travel-demo.ts`

```typescript
import { startWebhookServer } from "../utils/webhookServer.js";

// Démarrer un serveur webhook local
const { port, url: webhookUrl } = await startWebhookServer(
  (task: Task) => {
    console.log("[Webhook] Task update received:");
    console.log(`  Task ID: ${task.id}`);
    console.log(`  Status: ${task.status}`);

    if (task.status === "completed") {
      console.log("  Task completed successfully!");
    }
  },
  5000  // Port souhaité
);

console.log(`Webhook server listening at ${webhookUrl}`);

// Configurer la requête avec webhook
const params: MessageSendParams = {
  message: userMessage,
  configuration: {
    blocking: false,
    pushNotificationConfig: {
      url: webhookUrl
    }
  }
};
```

### PushNotificationStore

Côté serveur, l'agent utilise un **PushNotificationStore** pour sauvegarder les configurations webhook et envoyer les notifications.

#### Interface PushNotificationStore

```typescript
interface PushNotificationStore {
  // Sauvegarder la config webhook pour une task
  save(taskId: string, config: PushNotificationConfig): Promise<void>

  // Charger la config webhook d'une task
  load(taskId: string): Promise<PushNotificationConfig | null>

  // Supprimer la config (après completion)
  delete(taskId: string): Promise<void>
}
```

#### Implémentation : InMemoryPushNotificationStore

Fichier : `src/agents/travel-planner-agent/server.ts`

```typescript
import { InMemoryPushNotificationStore } from "@a2a-js/sdk/server";

// Créer le store en mémoire
const pushStore = new InMemoryPushNotificationStore();
```

**Note** : `InMemoryPushNotificationStore` stocke les configs en RAM. Pour la production, utilisez une base de données (Redis, PostgreSQL, etc.).

### DefaultPushNotificationSender

Le **PushNotificationSender** envoie les notifications HTTP aux webhooks.

```typescript
import { DefaultPushNotificationSender } from "@a2a-js/sdk/server";

const pushSender = new DefaultPushNotificationSender(pushStore);
```

#### Configuration Serveur Complète

Fichier : `src/agents/travel-planner-agent/server.ts`

```typescript
const pushStore = new InMemoryPushNotificationStore();
const pushSender = new DefaultPushNotificationSender(pushStore);

const a2aApp = new A2AExpressApp({
  defaultExecutor: travelPlannerExecutor,
  agentCard: travelPlannerCard,
  pushNotificationStore: pushStore,
  pushNotificationSender: pushSender
});

// Le SDK gère automatiquement :
// 1. Sauvegarder les configs webhook
// 2. Envoyer les notifications aux bonnes URLs
// 3. Nettoyer après completion
```

### Flow Webhook Complet

```
1. Client démarre webhook server sur port 5001
2. Client envoie requête avec pushNotificationConfig: { url: "http://localhost:5001/webhook" }
3. Travel Planner reçoit la requête
4. Travel Planner sauvegarde config webhook dans pushStore
5. Travel Planner commence l'exécution
6. Travel Planner publie des événements via eventBus
7. SDK convertit les événements en Task updates
8. DefaultPushNotificationSender envoie POST au webhook
9. Client reçoit les mises à jour en temps réel
10. Quand terminé, Travel Planner nettoie le pushStore
```

### Exemple de Notification Webhook

Quand l'agent publie un événement :

```typescript
eventBus.publish({
  kind: "message",
  role: "agent",
  parts: [{ kind: "text", text: "Weather data collected" }]
});
```

Le SDK envoie une requête POST au webhook :

```http
POST http://localhost:5001/webhook
Content-Type: application/json

{
  "kind": "task",
  "id": "task-123",
  "status": "running",
  "contextId": "context-456",
  "progressInfo": {
    "currentStep": 2,
    "totalSteps": 5,
    "description": "Weather data collected"
  }
}
```

### Webhook Server Simple

Fichier : `src/utils/webhookServer.ts`

```typescript
import express from "express";

export function startWebhookServer(
  onTaskUpdate: (task: Task) => void,
  port: number = 5000
): Promise<{ port: number; url: string }> {
  const app = express();
  app.use(express.json());

  // Route webhook
  app.post("/webhook", (req, res) => {
    const task = req.body as Task;
    onTaskUpdate(task);  // Callback
    res.status(200).send("OK");
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      const actualPort = (server.address() as any).port;
      const url = `http://localhost:${actualPort}/webhook`;
      resolve({ port: actualPort, url });
    });

    // Gestion port occupé : retry avec port+1
    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        server.close();
        startWebhookServer(onTaskUpdate, port + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
}
```

**Fonctionnalités** :

- Route POST `/webhook` pour recevoir les notifications
- Retry automatique si le port est occupé
- Retourne le port réel et l'URL complète

---

## Résumé et Bonnes Pratiques

### Concepts Clés à Retenir

| Concept | Description | Exemple Projet |
|---------|-------------|----------------|
| **Agent Card** | Carte d'identité de l'agent | `weatherAgentCard`, `travelPlannerCard` |
| **Message** | Unité de communication de base | Requête utilisateur, réponse agent |
| **Parts** | Composants d'un message | TextPart, DataPart, ToolCallPart |
| **Task** | Tâche asynchrone de longue durée | Créée en interne par Travel Planner |
| **Blocking** | Mode synchrone : attend la réponse | Client Demo → Travel Planner |
| **Non-Blocking** | Mode asynchrone : utilise webhooks | Non utilisé dans ce projet (pour simplicité) |
| **Streaming SSE** | Événements progressifs en temps réel | Travel Planner → autres agents |
| **Webhooks** | Notifications push asynchrones | Configuré mais non utilisé (mode blocking) |

### Comparaison des Modes de Communication

| Critère | Blocking | Non-Blocking + Webhooks | Streaming SSE |
|---------|----------|-------------------------|---------------|
| **Complexité** | ⭐ Simple | ⭐⭐⭐ Complexe | ⭐⭐ Moyen |
| **Temps réel** | ❌ Non | ✅ Oui (via webhooks) | ✅ Oui (via events) |
| **Bloquant** | ✅ Oui | ❌ Non | ⚠️ Partiellement |
| **Infrastructure** | Minimale | Serveur webhook requis | Connexion persistante |
| **Cas d'usage** | Démos, scripts | Production, web apps | Feedback progressif |

### Bonnes Pratiques

#### 1. Choisir le Bon Mode

✅ **Utilisez Blocking quand** :
- Opération rapide (< 30s)
- Interface CLI ou script
- Prototype/démo

✅ **Utilisez Non-Blocking + Webhooks quand** :
- Opération longue (> 30s)
- Interface web/mobile
- Besoin de progression en temps réel

✅ **Utilisez Streaming SSE quand** :
- Communication agent-à-agent interne
- Besoin de feedback intermédiaire
- Orchestration complexe

#### 2. Gestion des IDs

```typescript
import { v4 as uuidv4 } from "uuid";

// Toujours générer des UUIDs uniques
const messageId = uuidv4();
const taskId = uuidv4();
const contextId = uuidv4();
```

#### 3. Gestion d'Erreurs

```typescript
try {
  // Exécution
  const result = await performTask();

  // Publier succès
  eventBus.publish({
    kind: "message",
    role: "agent",
    parts: [{ kind: "text", text: result }]
  });
  eventBus.finished();

} catch (error: any) {
  // Publier erreur
  eventBus.publish({
    kind: "message",
    role: "agent",
    parts: [{ kind: "text", text: `Error: ${error.message}` }]
  });
  eventBus.finished();
}
```

#### 4. Agent Card : Soyez Descriptif

```typescript
// ✅ Bon : descriptions claires avec exemples
skills: [
  {
    name: "get_weather",
    description: "Get current weather and 5-day forecast for any city",
    examples: [
      "What is the weather in Paris?",
      "Weather forecast for Tokyo",
      "Tell me the temperature in London"
    ]
  }
]

// ❌ Mauvais : trop vague
skills: [
  {
    name: "weather",
    description: "Weather stuff"
  }
]
```

#### 5. Logs Structurés

```typescript
// ✅ Bon : préfixe clair
console.log("[Travel Planner] Planning trip: Tokyo");
console.log("[Weather Agent] Fetching weather data");

// ❌ Mauvais : pas de contexte
console.log("Planning trip");
console.log("Getting weather");
```

#### 6. Timeout et Retry

```typescript
// Configurer des timeouts raisonnables
const timeout = 30000; // 30 secondes

// Implémenter retry logic pour appels externes
async function callWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Architecture Recommandée pour ce Projet

Notre projet utilise une architecture **simplifiée et pragmatique** :

```
Client (Blocking) ──> Travel Planner (Orchestrateur)
                           │
                           ├─── (Streaming) ──> Weather Agent
                           ├─── (Streaming) ──> Translator Agent
                           ├─── (Streaming) ──> Web Search Agent
                           └─── (Streaming) ──> Calculator Agent
```

**Avantages de cette approche** :

1. **Simple à comprendre** : le client reçoit une seule réponse
2. **Facile à présenter** : pas de complexité webhook côté client
3. **Performance acceptable** : orchestration efficace en interne
4. **Extensible** : facile d'ajouter des agents ou passer en mode asynchrone

### Prochaines Étapes

Maintenant que vous maîtrisez le protocole A2A, vous êtes prêt à :

1. **Lire le fichier suivant** : [02-a2a-sdk-js.md](./02-a2a-sdk-js.md) pour comprendre comment implémenter concrètement des agents avec le SDK JavaScript

2. **Explorer le code** : examiner les agents du projet avec les concepts en tête

3. **Présenter à votre manager** : expliquer comment A2A permet l'interopérabilité et l'orchestration

---

**Fichier suivant** : [02 - Le SDK JavaScript A2A](./02-a2a-sdk-js.md)
