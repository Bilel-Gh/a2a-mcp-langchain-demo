# A2A Protocol Presentation Script (30 Minutes)

**Language Level:** Simple English (B2)
**Total Time:** 30 minutes
**Focus:** 70% A2A Protocol, 20% Demo, 10% MCP
**Code:** Almost none (show only if asked)

---

## Before You Start

### Setup Checklist
- [ ] All 5 agents running (`npm run dev`)
- [ ] Demo client ready (`npm run dev:demo`)
- [ ] DIAGRAMS-LIBRARY.md open on second screen
- [ ] This script open for reference
- [ ] Screen sharing ready
- [ ] Terminal window visible

### Quick Tips
- Speak slowly and clearly
- Use simple words
- Show diagrams one at a time
- Point at screen while explaining
- Ask "Does this make sense?" every 5 minutes
- Keep code hidden unless someone asks

---

## Slide 1: Title Slide (1 minute)

**[0:00 - 0:30] Opening**

```
┌────────────────────────────────────────┐
│                                        │
│    Agent-to-Agent (A2A) Protocol      │
│                                        │
│    How AI Agents Talk to Each Other   │
│                                        │
│         [Your Name]                    │
│         [Date]                         │
│                                        │
└────────────────────────────────────────┘
```

**What to say:**

"Hello everyone. Today I will show you the A2A protocol. A2A means 'Agent to Agent'. It is a way for AI agents to talk to each other. I built a demo project that uses this protocol. Let me show you what it does."

**[0:30 - 1:00] What You Will See**

"In the next 30 minutes, you will see:
- First, a live demo - you will see agents working together
- Then, I will explain the A2A protocol - how it works
- Finally, I will show you our project - how we built it

Let's start with the demo. Seeing it first will help you understand better."

**Timing check:** ✓ 1 minute

---

## Slide 2: Live Demo (7 minutes)

**[1:00 - 1:30] Introduce the Demo**

"Now I will show you a working example. This is a travel planning system. You tell it where you want to go. It gives you a complete travel plan. Behind the scenes, five agents work together."

**What to show on screen:**
- Terminal with all agents running
- Show the 5 running servers (ports 4000-4004)

**What to say:**

"You can see five programs running. Each one is an agent:
- Weather Agent - gives weather information
- Translator Agent - translates text
- Web Search Agent - finds information online
- Calculator Agent - does math calculations
- Travel Planner - the main agent that coordinates everything

All these agents talk using the A2A protocol. Let me show you."

**[1:30 - 4:00] Run the Demo**

**What to do:**
1. Open new terminal
2. Run: `npm run dev:demo`
3. Let it execute completely
4. Show the output appearing in real-time

**What to say while demo runs:**

"Watch what happens. I'm asking for a travel plan to Paris for 3 days."

[Demo starts]

"See? The system is working now. You can see messages appearing. These are updates from the agents. The Travel Planner is asking other agents for information."

[Point at specific messages]

"Here - the Weather Agent just sent weather information.
Here - the Web Search Agent found tourist attractions.
Here - the Calculator worked out the budget.
Here - the Translator changed some text to French."

[Demo finishes]

"And now - the complete travel plan! Everything combined into one report. Five agents worked together to make this. That's the power of A2A."

**[4:00 - 6:00] Show Agent Communication**

**Show: Diagram #18 (Complete Demo Flow)**

"Let me show you what happened behind the scenes."

[Show diagram]

"This diagram shows all the steps:
1. The client sent a request to the Travel Planner
2. The Travel Planner asked four other agents for information
3. Each agent did its job
4. The Travel Planner collected all the answers
5. It created the final travel plan
6. It sent the result back to the client

All of this communication uses the A2A protocol. Now let me explain what A2A is."

**[6:00 - 8:00] Show One Agent Card**

"Before agents can talk, they need to introduce themselves. They do this with an 'Agent Card'. Let me show you."

**What to do:**
- Open browser
- Go to: `http://localhost:4000/.well-known/agent-card.json`
- Show the JSON (briefly!)

**What to say:**

"This is the Agent Card for the Weather Agent. Don't worry about all the details. The important parts are:
- The name: 'Weather Agent'
- What it can do: 'Get weather forecasts'
- How to use it: the skills section

Every agent has this card. It's like a business card. When an agent wants to talk to another agent, it first reads the card. Then it knows how to talk to it."

**Timing check:** ✓ 7 minutes total (8 minutes elapsed)

---

## Slide 3: What is A2A? (3 minutes)

**[8:00 - 8:30] The Problem**

**What to say:**

"Let me explain why we need A2A. Imagine you have many AI agents. Each one does something different:
- One agent understands weather
- One agent translates languages
- One agent does math
- One agent searches the web

How do these agents work together? How do they talk to each other? That's the problem."

**[8:30 - 9:30] The Solution**

**Show: Diagram #16 (System Overview)**

"The A2A protocol solves this problem. It is a standard way for agents to communicate. Think of it like a language. If all agents speak the same language, they can understand each other.

A2A was created by Anthropic. They made Claude (the AI you might know). They also made this protocol so agents can work together.

Look at this diagram. All the arrows show A2A communication. Every agent uses the same protocol. This makes everything simple."

**[9:30 - 11:00] Key Concept: What is an Agent?**

**What to say:**

"Let me explain what an 'agent' is. An agent is a program that:
- Has a specific job (like 'get weather' or 'translate text')
- Can receive requests
- Can send responses
- Can use AI to think

It's like a specialized worker. You give it a task. It does the task. It gives you the result.

In A2A, agents can also talk to OTHER agents. That's what makes it powerful. An agent can ask another agent for help. Like in our demo - the Travel Planner asked the Weather Agent for information."

**Timing check:** ✓ 3 minutes (11 minutes elapsed)

---

## Slide 4: A2A Core - Agent Cards (2 minutes)

**[11:00 - 11:30] What is an Agent Card?**

**Show: Diagram #6 (Agent Card Structure)**

"Now let me explain the A2A protocol. I'll show you the main concepts. The first concept is the Agent Card.

An Agent Card is like a profile. It tells you:
- Who is this agent? (name)
- What does it do? (description)
- What can it do for me? (skills)
- How do I talk to it? (protocol version)

Look at this diagram. This is what an Agent Card contains."

**[11:30 - 13:00] How It Works**

**Show: Diagram #1 (Agent Discovery Flow)**

"Here's how agents find each other. This diagram shows the steps.

Step 1: The client asks 'Who are you?'
Step 2: The agent sends its card
Step 3: The client reads the card
Step 4: Now the client knows how to talk to the agent

This happens automatically. You don't need to do anything. The A2A SDK handles it. But it's good to understand the process.

This is called 'discovery'. Before agents talk, they discover each other."

**Timing check:** ✓ 2 minutes (13 minutes elapsed)

---

## Slide 5: A2A Core - Messages (3 minutes)

**[13:00 - 13:30] What is a Message?**

"After discovery comes communication. Agents send 'messages' to each other. A message is like an email. It has:
- Content (what you want to say)
- Metadata (extra information)
- Parts (different pieces of content)

Let me show you."

**[13:30 - 15:00] Message Flow**

**Show: Diagram #2 (Message Send and Response)**

"This diagram shows a simple message flow.

On the left: the client
On the right: the agent

Step 1: Client sends a message (POST /v1/messages)
Step 2: Agent receives it
Step 3: Agent processes the request
Step 4: Agent sends back a response

Simple! Request and response. Like asking a question and getting an answer.

But A2A has two modes. Let me show you both."

**[15:00 - 16:00] Blocking vs Non-Blocking**

**Show: Diagram #5 (Blocking vs Non-Blocking Comparison)**

"Look at this comparison. There are two ways to send messages:

**Blocking mode** (top):
- Send message
- Wait for answer
- Get response
- Like a phone call - you wait on the line

**Non-blocking mode** (bottom):
- Send message
- Get 'OK, I'll call you later'
- Do other work
- Get notification when done
- Like sending a text - you don't wait for reply

When do you use each one?
- Blocking: for quick tasks (less than 30 seconds)
- Non-blocking: for slow tasks (more than 30 seconds)

Our demo uses blocking mode. Everything happens fast, so we just wait for the answer."

**Timing check:** ✓ 3 minutes (16 minutes elapsed)

---

## Slide 6: A2A Core - Message Parts (2 minutes)

**[16:00 - 17:00] Different Types of Content**

**Show: Diagram #9 (Message Parts Types)**

"Messages can contain different types of information. We call these 'parts'. Look at this diagram.

A message can have:
- **Text part** - normal text, like 'The weather is sunny'
- **Data part** - structured information, like {temperature: 25}
- **Image part** - a picture
- **File part** - a document (PDF, CSV, etc.)
- **Error part** - error information if something fails

Why is this useful? Because agents might need to send different types of information. One agent sends text. Another sends data. Another sends images. A2A supports all of them."

**[17:00 - 18:00] Example from Our Project**

"In our travel demo, the Travel Planner receives different parts:
- Weather Agent sends data (temperature numbers)
- Web Search sends text (attraction descriptions)
- Calculator sends data (budget numbers)

Then the Travel Planner combines everything into one text report. It takes all these parts and makes them into one nice message for the user."

**Timing check:** ✓ 2 minutes (18 minutes elapsed)

---

## Slide 7: A2A Core - SSE Streaming (3 minutes)

**[18:00 - 18:30] What is SSE?**

"Now let me show you something cool. SSE means 'Server-Sent Events'. It's a way to get real-time updates.

Remember in the demo? You saw messages appearing one by one. 'Getting weather...', 'Searching attractions...', 'Done!'. That's SSE streaming.

Without SSE: You send a request and wait in silence. You don't know what's happening.

With SSE: You see progress updates. You know the agent is working."

**[18:30 - 20:00] How SSE Works**

**Show: Diagram #3 (SSE Streaming Sequence)**

"Look at this diagram. This shows how SSE works.

Step 1: Client sends a request (with special header: text/event-stream)
Step 2: Agent sends 'start' event
Step 3: Agent works on step 1, sends progress update
Step 4: Agent works on step 2, sends another update
Step 5: Agent finishes, sends the final result
Step 6: Agent sends 'finished' event

The client sees everything in real-time. This is much better than waiting in silence!

In our demo, the Travel Planner uses SSE. That's why you saw all those updates appearing."

**[20:00 - 21:00] Why SSE is Useful**

"Why do we use SSE? Two reasons:

**Reason 1: Better user experience**
Users like to see progress. If something takes 10 seconds, they want to know 'it's working' - not just silence.

**Reason 2: Keep connection alive**
For long tasks, the connection might timeout. SSE sends 'heartbeat' messages to keep it alive. The connection stays open.

This is one of the best features of A2A. Many protocols don't have this."

**Timing check:** ✓ 3 minutes (21 minutes elapsed)

---

## Slide 8: A2A Core - Webhooks (2 minutes)

**[21:00 - 22:00] What are Webhooks?**

"Let me show you another way to get updates. It's called webhooks.

Imagine you order a pizza. Two options:
- **Option 1**: You call the pizza place every 5 minutes: 'Is it ready? Is it ready?'
- **Option 2**: You give them your phone number. They call you when it's ready.

Option 2 is webhooks. You don't keep asking. They tell you when it's done."

**[22:00 - 23:00] Webhook Flow**

**Show: Diagram #4 (Webhook Notification Flow)**

"Look at this diagram.

Step 1: Client sends request + webhook URL
Step 2: Agent says 'OK, I'll call you at this URL when I'm done'
Step 3: Agent works on the task
Step 4: When finished, agent calls the webhook URL
Step 5: Client receives notification

This is perfect for long tasks. The client doesn't wait. It does other work. When the task finishes, it gets a notification.

Our demo doesn't use webhooks because tasks are quick. But for slow tasks (like 'analyze this 100-page document'), webhooks are better than waiting."

**Timing check:** ✓ 2 minutes (23 minutes elapsed)

---

## Slide 9: A2A in Our Project (4 minutes)

**[23:00 - 23:30] Our Architecture**

**Show: Diagram #16 (System Overview) again**

"Now let me show you how we use A2A in our project. Look at this diagram again.

We have 5 agents. Each agent does one thing:
- Weather Agent: gets weather from OpenWeatherMap API
- Translator Agent: translates text using Google Gemini AI
- Web Search Agent: searches for information using Brave Search
- Calculator Agent: does math calculations (we'll talk about this later)
- Travel Planner: coordinates everything

All communication between these agents uses A2A. Every arrow in this diagram is A2A protocol."

**[23:30 - 24:30] The Three-File Pattern**

**Show: Diagram #20 (Three-File Agent Pattern)**

"Let me show you how we build agents. Every agent has 3 files. Always the same pattern:

**File 1: agent-card.ts** - Who am I?
This file defines the agent card. Name, description, skills.

**File 2: executor.ts** - What do I do?
This file does the actual work. The business logic.

**File 3: server.ts** - How do I start?
This file starts the HTTP server. It listens for requests.

Why this pattern? Because it's clean and consistent. If you look at any agent, you know where to find things. Want to see what it does? Look at executor.ts. Want to see its skills? Look at agent-card.ts. Simple!"

**[24:30 - 26:00] How Orchestration Works**

**Show: Diagram #17 (Travel Planner Orchestration)**

"The Travel Planner is special. It's called an 'orchestrator'. This means it coordinates other agents.

Look at this diagram. These are the steps:

1. Client sends request to Travel Planner
2. Travel Planner receives it
3. Travel Planner calls multiple agents:
   - Ask Weather Agent for forecast
   - Ask Web Search for attractions
   - Ask Translator for translations
   - Ask Calculator for budget
4. All agents send their answers back
5. Travel Planner combines all answers
6. Travel Planner uses AI to create nice travel plan
7. Travel Planner sends result to client

The Travel Planner is both a server AND a client:
- It's a server (receives requests from demo client)
- It's a client (sends requests to other agents)

This is a key concept in A2A. Any agent can be both!"

**[26:00 - 27:00] Why This Architecture?**

"Why did we design it this way?

**Benefit 1: Separation of concerns**
Each agent does one thing. Weather agent only knows weather. Translator only knows translation. Simple.

**Benefit 2: Easy to add new agents**
Want a 'hotel booking' agent? Just create 3 files (card, executor, server). Connect it with A2A. Done!

**Benefit 3: Reusable agents**
The Weather Agent can work with any project. Anyone can use it. Just call it with A2A.

**Benefit 4: Easy to test**
You can test each agent separately. Turn off the others. Test just one. This makes development faster.

This is the power of a standard protocol like A2A."

**Timing check:** ✓ 4 minutes (27 minutes elapsed)

---

## Slide 10: MCP Extension (2 minutes)

**[27:00 - 27:30] What is MCP?**

"Before we finish, let me quickly show you one more thing. It's called MCP. MCP stands for 'Model Context Protocol'.

MCP is different from A2A:
- A2A: agents talk to agents (horizontal communication)
- MCP: agents use tools (vertical communication)

Think of MCP like giving tools to an agent. The agent can then use these tools to do precise work."

**[27:30 - 28:30] A2A + MCP Together**

**Show: Diagram #24 (A2A + MCP Combination)**

"Look at this diagram. It shows how A2A and MCP work together.

The top part (horizontal arrows) is A2A. Agents talking to agents.

The bottom part (vertical arrows) is MCP. Agents using tools.

In our project, the Calculator Agent uses both:
- It receives A2A requests from Travel Planner
- It uses MCP tools to do math (add, multiply, calculate budget)
- It sends A2A response back

Why use MCP tools for math? Because tools are precise. If you ask AI '15 * 3.7', sometimes it makes mistakes. But if you give it a calculator tool, it's always correct."

**[28:30 - 29:00] Quick Example**

**Show: Diagram #25 (Calculator Agent with MCP) - ONLY if time allows**

"Here's what happens:
1. Travel Planner asks Calculator: 'What's the budget for 3 nights?'
2. Calculator Agent uses MCP tool 'calculate_trip_budget'
3. MCP tool does the math: (3 nights × $100) + (3 days × 3 meals × $20) = $480
4. Calculator Agent sends answer back: '$480'

This combination of A2A and MCP gives us the best of both:
- Agents can communicate (A2A)
- Agents can use precise tools (MCP)

But remember: A2A is the main protocol. MCP is just an addition. 70% of our project is A2A. MCP is only used in one agent."

**Timing check:** ✓ 2 minutes (29 minutes elapsed)

---

## Slide 11: Wrap-Up (1 minute)

**[29:00 - 29:30] Key Takeaways**

**What to say:**

"Let me summarize the main points:

**Point 1: A2A is a protocol for agents to communicate**
It's like a common language. All agents speak it.

**Point 2: Main concepts are Agent Cards, Messages, SSE, and Webhooks**
These are the building blocks of A2A.

**Point 3: A2A makes it easy to build multi-agent systems**
Our demo showed 5 agents working together. We can add more easily.

**Point 4: Any agent can be both server and client**
Like the Travel Planner - it receives requests and sends requests.

**Point 5: You can combine A2A with other protocols like MCP**
This gives agents both communication and tools."

**[29:30 - 30:00] Final Words**

"This project shows that A2A works. Five agents, different technologies (OpenWeatherMap, Gemini AI, Brave Search), all working together. The key is the standard protocol.

Now I'm happy to answer your questions. We have 30 minutes for discussion. What would you like to know?"

**Timing check:** ✓ 1 minute (30 minutes total)

---

## Presentation Complete!

**What to do next:**
- Open the floor for questions
- Refer to QA-PREPARATION.md for common questions
- Show code only if specifically requested
- Show more diagrams if needed (from DIAGRAMS-LIBRARY.md)

---

## Backup Slides (If Extra Time or Questions)

### Backup 1: Error Handling

**Show: Diagram #10 (Error Handling Flow)**

"Let me show you how errors work in A2A. When something goes wrong, the agent sends back a message with an error part. Look at this diagram..."

### Backup 2: Task Lifecycle

**Show: Diagram #7 (Task Lifecycle)**

"For long-running tasks, A2A has a 'Task' concept. A task goes through different states: pending, in progress, completed, or failed. Look at this diagram..."

### Backup 3: Agent Communication Layers

**Show: Diagram #19 (Agent Communication Layers)**

"Let me show you the technical architecture. An agent has different layers: HTTP layer, A2A protocol layer, business logic layer..."

### Backup 4: Show Some Code (If Requested)

Only show if someone specifically asks "Can you show me some code?"

**Show: src/agents/weather-agent/agent-card.ts (lines 1-30)**

"This is what an agent card looks like in code. See? It's just a TypeScript object with the agent metadata..."

**Show: src/agents/weather-agent/executor.ts (lines 30-50 only)**

"And this is the executor. See this `execute` function? This is where the agent does its work..."

---

## Tips for Delivery

### Language Tips (B2 Level)
- ✅ Use: "Let me show you" / "Look at this" / "This is how it works"
- ✅ Use: Simple present ("The agent sends a message")
- ✅ Use: Present perfect ("We have built 5 agents")
- ❌ Avoid: Complex words like "instantiate", "encapsulate", "paradigm"
- ❌ Avoid: Long sentences (keep under 15 words)
- ❌ Avoid: Passive voice ("The message is sent by...")

### Presentation Tips
- **Speak slowly** - Remember, English is not your first language. Take your time.
- **Pause after each point** - Let people absorb the information
- **Use hands to point** - Point at the screen when showing diagrams
- **Ask for confirmation** - "Does this make sense?" / "Is this clear?"
- **Don't rush** - If you finish early, that's OK. Better clear than fast.

### Screen Tips
- Keep terminal font size LARGE
- Keep browser zoom at 150% or more
- Show one diagram at a time
- Close unnecessary windows
- Use full screen when showing diagrams

### Handling Questions
- If you don't understand a question: "Sorry, could you repeat that?"
- If you don't know the answer: "That's a good question. Let me think... [or] I need to check that."
- If the question is complex: "Good question. Let me show you a diagram to explain..."

### If You Get Stuck
- Take a breath
- Look at this script
- Say: "Let me show you a diagram to explain this better"
- Show a relevant diagram from DIAGRAMS-LIBRARY.md

---

## Quick Reference: Where Things Are

**Project files:**
- Agents: `src/agents/[agent-name]/`
- Agent Cards: `src/agents/[agent-name]/agent-card.ts`
- Executors: `src/agents/[agent-name]/executor.ts`
- Servers: `src/agents/[agent-name]/server.ts`
- Demo Client: `src/client/travel-demo.ts`
- MCP Server: `src/mcp-servers/math-server.ts`

**Documentation:**
- Diagrams: `docs/DIAGRAMS-LIBRARY.md`
- This script: `docs/PRESENTATION-SCRIPT-EN.md`
- Q&A prep: `docs/QA-PREPARATION.md`
- Full docs: `docs/01-a2a-protocol.md` through `docs/06-langchain-langgraph.md`

**Commands:**
- Start all agents: `npm run dev`
- Run demo: `npm run dev:demo`
- View agent card: `http://localhost:4000/.well-known/agent-card.json`

---

**Good luck with your presentation! You've got this! 🚀**
