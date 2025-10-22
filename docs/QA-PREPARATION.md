# Q&A Preparation Guide

**Purpose:** Prepare for 30-minute question and answer session after presentation
**Language:** Simple English (B2 level)
**Format:** Question → Simple answer → Optional details → Optional code/diagram

---

## Table of Contents

1. [A2A Fundamentals (15 questions)](#a2a-fundamentals)
2. [Technical Details (15 questions)](#technical-details)
3. [Architecture & Design (10 questions)](#architecture--design)
4. [MCP Questions (5 questions)](#mcp-questions)
5. [Business Value (5 questions)](#business-value)
6. [Demo-Specific Questions (5 questions)](#demo-specific-questions)

---

## A2A Fundamentals

### Q1: What does A2A stand for?

**Simple Answer:**
A2A means "Agent to Agent". It's a protocol for AI agents to communicate with each other. Like HTTP for web pages, A2A is for agents.

**If they ask more:**
A2A was created by Anthropic (the company that makes Claude AI). They released it as an open standard in 2024. The goal is to make all AI agents compatible with each other.

**Diagram:** None needed

---

### Q2: Who created A2A and why?

**Simple Answer:**
Anthropic created A2A. They are the company behind Claude AI. They created it because there was no standard way for agents to talk to each other. Every company made their own protocol. This made it hard to connect different agents.

**If they ask more:**
Before A2A, if you wanted to connect 5 agents from different companies, you needed 5 different integration methods. With A2A, you need only one. It's like USB for computers - one standard that works everywhere.

**Diagram:** None needed

---

### Q3: What's the difference between A2A and regular API calls?

**Simple Answer:**
Regular API calls are for specific functions. A2A is for agent communication. The difference:

- **Regular API**: "Get user data from database"
- **A2A**: "Agent, help me plan a trip"

A2A includes agent discovery, streaming updates, and standard message format. Regular APIs don't have these.

**If they ask more:**
A2A is built on top of HTTP, but adds several features:
- Agent Cards for discovery
- Standard message format
- SSE streaming for real-time updates
- Webhook support for async tasks
- Task management
- Protocol versioning

**Diagram:** You can draw a simple comparison on whiteboard if needed

---

### Q4: What is an agent in A2A?

**Simple Answer:**
An agent is a program that:
1. Has a specific job or skill
2. Can receive requests
3. Can send responses
4. Uses AI to process requests

Think of it like a specialized worker. You give it a task, it does the work, it gives you the result.

**If they ask more:**
In A2A, an agent must:
- Provide an Agent Card at `/.well-known/agent-card.json`
- Implement `/v1/messages` endpoint
- Follow A2A message format
- Support protocol version 0.1.0 (current version)

An agent can be stateless (like our Weather Agent) or stateful (maintaining conversation history).

**Diagram:** None needed

---

### Q5: What is an Agent Card?

**Simple Answer:**
An Agent Card is like a business card for agents. It contains:
- Agent name
- What it does (description)
- What skills it has
- Protocol version

Before agents talk, they exchange cards. This way they know how to communicate.

**If they ask more:**
The Agent Card is JSON format, always at `/.well-known/agent-card.json` (standard location). It includes:
- `protocolVersion`: Which A2A version
- `name`: Agent identity
- `description`: Human-readable explanation
- `skills`: Array of capabilities with input/output schemas

The client can read this card automatically and know exactly how to call the agent.

**Diagram:** Show Diagram #6 (Agent Card Structure)

**Code example if requested:**
```typescript
// src/agents/weather-agent/agent-card.ts
export const weatherAgentCard: AgentCard = {
  protocolVersion: "0.1.0",
  name: "Weather Agent",
  description: "Provides weather forecasts using OpenWeatherMap",
  skills: [{
    name: "get_weather",
    description: "Get weather forecast for a city",
    input: {
      type: "object",
      properties: {
        city: { type: "string" },
        days: { type: "number" }
      }
    }
  }]
};
```

---

### Q6: What is SSE and why use it?

**Simple Answer:**
SSE means "Server-Sent Events". It lets the server send updates to the client in real-time.

Why use it? Two reasons:
1. **Better user experience**: Users see progress, not just waiting
2. **Keep connection alive**: For long tasks, the connection stays open

In our demo, when you saw messages appearing one by one - that's SSE.

**If they ask more:**
SSE is one-directional (server to client only). The client opens a connection with `Accept: text/event-stream` header. The server sends events like:
```
event: start
data: {"kind": "start"}

event: message
data: {"kind": "message", "text": "Getting weather..."}

event: finished
data: {"kind": "finished"}
```

The connection stays open until `event: finished`. A2A also sends heartbeat events every 15 seconds to prevent timeout.

**Diagram:** Show Diagram #3 (SSE Streaming Sequence)

---

### Q7: What are webhooks in A2A?

**Simple Answer:**
Webhooks are like phone callbacks. Instead of you calling to check "Are you done?", the agent calls you when it finishes.

You give the agent your phone number (webhook URL). The agent calls you when the task is complete.

This is good for long tasks. You don't wait. You do other work. You get a notification when it's done.

**If they ask more:**
When sending a non-blocking request, the client provides:
```typescript
{
  message: { ... },
  configuration: {
    blocking: false,
    pushNotifications: {
      url: "https://my-server.com/webhook/updates"
    }
  }
}
```

The agent returns immediately with `202 Accepted` and a task ID. When the task completes, the agent sends a POST request to the webhook URL with the result.

**Diagram:** Show Diagram #4 (Webhook Notification Flow)

---

### Q8: What's the difference between blocking and non-blocking mode?

**Simple Answer:**
**Blocking mode**: Send request → Wait → Get response
- Like a phone call - you wait on the line
- Use for quick tasks (< 30 seconds)

**Non-blocking mode**: Send request → Get "OK, I'll call you" → Do other work → Get notification
- Like sending a text message
- Use for slow tasks (> 30 seconds)

**If they ask more:**
Blocking mode:
- Client sends request with `blocking: true`
- Client waits for complete response
- Server must respond before timeout (usually 2 minutes)
- Response is the final result

Non-blocking mode:
- Client sends request with `blocking: false` + webhook URL
- Server responds immediately with `202 Accepted` + task ID
- Client can do other work
- Server sends webhook notification when done
- Client can also poll `/v1/tasks/{taskId}` to check status

Our demo uses blocking mode because all tasks finish quickly (5-10 seconds).

**Diagram:** Show Diagram #5 (Blocking vs Non-Blocking Comparison)

---

### Q9: What are message parts?

**Simple Answer:**
Message parts are different types of content in a message. Like email attachments - you can send text, images, files, etc.

Types of parts:
- **Text**: Normal text
- **Data**: Structured information (JSON)
- **Image**: Pictures
- **File**: Documents (PDF, CSV, etc.)
- **Error**: Error information

One message can have multiple parts.

**If they ask more:**
Each message has a `parts` array:
```typescript
{
  kind: "message",
  role: "agent",
  parts: [
    { kind: "text", text: "Here is the weather:" },
    { kind: "data", data: { temp: 25, city: "Paris" } },
    { kind: "image", image: { url: "https://..." } }
  ]
}
```

This allows agents to send rich responses. The client can process each part differently.

**Diagram:** Show Diagram #9 (Message Parts Types)

---

### Q10: What is agent discovery?

**Simple Answer:**
Discovery is how agents find each other. Before talking, agents need to know:
- Where is the other agent? (URL)
- What can it do? (Skills)
- How to talk to it? (Protocol version)

The process:
1. Client knows agent URL (example: `http://localhost:4000`)
2. Client requests `http://localhost:4000/.well-known/agent-card.json`
3. Agent sends its card
4. Client reads the card and knows how to communicate

**If they ask more:**
Discovery happens automatically when using `A2AClient.fromCardUrl()`:
```typescript
const client = await A2AClient.fromCardUrl("http://localhost:4000");
```

This method:
1. Fetches the agent card
2. Validates protocol version compatibility
3. Parses skills
4. Creates a client ready to communicate

Without discovery, you would need to hard-code the agent's capabilities in your code.

**Diagram:** Show Diagram #1 (Agent Discovery Flow)

---

### Q11: Can agents talk directly to each other without a central coordinator?

**Simple Answer:**
Yes! Agents can talk directly to each other. In our demo, we have one coordinator (Travel Planner), but this is a design choice, not a requirement.

You could have:
- **Star pattern**: One coordinator + many workers (our demo)
- **Chain pattern**: Agent A → Agent B → Agent C
- **Mesh pattern**: All agents talk to all agents

A2A supports all patterns.

**If they ask more:**
The only requirement is that each agent can act as both client and server. In our project:
- Travel Planner = Server (for demo client) + Client (for other agents)
- Weather Agent = Only server (doesn't call other agents)

But you could make Weather Agent call another agent if needed. A2A doesn't restrict this.

**Diagram:** You can draw patterns on whiteboard

---

### Q12: What is protocol versioning and why does it matter?

**Simple Answer:**
Protocol versioning tells you which version of A2A the agent uses. Currently, the version is "0.1.0".

Why it matters: In the future, A2A might change. New features might be added. Version numbers help agents check if they're compatible.

If two agents have different versions, they know they might not understand each other.

**If they ask more:**
Every Agent Card includes `protocolVersion: "0.1.0"`. When connecting, the client checks:
- Do I support this version?
- Is the agent using a compatible version?

If incompatible, the client shows an error: "Cannot connect to agent - protocol version mismatch".

This is similar to HTTP/1.1 vs HTTP/2 - different versions, different capabilities.

**Diagram:** None needed

---

### Q13: What is the A2A SDK?

**Simple Answer:**
The SDK (Software Development Kit) is a library that helps you build A2A agents. Instead of writing all the A2A logic yourself, you use the SDK.

The SDK provides:
- **For servers**: `A2AExpressApp` - easily create an agent server
- **For clients**: `A2AClient` - easily call other agents

Think of it like a toolbox. The tools are ready - you just use them.

**If they ask more:**
We use `@a2a-js/sdk` (the JavaScript SDK). There might be SDKs for other languages in the future (Python, Java, etc.).

The SDK handles:
- Agent Card serving
- Message parsing
- SSE streaming setup
- Webhook management
- Error handling
- Protocol validation

Without the SDK, you would need to implement all of this manually.

**Diagram:** None needed

**Code example if requested:**
```typescript
// Using SDK to create server
import { createA2AExpressApp } from "@a2a-js/sdk";

const app = createA2AExpressApp(
  agentCard,
  () => new MyExecutor()
);

app.listen(4000);
```

---

### Q14: Is A2A only for AI agents, or can regular programs use it?

**Simple Answer:**
A2A is designed for AI agents, but any program can use it!

The only requirement: The program must implement the A2A protocol (Agent Card + /v1/messages endpoint).

In our project, the Weather Agent doesn't use AI - it just calls an API and returns data. But it still works with A2A!

**If they ask more:**
A2A is useful for AI agents because they often need:
- Natural language communication
- Multi-step reasoning
- Coordination with other agents
- Streaming updates

But you could create a simple A2A agent that just does basic tasks (like a calculator or database query). The protocol doesn't require AI.

Think of A2A like HTTP - it's just a communication standard. What you do with it is up to you.

**Diagram:** None needed

---

### Q15: What happens if an agent fails or crashes?

**Simple Answer:**
If an agent fails, it should send back an error message. The error message is just a special message part (kind: "error").

If the agent crashes completely (server down), the client will get a network error. The client should handle this and show a friendly error to the user.

In our demo, if the Weather Agent is down, the Travel Planner will fail and tell the client "Cannot contact Weather Agent".

**If they ask more:**
Error handling has several layers:

**Layer 1: Expected errors** (agent handles)
```typescript
eventBus.publish({
  kind: "message",
  parts: [{
    kind: "error",
    error: {
      message: "City not found",
      code: "NOT_FOUND"
    }
  }]
});
```

**Layer 2: Unexpected errors** (SDK handles)
If the executor throws an exception, the SDK catches it and returns HTTP 500.

**Layer 3: Network errors** (client handles)
If the agent is unreachable, the client gets a connection error and should retry or fail gracefully.

**Best practice**: Always check agent availability before orchestrating. In production, you might ping agents before starting.

**Diagram:** Show Diagram #10 (Error Handling Flow)

---

## Technical Details

### Q16: How does SSE streaming work technically?

**Simple Answer:**
SSE uses a special HTTP response type. Instead of sending one response and closing, the server keeps the connection open and sends multiple messages.

The client sends: `Accept: text/event-stream`
The server responds: `Content-Type: text/event-stream`

Then the server can send messages like:
```
event: message
data: {"text": "Working..."}

event: message
data: {"text": "Done!"}
```

**If they ask more:**
SSE is built into browsers and HTTP libraries. The format is:
```
event: <event-name>
data: <json-data>

```
(blank line separates events)

In A2A, we use these event types:
- `start`: Task started
- `message`: Update message
- `task_created`: Task was created
- `task_updated`: Task status changed
- `finished`: Task complete
- `heartbeat`: Keep-alive ping

The SDK handles all of this automatically. You just call `eventBus.publish()` and the SDK converts it to SSE format.

**Diagram:** Show Diagram #3 (SSE Streaming Sequence) again

**Code example if requested:**
```typescript
// In executor
async execute(context: RequestContext, eventBus: ExecutionEventBus) {
  // SDK converts this to SSE automatically
  eventBus.publish({
    kind: "message",
    role: "agent",
    parts: [{ kind: "text", text: "Working..." }]
  });

  // Do work...

  eventBus.publish({
    kind: "message",
    role: "agent",
    parts: [{ kind: "text", text: "Done!" }]
  });

  eventBus.finished();
}
```

---

### Q17: How do you secure A2A communication?

**Simple Answer:**
Our demo doesn't use security (it's local only). But in production, you should:
1. Use HTTPS (not HTTP)
2. Add authentication (API keys or tokens)
3. Validate all inputs
4. Use rate limiting

**If they ask more:**
Security options:

**Option 1: API Keys**
Client includes API key in headers:
```
Authorization: Bearer sk-xxx...
```

**Option 2: OAuth 2.0**
Client gets token, includes in requests

**Option 3: Mutual TLS**
Both client and server verify certificates

**Option 4: Signed requests**
Client signs requests with private key

The A2A protocol doesn't mandate a specific security method. You choose based on your needs.

**Best practices**:
- Always use HTTPS in production
- Validate Agent Card authenticity (check domain, certificate)
- Rate limit requests (prevent abuse)
- Log all agent communications
- Use webhook secret validation (verify webhook sender)

**Diagram:** None needed

---

### Q18: What's the maximum message size?

**Simple Answer:**
The A2A protocol doesn't specify a maximum size. It depends on your server configuration.

In our demo, we use default Express limits (100kb for JSON). For larger data, you should:
1. Increase server limits
2. Or stream data in chunks
3. Or send file references instead of file content

**If they ask more:**
For large responses:

**Option 1**: Stream data using multiple messages
```typescript
// Send partial results
eventBus.publish({ kind: "message", parts: [{ text: "Part 1..." }] });
eventBus.publish({ kind: "message", parts: [{ text: "Part 2..." }] });
```

**Option 2**: Send file URL instead of content
```typescript
{
  kind: "file",
  file: {
    url: "https://storage.example.com/large-report.pdf",
    name: "report.pdf"
  }
}
```

**Option 3**: Use compression
Enable gzip compression on your server.

Our demo doesn't need this because responses are small (few KB).

**Diagram:** None needed

---

### Q19: Can you cancel a task in progress?

**Simple Answer:**
Yes! The executor has a `cancelTask()` method. If the client cancels, the agent should stop working.

In practice, this is hard to implement perfectly. Some work might complete before cancellation happens.

Our demo doesn't implement cancellation because tasks are quick (5-10 seconds).

**If they ask more:**
The AgentExecutor interface includes:
```typescript
interface AgentExecutor {
  execute(context, eventBus): Promise<void>;
  cancelTask(): Promise<void>;  // ← Cancellation method
}
```

When implementing:
```typescript
class MyExecutor implements AgentExecutor {
  private cancelled = false;

  async execute(context, eventBus) {
    for (let step of steps) {
      if (this.cancelled) break;  // Check cancellation
      await doStep(step);
    }
  }

  async cancelTask() {
    this.cancelled = true;  // Set flag
  }
}
```

The challenge: What if you're in the middle of an API call? You can't cancel external API calls easily. Best effort cancellation is usually enough.

**Diagram:** None needed

---

### Q20: How does heartbeat work in SSE?

**Simple Answer:**
Heartbeat is a "keep-alive" message. Every 15 seconds, the agent sends:
```
event: heartbeat
data: {"timestamp": "2024-..."}
```

This tells the client "I'm still here, still working". It also prevents the connection from timing out.

**If they ask more:**
Without heartbeat:
- Long tasks (> 60 seconds) might cause timeout
- Network middleboxes might close "idle" connections
- Client doesn't know if agent crashed or is still working

With heartbeat:
- Connection stays alive
- Client knows agent is working
- Timeouts are prevented

The SDK handles heartbeat automatically. You don't need to implement it. The A2A Express app sends heartbeats every 15 seconds during streaming.

**Diagram:** Show Diagram #13 (Heartbeat Mechanism)

---

### Q21: What happens if webhook fails?

**Simple Answer:**
If the agent can't reach the webhook URL, it should retry a few times. After several failures, it should give up and mark the task as failed.

Our demo doesn't use webhooks, so we didn't implement this. But in production, you need retry logic.

**If they ask more:**
Webhook retry strategy:
1. Send webhook POST request
2. If it fails (network error, 5xx response), wait and retry
3. Retry 3-5 times with exponential backoff (1s, 2s, 4s, 8s, 16s)
4. If all retries fail, mark task as failed

Also implement:
- **Webhook signature**: Sign the webhook payload so client can verify it's from your agent
- **Idempotency**: Send task ID so client can deduplicate if webhook arrives twice
- **Timeout**: Don't wait forever for webhook response (5 seconds max)

Example retry code:
```typescript
async function sendWebhook(url: string, data: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await fetch(url, { method: "POST", body: JSON.stringify(data) });
      return;  // Success
    } catch (error) {
      if (i < retries - 1) {
        await sleep(Math.pow(2, i) * 1000);  // Exponential backoff
      }
    }
  }
  throw new Error("Webhook failed after retries");
}
```

**Diagram:** None needed

---

### Q22: Can you have nested orchestration (orchestrator calling another orchestrator)?

**Simple Answer:**
Yes! An orchestrator is just an agent. It can call another orchestrator.

Example:
- Client → Travel Planner
- Travel Planner → Trip Optimizer (another orchestrator)
- Trip Optimizer → Multiple agents

This is supported by A2A. Each agent doesn't know if it's talking to an end client or another agent.

**If they ask more:**
This creates a hierarchy:

```
Client
  └── Travel Planner (Orchestrator 1)
       ├── Weather Agent
       ├── Trip Optimizer (Orchestrator 2)
       │    ├── Hotel Agent
       │    ├── Flight Agent
       │    └── Restaurant Agent
       └── Translator Agent
```

Each orchestrator:
- Receives A2A request
- Calls multiple child agents (also via A2A)
- Combines results
- Returns A2A response

The only limitation is depth - too many levels might slow things down. Keep it simple (2-3 levels max).

**Diagram:** You can draw hierarchy on whiteboard

---

### Q23: How do you handle rate limiting?

**Simple Answer:**
Rate limiting protects your agent from too many requests. You can limit:
- Requests per minute per client
- Total concurrent requests
- CPU/memory usage

Our demo has no rate limiting (it's local only). In production, add rate limiting middleware.

**If they ask more:**
Implementation options:

**Option 1**: Use Express middleware
```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100  // 100 requests per minute
});

app.use(limiter);
```

**Option 2**: Track by API key
```typescript
const limits = new Map();  // apiKey → request count

function checkRateLimit(apiKey: string) {
  const count = limits.get(apiKey) || 0;
  if (count > 100) throw new Error("Rate limit exceeded");
  limits.set(apiKey, count + 1);
}
```

**Option 3**: Use external service (Redis)
Store request counts in Redis with TTL.

When rate limit is exceeded:
- Return HTTP 429 (Too Many Requests)
- Include `Retry-After` header
- Send error message via A2A

**Diagram:** None needed

---

### Q24: What database do you use for agent state?

**Simple Answer:**
Our agents are stateless - they don't save any data between requests. Each request is independent.

If you need state (like conversation history), you can:
- Use a database (PostgreSQL, MongoDB, etc.)
- Use in-memory cache (Redis)
- Save to files

**If they ask more:**
Stateless vs Stateful agents:

**Stateless** (our demo):
- Each request is independent
- No memory of previous requests
- Simpler to implement
- Easier to scale (no shared state)

**Stateful** (if needed):
- Remember conversation history
- Track user preferences
- Maintain context across requests

Example stateful agent:
```typescript
class StatefulExecutor implements AgentExecutor {
  constructor(private db: Database) {}

  async execute(context, eventBus) {
    const userId = context.metadata.userId;

    // Load history
    const history = await this.db.getHistory(userId);

    // Process with history context
    const result = await processWithContext(context.message, history);

    // Save new interaction
    await this.db.saveHistory(userId, context.message, result);

    eventBus.publish(result);
    eventBus.finished();
  }
}
```

For our travel demo, we don't need state because each trip planning is independent.

**Diagram:** None needed

---

### Q25: How do you test A2A agents?

**Simple Answer:**
Three types of tests:

1. **Unit tests**: Test executor logic separately
2. **Integration tests**: Test full agent (with server)
3. **End-to-end tests**: Test multiple agents together

Our demo doesn't include tests yet, but here's how you would do it.

**If they ask more:**

**Unit test example**:
```typescript
describe("WeatherExecutor", () => {
  it("should return weather data", async () => {
    const executor = new WeatherExecutor();
    const context = { message: { city: "Paris" } };
    const eventBus = new MockEventBus();

    await executor.execute(context, eventBus);

    expect(eventBus.messages).toContain("Weather in Paris");
  });
});
```

**Integration test example**:
```typescript
describe("Weather Agent Server", () => {
  it("should respond to /v1/messages", async () => {
    const response = await fetch("http://localhost:4000/v1/messages", {
      method: "POST",
      body: JSON.stringify({ message: { city: "Paris" } })
    });

    expect(response.status).toBe(200);
  });
});
```

**E2E test example**:
```typescript
describe("Full Travel Demo", () => {
  it("should create complete itinerary", async () => {
    const client = await A2AClient.fromCardUrl("http://localhost:4002");
    const response = await client.sendMessage({
      message: { destination: "Paris", days: 3 }
    });

    expect(response.result.parts[0].text).toContain("Day 1");
  });
});
```

**Best practice**: Mock external APIs in tests (don't call real OpenWeatherMap API in tests).

**Diagram:** None needed

---

### Q26: Can you send binary data (images, files)?

**Simple Answer:**
Yes! Use the "image" or "file" message part types.

You can either:
1. Send base64-encoded data inline
2. Send a URL to the file

Sending URLs is better for large files (saves bandwidth).

**If they ask more:**

**Option 1: Base64 inline** (for small files)
```typescript
{
  kind: "image",
  image: {
    data: "data:image/png;base64,iVBORw0KGgo...",
    name: "photo.png"
  }
}
```

**Option 2: URL reference** (for large files)
```typescript
{
  kind: "file",
  file: {
    url: "https://storage.example.com/report.pdf",
    name: "report.pdf",
    mimeType: "application/pdf"
  }
}
```

For very large files, use URLs. The client downloads the file separately.

Our demo doesn't send binary data - only text and JSON. But A2A supports it.

**Diagram:** None needed

---

### Q27: What's the performance of A2A compared to direct REST calls?

**Simple Answer:**
A2A adds a small overhead (because of Agent Card lookup and message format). But the overhead is tiny (< 50ms).

For most use cases, performance is not an issue. The benefits (standard protocol, discoverability, streaming) are worth the small overhead.

**If they ask more:**
Performance breakdown:

**First call** (includes discovery):
1. Fetch Agent Card: ~20ms
2. Parse Agent Card: ~5ms
3. Send message: same as REST
4. Total overhead: ~25ms

**Subsequent calls** (card cached):
1. Send message: same as REST
2. Total overhead: ~5ms (just message format)

For comparison:
- A2A message: ~5ms overhead
- Direct REST call: 0ms overhead
- Network latency: 10-100ms (dominates)

So A2A overhead is < 10% of total request time. Not noticeable.

**When performance matters**:
- If you need < 10ms response: Use direct function calls, not agents
- If you need < 100ms response: A2A is fine
- If you need high throughput: Consider HTTP/2 or WebSockets

Our demo completes in 5-10 seconds (mostly API calls), so A2A overhead is negligible.

**Diagram:** None needed

---

### Q28: Can agents maintain conversation history?

**Simple Answer:**
Yes, but you need to implement it yourself. A2A doesn't provide built-in conversation history.

You would:
1. Store messages in a database
2. Include previous messages in context
3. Send conversation ID with each request

**If they ask more:**
Implementation approach:

**Client side**:
```typescript
const conversationId = "conv-123";

// First message
await client.sendMessage({
  message: { text: "Hello" },
  metadata: { conversationId }
});

// Second message (includes context)
await client.sendMessage({
  message: { text: "What's the weather?" },
  metadata: { conversationId }
});
```

**Agent side**:
```typescript
async execute(context, eventBus) {
  const convId = context.metadata.conversationId;

  // Load history
  const history = await db.getConversation(convId);

  // Process with history
  const result = await processWithHistory(context.message, history);

  // Save new message
  await db.saveMessage(convId, context.message, result);

  eventBus.publish(result);
  eventBus.finished();
}
```

For our travel demo, we don't need conversation history because each trip planning is a single request.

If you were building a chatbot, you would need this.

**Diagram:** None needed

---

### Q29: How do you deploy A2A agents?

**Simple Answer:**
Deploy like any Node.js application:
1. Build the project: `npm run build`
2. Deploy to server (AWS, Azure, Google Cloud, etc.)
3. Run with: `node dist/agents/weather-agent/server.js`
4. Make sure it's accessible via HTTPS

Each agent can run on a different server.

**If they ask more:**
Deployment options:

**Option 1: Traditional server**
- Deploy to VPS (DigitalOcean, Linode, etc.)
- Use PM2 or systemd to keep it running
- Use nginx as reverse proxy
- Use SSL certificate (Let's Encrypt)

**Option 2: Docker container**
```dockerfile
FROM node:18
COPY . /app
WORKDIR /app
RUN npm install && npm run build
CMD ["node", "dist/agents/weather-agent/server.js"]
```

Deploy to:
- AWS ECS
- Google Cloud Run
- Azure Container Instances

**Option 3: Serverless** (harder)
A2A agents need to stay running (for SSE). Serverless functions timeout quickly. You would need workarounds.

**Best practice**:
- Use environment variables for config
- Use health check endpoint (`/health`)
- Use logging (Winston, Pino)
- Use monitoring (Prometheus, Datadog)

**Diagram:** None needed

---

### Q30: What about authentication between agents?

**Simple Answer:**
Our demo has no authentication (it's local only). In production, you should add:

- API keys (each agent has a key)
- Tokens (JWT or similar)
- Mutual TLS (certificates)

Choose based on your security needs.

**If they ask more:**
Authentication patterns:

**Pattern 1: API Keys**
```typescript
// Client includes key
const client = await A2AClient.fromCardUrl(url, {
  headers: { "Authorization": "Bearer sk-xxx..." }
});

// Server validates key
app.use((req, res, next) => {
  const key = req.headers.authorization;
  if (!isValidKey(key)) return res.status(401).send("Unauthorized");
  next();
});
```

**Pattern 2: OAuth 2.0**
- Client gets token from auth server
- Client includes token in requests
- Agent validates token

**Pattern 3: Mutual TLS**
- Both client and server have certificates
- TLS handshake verifies both sides
- No application-level authentication needed

**Best practice**: Use different keys for different agents. If one key leaks, others are still safe.

**Diagram:** None needed

---

## Architecture & Design

### Q31: Why did you choose this 5-agent architecture?

**Simple Answer:**
We wanted to show different types of agents:
- **Weather**: Simple API wrapper
- **Translator**: AI-powered (Gemini)
- **Web Search**: Search API wrapper
- **Calculator**: Tool-based (MCP)
- **Travel Planner**: Orchestrator

This covers the main patterns. In a real project, you might have more or fewer agents.

**If they ask more:**
Design decisions:

**Why 5 agents?**
- Enough to show orchestration
- Not too many (complexity)
- Each has clear purpose

**Why these specific agents?**
- Weather: Everyone understands weather
- Translator: Shows AI integration
- Web Search: Shows external data
- Calculator: Shows MCP integration
- Travel Planner: Shows orchestration

**Alternative architectures**:
- Fewer agents (3-4): Simpler, but less interesting
- More agents (7-10): More realistic, but harder to demo
- Different domains: Could be e-commerce, healthcare, etc.

The goal is educational - show A2A capabilities, not build production system.

**Diagram:** Show Diagram #16 (System Overview) again

---

### Q32: Why use a separate agent for each function? Why not one big agent?

**Simple Answer:**
Separation of concerns! Benefits:

1. **Reusability**: Weather Agent can work with any project
2. **Maintainability**: Each agent is simple and focused
3. **Scalability**: Run agents on different servers
4. **Testability**: Test each agent separately
5. **Team work**: Different teams can own different agents

One big agent would be harder to maintain and scale.

**If they ask more:**
Compare approaches:

**Approach 1: Monolithic** (one agent does everything)
```
Travel Agent
  ├── Weather logic
  ├── Translation logic
  ├── Search logic
  ├── Calculator logic
  └── Planning logic
```
❌ Hard to maintain
❌ Can't reuse parts
❌ All-or-nothing deployment
❌ Single point of failure

**Approach 2: Microservices** (our approach)
```
Travel Planner → coordinates
Weather Agent → independent
Translator Agent → independent
Web Search Agent → independent
Calculator Agent → independent
```
✅ Easy to maintain
✅ Reusable components
✅ Deploy independently
✅ Resilient (one failure doesn't kill everything)

This is the "microservices" pattern applied to AI agents.

**Diagram:** None needed

---

### Q33: What's the three-file pattern and why use it?

**Simple Answer:**
Every agent has 3 files:
1. **agent-card.ts**: Who am I? (metadata)
2. **executor.ts**: What do I do? (business logic)
3. **server.ts**: How do I start? (server setup)

Why? Because it's consistent. All agents follow the same pattern. Easy to understand and maintain.

**If they ask more:**
Benefits of this pattern:

**Benefit 1: Separation of concerns**
- Card: Describes agent (pure data)
- Executor: Implements logic (pure functions)
- Server: Handles HTTP (infrastructure)

**Benefit 2: Testability**
- Test executor without server
- Test server without executor
- Test card parsing separately

**Benefit 3: Consistency**
- New developer joins? Easy to understand
- Want to add agent? Copy the pattern
- All agents look the same

**Benefit 4: Flexibility**
- Want to change server framework? Only modify server.ts
- Want to change business logic? Only modify executor.ts
- Want to change skills? Only modify agent-card.ts

This pattern is from the A2A SDK documentation (best practice).

**Diagram:** Show Diagram #20 (Three-File Agent Pattern)

---

### Q34: How do you decide what should be an agent vs what should be a function?

**Simple Answer:**
Make something an agent if:
- ✅ It's a standalone capability
- ✅ Other projects might want to use it
- ✅ It involves I/O (API calls, database, etc.)
- ✅ It's complex enough to justify separation

Make it a function if:
- ✅ It's simple logic (< 50 lines)
- ✅ It's specific to one agent
- ✅ It doesn't need external resources

**If they ask more:**
Decision tree:

**Question 1**: Does it call external services (APIs, databases)?
- Yes → Probably an agent
- No → Might be a function

**Question 2**: Could other projects reuse it?
- Yes → Make it an agent
- No → Might be a function

**Question 3**: Is it more than 100 lines of code?
- Yes → Consider making it an agent
- No → Probably a function

**Question 4**: Does it have its own domain logic?
- Yes → Make it an agent
- No → Make it a function

Examples:
- Weather forecast → Agent (external API, reusable)
- Temperature conversion → Function (simple logic)
- Translation → Agent (AI, reusable)
- String formatting → Function (simple)

**Diagram:** None needed

---

### Q35: Can you add a new agent without changing existing agents?

**Simple Answer:**
Yes! That's one of the best features. To add a new agent:
1. Create new directory: `src/agents/my-agent/`
2. Create 3 files (card, executor, server)
3. Start the agent
4. Other agents can call it

No changes to existing agents needed!

**If they ask more:**
Example: Add a "Hotel Booking Agent"

**Step 1**: Create structure
```
src/agents/hotel-agent/
  ├── agent-card.ts    // Define skills
  ├── executor.ts      // Implement booking logic
  └── server.ts        // Start on port 4005
```

**Step 2**: Implement agent (copy pattern from existing agent)

**Step 3**: Start it
```bash
node dist/agents/hotel-agent/server.js
```

**Step 4**: Use it
```typescript
// In Travel Planner
const hotelClient = await A2AClient.fromCardUrl("http://localhost:4005");
const hotels = await hotelClient.sendMessage({ city: "Paris" });
```

Done! No changes to Weather Agent, Translator Agent, etc. They don't even know the Hotel Agent exists.

This is the power of loose coupling.

**Diagram:** None needed

---

### Q36: Why use TypeScript instead of JavaScript?

**Simple Answer:**
TypeScript adds type safety. Benefits:
- ✅ Catch errors before running code
- ✅ Better IDE autocomplete
- ✅ Self-documenting code (types show what's expected)
- ✅ Easier to refactor

The A2A SDK is written in TypeScript, so using TypeScript gives us better integration.

**If they ask more:**
Example of type safety:

**JavaScript** (no types):
```javascript
function getWeather(city) {
  // Is city a string? number? object? Who knows!
  return fetch(`/api/weather?city=${city}`);
}

getWeather(123);  // Oops! But JavaScript doesn't complain
```

**TypeScript** (with types):
```typescript
function getWeather(city: string): Promise<Weather> {
  return fetch(`/api/weather?city=${city}`);
}

getWeather(123);  // ❌ Error: Argument of type 'number' not assignable to 'string'
```

TypeScript catches errors at compile time, not runtime. This saves time and prevents bugs.

For large projects (like multi-agent systems), type safety is very important.

**Diagram:** None needed

---

### Q37: How do you handle agent dependencies (Agent A needs Agent B)?

**Simple Answer:**
In our demo, the Travel Planner depends on 4 other agents. We handle this by:
1. Starting all agents before Travel Planner
2. Checking agent availability before calling them
3. Handling errors if an agent is down

In production, you might use service discovery (like Consul or Kubernetes).

**If they ask more:**
Dependency patterns:

**Pattern 1: Static URLs** (our demo)
```typescript
const WEATHER_URL = "http://localhost:4000";
const weatherClient = await A2AClient.fromCardUrl(WEATHER_URL);
```
✅ Simple
❌ Hard-coded URLs
❌ No automatic failover

**Pattern 2: Service discovery**
```typescript
const WEATHER_URL = await serviceRegistry.find("weather-agent");
const weatherClient = await A2AClient.fromCardUrl(WEATHER_URL);
```
✅ Dynamic URLs
✅ Automatic failover
❌ More complex setup

**Pattern 3: Agent registry**
```typescript
// Agents register themselves on startup
await registry.register("weather-agent", "http://localhost:4000");

// Clients query registry
const url = await registry.resolve("weather-agent");
```

For our demo, static URLs are fine. For production, use service discovery.

**Diagram:** None needed

---

### Q38: What happens if you have circular dependencies (Agent A calls Agent B, Agent B calls Agent A)?

**Simple Answer:**
This creates an infinite loop! You should avoid circular dependencies.

If you need bidirectional communication, use a coordinator agent. The coordinator talks to both Agent A and Agent B.

**If they ask more:**
Example of the problem:

```
Travel Planner calls Hotel Agent: "Find hotels in Paris"
Hotel Agent calls Travel Planner: "What's the weather?" (to filter hotels)
Travel Planner calls Weather Agent: "What's the weather?"
...infinite loop!
```

**Solution 1**: Add timeout
Set maximum depth: "Don't call more than 3 levels deep"

**Solution 2**: Refactor
Extract common logic to new agent:
```
Travel Planner calls Weather Agent
Hotel Agent also calls Weather Agent directly (not through Travel Planner)
```

**Solution 3**: Pass context
Include "call chain" in metadata:
```typescript
{
  metadata: {
    callChain: ["TravelPlanner", "HotelAgent"]
  }
}
```
If an agent sees itself in the chain, refuse to call (prevent loop).

Best practice: Design agents to avoid circular dependencies.

**Diagram:** You can draw on whiteboard

---

### Q39: How do you monitor agent health?

**Simple Answer:**
Add a health check endpoint:
```typescript
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});
```

Then use monitoring tools to check this endpoint every minute. If it fails, send alert.

**If they ask more:**
Health check levels:

**Level 1: Basic** (is server running?)
```typescript
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
```

**Level 2: Dependencies** (are APIs reachable?)
```typescript
app.get("/health", async (req, res) => {
  const weatherApiOk = await checkWeatherAPI();
  const dbOk = await checkDatabase();

  if (weatherApiOk && dbOk) {
    res.json({ status: "ok" });
  } else {
    res.status(503).json({ status: "unhealthy", issues: [...] });
  }
});
```

**Level 3: Metrics** (performance data)
```typescript
app.get("/metrics", (req, res) => {
  res.json({
    requestsPerMinute: 45,
    averageResponseTime: 230,
    errorRate: 0.02
  });
});
```

Use tools like:
- Prometheus (metrics collection)
- Grafana (dashboards)
- PagerDuty (alerts)

**Diagram:** None needed

---

### Q40: What's your agent versioning strategy?

**Simple Answer:**
Our demo has no versioning (it's a prototype). In production, you should version your agents:

- Version the agent itself (v1.0.0, v1.1.0, etc.)
- Version the skills (add/remove/change skills)
- Version the protocol (A2A 0.1.0)

Use semantic versioning (major.minor.patch).

**If they ask more:**
Versioning strategies:

**Strategy 1: URL versioning**
```
http://api.example.com/v1/weather-agent
http://api.example.com/v2/weather-agent
```

**Strategy 2: Agent Card versioning**
```typescript
{
  protocolVersion: "0.1.0",
  agentVersion: "1.2.0",  // ← Agent version
  name: "Weather Agent",
  ...
}
```

**Strategy 3: Skills versioning**
```typescript
skills: [{
  name: "get_weather",
  version: "2.0",  // ← Skill version
  deprecated: false
}]
```

**Best practices**:
- Maintain old versions for 6 months (give clients time to upgrade)
- Mark deprecated skills in Agent Card
- Include migration guide in documentation

For breaking changes (incompatible API changes), increment major version.

**Diagram:** None needed

---

## MCP Questions

### Q41: What is MCP?

**Simple Answer:**
MCP stands for "Model Context Protocol". It's a different protocol from A2A.

- **A2A**: Agents talk to agents (horizontal)
- **MCP**: Agents use tools (vertical)

Think of MCP like giving tools to an agent. The agent can then call these tools to do precise work.

**If they ask more:**
MCP was created by Anthropic (same company as A2A). It's for connecting AI models to external tools and data.

Examples of MCP tools:
- Calculator (add, multiply, etc.)
- File system (read file, write file)
- Database (query, insert)
- API wrapper (call external API)

The AI model can decide which tool to use based on the user's request. This is called "tool calling" or "function calling".

In our project, the Calculator Agent uses MCP to access math tools.

**Diagram:** Show Diagram #24 (A2A + MCP Combination)

---

### Q42: Why combine A2A and MCP?

**Simple Answer:**
They solve different problems:
- **A2A** = Agents communicate with each other
- **MCP** = Agents use tools

Together, you get agents that can:
- Talk to other agents (A2A)
- Use precise tools (MCP)

Example: Calculator Agent receives A2A request "What's the budget?", uses MCP math tools to calculate, sends A2A response back.

**If they ask more:**
The combination gives you best of both:

**A2A alone**:
- Agents can communicate ✅
- But AI might make calculation mistakes ❌

**MCP alone**:
- Agents can use tools ✅
- But agents can't talk to each other ❌

**A2A + MCP together**:
- Agents can communicate ✅
- Agents can use precise tools ✅
- Full power! ✅

In our project:
- Travel Planner talks to Calculator Agent (A2A)
- Calculator Agent uses math tools (MCP)
- Calculator Agent responds to Travel Planner (A2A)

This is the future of multi-agent systems: combining protocols.

**Diagram:** Show Diagram #24 (A2A + MCP Combination) again

---

### Q43: What's the difference between calling an agent (A2A) and calling a tool (MCP)?

**Simple Answer:**
**Calling an agent (A2A)**:
- Conversational ("Agent, help me with X")
- Agent decides how to do it
- Can be complex task
- Might take time

**Calling a tool (MCP)**:
- Functional ("Tool, multiply 5 by 3")
- Tool just does exactly what you ask
- Simple, specific task
- Fast

**If they ask more:**
Detailed comparison:

| Aspect | A2A (Agent) | MCP (Tool) |
|--------|-------------|------------|
| **Purpose** | Solve problems | Execute functions |
| **Intelligence** | Has AI reasoning | No reasoning |
| **Input** | Natural language | Structured parameters |
| **Output** | Rich response | Precise result |
| **Examples** | "Plan a trip" | "Calculate 5 * 3" |
| **Speed** | Slower (AI thinking) | Fast (direct execution) |
| **Complexity** | Can handle complex tasks | Only simple tasks |

When to use which:
- Use A2A when you need reasoning or complex task
- Use MCP when you need precise, fast execution

Example in our project:
- "Translate this to French" → A2A (needs AI)
- "Calculate 3 × 100 + 9 × 20" → MCP (precise math)

**Diagram:** Show Diagram #26 (Horizontal vs Vertical Protocols)

---

### Q44: Can you show me the MCP integration in the Calculator Agent?

**Simple Answer:**
The Calculator Agent:
1. Receives A2A request: "Calculate trip budget"
2. Uses LangChain + LangGraph to process request
3. LangGraph calls MCP tools (add, multiply, calculate_trip_budget)
4. MCP tools return precise results
5. Agent sends A2A response back

**If they ask more:**
Show code if requested.

**Show: src/agents/calculator-agent/executor.ts (lines 60-85)**

Key parts:

**1. Load MCP tools**:
```typescript
const tools = await loadMcpTools("custom-math", mcpClient);
// Returns: [add, multiply, calculate_trip_budget]
```

**2. Create LangGraph agent**:
```typescript
this.agent = createReactAgent({
  llm: this.model,  // Gemini AI
  tools  // MCP tools
});
```

**3. Agent decides which tool to use**:
```typescript
const result = await agent.invoke({
  messages: [{ role: "user", content: request }]
});
```

The agent (using ReAct pattern) thinks: "To calculate trip budget, I need the calculate_trip_budget tool". Then it calls the tool with the right parameters.

This combination of LangChain + LangGraph + MCP gives us an intelligent calculator.

**Diagram:** Show Diagram #25 (Calculator Agent with MCP)

---

### Q45: Do all agents use MCP?

**Simple Answer:**
No! Only the Calculator Agent uses MCP in our demo.

- Weather Agent: No MCP (just API call)
- Translator Agent: No MCP (just AI)
- Web Search Agent: Uses MCP (has Brave Search tool)
- Calculator Agent: Uses MCP (has math tools)
- Travel Planner: No MCP (just orchestration)

MCP is optional. Use it only when you need tools.

**If they ask more:**
When to use MCP:

**Use MCP when**:
- You need precise calculations (math)
- You need file system access (read/write files)
- You need database access (queries)
- You need API wrappers (structured calls)

**Don't use MCP when**:
- Simple API call is enough
- No need for AI to decide which tool
- Task is straightforward

In our project:
- Weather: Just calls OpenWeatherMap API (no MCP needed)
- Calculator: Needs to choose between add/multiply/budget (MCP helps)

MCP adds complexity. Only use it when the benefit is worth it.

**Diagram:** Show Diagram #16 (System Overview) - point out which agents use MCP

---

## Business Value

### Q46: What are the benefits of using A2A?

**Simple Answer:**
Main benefits:

1. **Standardization**: All agents speak the same language
2. **Reusability**: Build once, use anywhere
3. **Scalability**: Easy to add new agents
4. **Maintainability**: Each agent is simple and focused
5. **Collaboration**: Different teams can build different agents

**If they ask more:**
Detailed benefits:

**Benefit 1: Standardization**
Without A2A: Every integration is different (10 agents = 45 integrations!)
With A2A: One protocol for all (10 agents = learn once, use everywhere)

**Benefit 2: Reusability**
Weather Agent can work with:
- Travel planning system
- Agriculture system
- Event planning system
- Any system that needs weather

**Benefit 3: Scalability**
Adding new agent: Just 3 files, start server, done!
No changes to existing agents needed.

**Benefit 4: Maintainability**
Each agent is small (< 200 lines)
Easy to understand, easy to fix, easy to test

**Benefit 5: Collaboration**
Team A builds Weather Agent
Team B builds Translator Agent
Team C builds Travel Planner
All work together seamlessly (because they use A2A)

**Business impact**:
- Faster development (reuse agents)
- Lower maintenance cost (simpler code)
- Better quality (focused agents)

**Diagram:** None needed

---

### Q47: When should you use A2A vs a monolithic approach?

**Simple Answer:**
Use A2A when:
- ✅ You have multiple distinct capabilities
- ✅ You want to reuse agents across projects
- ✅ You have multiple teams
- ✅ You need to scale parts independently

Use monolithic when:
- ✅ You have a simple application
- ✅ Everything is tightly coupled
- ✅ You have a small team
- ✅ Performance is critical (< 10ms response time)

**If they ask more:**
Decision matrix:

| Factor | A2A | Monolithic |
|--------|-----|------------|
| **Team size** | Multiple teams | Single team |
| **Complexity** | High (many features) | Low (few features) |
| **Reusability** | Need to reuse agents | No reuse needed |
| **Scalability** | Need independent scaling | Simple scaling |
| **Maintenance** | Long-term project | Short-term project |
| **Performance** | OK with 100ms latency | Need < 10ms |

Real-world examples:

**Good fit for A2A**:
- Customer support system (chat, tickets, knowledge base, translation)
- E-commerce platform (search, recommendations, inventory, payment)
- Content management (creation, translation, optimization, analytics)

**Bad fit for A2A**:
- Simple calculator app
- Static website
- Single-purpose tool
- Real-time trading system (needs ultra-low latency)

**Diagram:** None needed

---

### Q48: Is A2A production-ready?

**Simple Answer:**
A2A protocol: Yes, it's stable (version 0.1.0)
Our demo: No, it's a prototype

To make it production-ready, you need:
- Authentication & authorization
- Error handling & retries
- Logging & monitoring
- Rate limiting
- Testing
- Documentation

**If they ask more:**
Production checklist:

**Security**:
- [ ] HTTPS everywhere
- [ ] API key authentication
- [ ] Input validation
- [ ] Rate limiting
- [ ] Webhook signature verification

**Reliability**:
- [ ] Error handling (retry logic)
- [ ] Timeout handling
- [ ] Circuit breakers
- [ ] Health checks
- [ ] Graceful shutdown

**Observability**:
- [ ] Structured logging
- [ ] Metrics collection (Prometheus)
- [ ] Distributed tracing (Jaeger)
- [ ] Alerting (PagerDuty)

**Quality**:
- [ ] Unit tests (> 80% coverage)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Load testing
- [ ] Security scanning

**Operations**:
- [ ] CI/CD pipeline
- [ ] Automated deployment
- [ ] Rollback strategy
- [ ] Documentation
- [ ] Runbooks

Our demo has none of this! It's for learning, not production.

**Diagram:** None needed

---

### Q49: What are the limitations of A2A?

**Simple Answer:**
Limitations:

1. **Performance overhead**: Small latency added (< 50ms)
2. **Network dependency**: Agents must be reachable over network
3. **Complexity**: More moving parts than monolithic
4. **Learning curve**: Team needs to learn A2A
5. **Tooling**: Limited tools/frameworks (protocol is new)

**If they ask more:**
Detailed limitations:

**Limitation 1: Performance**
- A2A adds ~25ms for first call (discovery)
- ~5ms for subsequent calls (message format)
- Not suitable for ultra-low-latency needs (< 10ms)

**Limitation 2: Network**
- Agents communicate over HTTP
- Network failures can break system
- Need retry logic and error handling

**Limitation 3: Debugging**
- Distributed system = harder to debug
- Need distributed tracing to understand flow
- More complex than debugging single process

**Limitation 4: Transactions**
- Hard to do distributed transactions
- If Agent A succeeds but Agent B fails, how to rollback?
- Need saga pattern or similar

**Limitation 5: Maturity**
- A2A is new (2024)
- Limited community resources
- Few examples and best practices

Despite limitations, benefits often outweigh costs for complex systems.

**Diagram:** None needed

---

### Q50: What's the future of A2A?

**Simple Answer:**
A2A is still new (released 2024). Possible future developments:

- More SDKs (Python, Java, Go, etc.)
- Better tooling (debugging, monitoring, testing)
- Agent marketplace (reusable agents)
- Integration with major cloud providers
- New features (streaming improvements, etc.)

Anthropic is actively developing it.

**If they ask more:**
Potential future features:

**Protocol enhancements**:
- Bidirectional streaming (not just server → client)
- Binary protocol option (faster than JSON)
- GraphQL-style queries (request specific fields)
- Agent composition language (declarative orchestration)

**Ecosystem growth**:
- Agent marketplace (download ready-made agents)
- Agent discovery service (find agents by capability)
- Testing frameworks (easier to test agents)
- Development tools (debuggers, profilers)

**Industry adoption**:
- More companies building A2A agents
- Standards for domain-specific agents (e.g., financial agents, healthcare agents)
- Integration with existing platforms (Slack, Teams, etc.)

**Our role**:
We're early adopters! By learning A2A now, we'll have advantage when it becomes mainstream.

**Diagram:** None needed

---

## Demo-Specific Questions

### Q51: Can you run the demo again and explain step by step?

**Simple Answer:**
"Sure! Let me run it again and explain what happens at each step."

**What to do:**
1. Run `npm run dev:demo`
2. Pause at key points
3. Explain what's happening

**What to say:**

[Demo starts]
"We send a request to the Travel Planner: 'Plan a trip to Paris for 3 days'"

[First message appears]
"The Travel Planner receives it and starts working. It decides it needs information from other agents."

[Weather update]
"Here - it's calling the Weather Agent. The Weather Agent contacts OpenWeatherMap API and returns the forecast."

[Web Search update]
"Now it's calling Web Search Agent to find tourist attractions in Paris."

[Calculator update]
"Now the Calculator Agent is calculating the budget. It uses MCP math tools for precision."

[Translator update]
"And the Translator is converting some information to French using Gemini AI."

[Final result]
"Finally, the Travel Planner has all the information. It uses Gemini AI to write a nice itinerary. Look - it includes weather, attractions, budget, and some French phrases!"

[Demo done]
"All of this communication used the A2A protocol. Five agents worked together seamlessly."

**Diagram:** Show Diagram #18 (Complete Demo Flow) while explaining

---

### Q52: What happens if one agent fails during the demo?

**Simple Answer:**
"Good question! Let me show you."

**What to do:**
1. Stop one agent (e.g., Weather Agent)
2. Run demo again
3. Show the error

**What to say:**

"I'm going to stop the Weather Agent and run the demo again."

[Stop Weather Agent]
```bash
# In Weather Agent terminal, press Ctrl+C
```

[Run demo]
"Watch what happens..."

[Demo fails]
"You see? The Travel Planner tried to contact the Weather Agent, but it couldn't reach it. So it returns an error."

[Show error message]
"The error message says: 'Cannot contact Weather Agent'. The client sees this and knows what went wrong."

"In production, you would handle this better:
- Retry the request a few times
- Use cached data if available
- Continue without weather info
- Send alert to ops team"

[Restart Weather Agent]
"Let me restart the Weather Agent... OK, now let's try again..."

[Demo works]
"Now it works! All agents are healthy again."

**Diagram:** Show Diagram #10 (Error Handling Flow)

---

### Q53: How long does a typical request take?

**Simple Answer:**
Our demo takes about 5-10 seconds for a complete travel plan. This includes:
- Agent communication (< 1 second)
- External API calls (2-3 seconds)
- AI processing (2-5 seconds)

Most of the time is spent on external APIs and AI, not on A2A protocol.

**If they ask more:**
Breakdown (approximate):

```
Total time: ~7 seconds

Travel Planner receives request: 0.1s
├── Call Weather Agent: 1.5s
│   ├── A2A communication: 0.1s
│   └── OpenWeatherMap API: 1.4s
├── Call Web Search Agent: 2.0s
│   ├── A2A communication: 0.1s
│   └── Brave Search API: 1.9s
├── Call Calculator Agent: 0.8s
│   ├── A2A communication: 0.1s
│   └── MCP + LangGraph: 0.7s
├── Call Translator Agent: 1.5s
│   ├── A2A communication: 0.1s
│   └── Gemini AI: 1.4s
└── Generate itinerary (Gemini): 3.0s

Total: ~9 seconds
(agents called in parallel, so actual time is ~7s)
```

The A2A overhead is only ~0.4s out of 7s (< 6%).

**Diagram:** None needed

---

### Q54: Can you modify the demo to plan a different type of trip?

**Simple Answer:**
"Yes! Let me show you. The demo is flexible - you can change the destination, number of days, etc."

**What to do:**
Option 1: Modify src/client/travel-demo.ts

**Show code:**
```typescript
// Change this line
const request = {
  destination: "Tokyo",  // Was "Paris"
  days: 5,  // Was 3
  preferences: "I like technology and anime"
};
```

Option 2: Make it interactive (if you have time)
Add readline to ask user for input.

**What to say:**
"See? We can easily change it to plan a trip to Tokyo instead of Paris. All the agents work the same way - they just get different input."

[If you run it]
"Let me rebuild and run it... There! Now it's planning a 5-day trip to Tokyo with technology and anime recommendations."

**Diagram:** None needed

---

### Q55: Can you show the Agent Card for one agent?

**Simple Answer:**
"Sure! Let me show you the Weather Agent card."

**What to do:**
1. Open browser
2. Go to: `http://localhost:4000/.well-known/agent-card.json`
3. Show the JSON (formatted)

**What to say:**

"This is the Agent Card for the Weather Agent. Let me explain the key parts:"

[Point at screen]
```json
{
  "protocolVersion": "0.1.0",  // ← A2A version
  "name": "Weather Agent",     // ← Name
  "description": "Provides weather forecasts",  // ← What it does

  "skills": [{  // ← What it can do
    "name": "get_weather",
    "description": "Get weather forecast for a city",
    "input": {  // ← What input it needs
      "type": "object",
      "properties": {
        "city": { "type": "string" },
        "days": { "type": "number" }
      }
    }
  }]
}
```

"This card tells clients:
- How to talk to this agent (protocol 0.1.0)
- What it's called (Weather Agent)
- What it can do (get_weather skill)
- What input it needs (city name and number of days)

Every A2A agent has this card. It's like a contract between the agent and clients."

**Diagram:** Show Diagram #6 (Agent Card Structure) for reference

---

**End of Q&A Preparation**

## Final Tips for Q&A Session

### Handling Difficult Questions

**If you don't know the answer:**
- "That's a good question. I don't know the answer off the top of my head. Let me research that and get back to you."
- Never make up an answer!

**If the question is out of scope:**
- "That's outside the scope of this demo, but it's an interesting topic. We can discuss it after the session if you'd like."

**If the question is unclear:**
- "Could you clarify what you mean by [X]?"
- "Can you give me an example of what you're thinking?"

### Time Management

**If running out of time:**
- "Great question! We're running short on time, but let me give you a quick answer..."
- "I can answer that more thoroughly after the session if you're interested."

**If lots of time remaining:**
- Show more diagrams
- Run demo variations
- Show code (if they're interested)
- Discuss future plans

### Enthusiasm

- Show excitement about A2A!
- Explain why you think it's important
- Share what you learned while building this
- Be honest about challenges you faced

**Good luck with your Q&A session!**
