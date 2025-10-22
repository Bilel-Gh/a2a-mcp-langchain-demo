# A2A Protocol Presentation Script
**Duration:** 30 minutes
**Language:** English (B2 level)
**Audience:** Technical team unfamiliar with A2A
**Format:** 27 slides + Live Demo

---

## Pre-Presentation Checklist

- [ ] All agents running (`npm run dev`)
- [ ] Test demo client (`npm run dev:demo`)
- [ ] Browser with presentation open
- [ ] Terminal visible for demo
- [ ] Water/coffee ready
- [ ] Timer set to 30 minutes

---

## PART 1: THE PROBLEM (5 minutes)
*Goal: Make the audience understand the fragmentation problem*

---

### SLIDE 1: Title Slide
**Timing:** 30 seconds

**What to say:**
> "Good morning/afternoon everyone. Today I'm going to show you something exciting: the Agent-to-Agent protocol, or A2A for short. This is a universal language that lets AI agents talk to each other, regardless of which framework they were built with."

**Pause briefly, smile**

> "I'll explain why we need this, how it works, and at the end, I'll show you a live demo with 5 agents working together to plan a trip."

**Notes:**
- Speak slowly and clearly
- Make eye contact with audience
- Show enthusiasm but stay natural

---

### SLIDE 2: The Rise of AI Agents
**Timing:** 1 minute

**What to say:**
> "Let's start with the context. AI agents are everywhere now."

**Read through the list with brief pauses:**
- "Personal assistants help us with daily tasks"
- "Customer service agents answer questions 24/7"
- "Data analysis agents process complex information"
- "Content creation agents write, translate, and generate content"
- "Business automation agents orchestrate entire workflows"

**Pause for effect**

> "So we have all these powerful agents... but there's a problem."

**Notes:**
- Point to the screen when mentioning each type
- Use hand gestures to show "everywhere"
- Build suspense with the last line

---

### SLIDE 3: The Problem - Fragmentation
**Timing:** 1 minute

**What to say:**
> "The problem is fragmentation. Each agent speaks a different language."

**Point to the badges on screen:**
> "We have CrewAI, LangGraph, ADK, AutoGen, Haystack, and countless custom frameworks. They all do similar things, but they can't understand each other."

**Pause**

> "So the question is: How can they work together?"

**Notes:**
- Emphasize "different language"
- Show frustration with hand gesture
- Make the question rhetorical, don't wait for answer

---

### SLIDE 4: Real Example - Travel Booking Chaos
**Timing:** 1 minute 30 seconds

**What to say:**
> "Let me give you a real example. Imagine you're building a travel booking system."

**Point to the diagram:**
> "You want your agent to talk to a hotel agent, a car rental agent, a flight agent, and a restaurant agent. But here's the problem..."

**Pause for effect**

> "Each connection needs custom code. Custom Integration 1, Custom Integration 2, Custom Integration 3, Custom Integration 4."

> "Each one has a different protocol, different format, different setup. It's chaos."

**Notes:**
- Count on fingers: 1, 2, 3, 4
- Show frustration physically
- Make "chaos" sound dramatic

---

### SLIDE 5: The Consequences
**Timing:** 1 minute

**What to say:**
> "This creates serious problems."

**Go through the list on the left:**
- "Developers are doing redundant work, rebuilding the same thing over and over"
- "It costs time and money"
- "You accumulate technical debt that's hard to maintain"
- "The integrations are fragile and break easily"
- "And worst of all, you can't scale"

**Point to the math box on the right:**
> "Look at the math. With 5 agents, you need 10 custom integrations. With 10 agents, 45 integrations. With 20 agents, 190 integrations!"

**Shake head**

> "This doesn't scale."

**Notes:**
- Use strong words: "serious problems"
- Emphasize the exponential growth
- Show the formula briefly

---

## PART 2: THE SOLUTION (5 minutes)
*Goal: Introduce A2A as the elegant solution*

---

### SLIDE 6: The Question
**Timing:** 30 seconds

**What to say:**
> "So here's the big question..."

**Pause for 2 seconds**

> "What if agents could understand each other? What if we had a universal language?"

**Pause again**

> "Well, that's exactly what A2A does."

**Notes:**
- Use dramatic pause
- Build anticipation
- Smile when saying "that's exactly what A2A does"

---

### SLIDE 7: Meet A2A
**Timing:** 1 minute

**What to say:**
> "A2A stands for Agent-to-Agent Protocol. It's the universal language for AI agents."

**Point to the info box:**
> "It was created by Google in 2025."

**Pause**

> "The idea is simple: one protocol to connect them all. Just like HTTP connects all websites, or SMTP connects all email systems, A2A connects all AI agents."

**Notes:**
- Emphasize "universal"
- Mention Google clearly (correct the creator)
- Use the "one protocol" phrase strongly

---

### SLIDE 8: Before A2A - "Spaghetti" Architecture
**Timing:** 1 minute

**What to say:**
> "Let me show you what things looked like before A2A. I call this the 'spaghetti' architecture."

**Point to the messy diagram:**
> "Every agent needs custom code to talk to every other agent. Agent A to B, A to C, A to D, B to C, B to D, C to D, and so on."

> "With just 5 agents, you have 10 custom integrations. It's messy, complicated, and impossible to maintain."

**Notes:**
- Say "spaghetti" with humor
- Trace some lines with your finger
- Show disgust at the complexity

---

### SLIDE 9: With A2A - "Star" Architecture
**Timing:** 1 minute 30 seconds

**What to say:**
> "Now look at this. With A2A, everything changes."

**Point to the clean diagram:**
> "Each agent just learns A2A once. That's it. They all speak the same language, and they can all talk to each other through the protocol."

> "5 agents? 5 standard integrations. 10 agents? Still just 10 integrations. 100 agents? 100 integrations."

**Smile**

> "It's clean, simple, and it scales beautifully."

**Notes:**
- Show the contrast clearly
- Use hand gesture for "clean"
- Emphasize "scales beautifully"

---

### SLIDE 10: The Core Principle
**Timing:** 30 seconds

**What to say:**
> "The core principle is simple: Standardization equals Interoperability."

**Point to the analogies:**
> "It's like HTTP for web pages, SMTP for emails, USB for devices. Now we have A2A for AI agents."

> "One protocol for all agents, regardless of framework."

**Notes:**
- Say "standardization equals interoperability" clearly
- The analogies help people understand
- Emphasize "regardless of framework"

---

### SLIDE 11: Analogy - USB
**Timing:** 1 minute

**What to say:**
> "Let me give you another analogy. Think about USB."

**Point to the left side:**
> "Before USB, you had a serial port for your mouse, a parallel port for your printer, PS/2 for your keyboard. Every device needed a different port. It was chaos."

**Point to the right side:**
> "After USB, one universal port. It works for everything. Plug and play. Easy to add new devices. Simple."

**Pause**

> "A2A does the same thing for AI agents."

**Notes:**
- People relate to USB story
- Use physical gestures for "chaos" vs "simple"
- The analogy makes it very concrete

---

## PART 3: HOW IT WORKS (8 minutes)
*Goal: Explain the technical concepts simply*

---

### SLIDE 12: The 3 Pillars of A2A
**Timing:** 1 minute

**What to say:**
> "Now let's see how A2A works. It's built on 3 pillars."

**Point to each pillar:**

> "First, the **Agent Card** - for discovery. It's like a business card that says 'who are you and what can you do?'"

> "Second, **Messages and Tasks** - for communication. This is how agents talk and work together."

> "Third, the **Agent Executor** - for execution. This is the bridge that makes it all work with any framework."

> "These three components work together to enable seamless agent collaboration."

**Notes:**
- Count on fingers: 1, 2, 3
- Make it simple
- Emphasize "seamless"

---

### SLIDE 13: Pillar 1 - Agent Card
**Timing:** 1 minute 30 seconds

**What to say:**
> "Let's start with the Agent Card. Think of it as a business card for agents."

**Point to the explanation:**
> "Before agents talk, they exchange cards. The card tells you everything you need to know."

**Point to the code box:**
> "Look at this example: a Weather Agent. The card says:"
- "My name is Weather Agent"
- "I can get weather forecasts"
- "My skills are get_forecast and get_temperature"
- "I accept text input and return text output"

> "Simple structure, clear information. Now I know everything I need to talk to this agent."

**Notes:**
- Use "business card" metaphor strongly
- Read the card naturally
- Show how simple it is

---

### SLIDE 14: Pillar 2 - Messages
**Timing:** 1 minute 30 seconds

**What to say:**
> "The second pillar is Messages. These are for quick, simple exchanges, like a chat conversation."

**Point to the use cases:**
> "Use messages for fast questions, simple requests, direct responses, real-time chat. The flow is simple: request, response. Fast and simple."

**Point to the code box:**
> "Here's what a message looks like. It has a role - user or agent - and parts with the actual content. For example: 'What's the weather?'"

**Point to the example:**
> "Ask: 'What's the weather in Paris?' Get back: 'Sunny, 25 degrees.' Done."

**Notes:**
- Emphasize "fast and simple"
- Show the request-response pattern
- Keep it conversational

---

### SLIDE 15: Pillar 3 - Tasks
**Timing:** 1 minute 30 seconds

**What to say:**
> "Tasks are different. They're for complex operations that take time."

**Point to the use cases:**
> "Use tasks for trip planning, data analysis, report generation, anything that takes more than 30 seconds."

**Point to the code box:**
> "Tasks have a lifecycle. They start as 'submitted', move to 'in progress', and finish as 'completed'. As they run, results are stored in artifacts."

**Point to the example:**
> "For example: 'Plan a 7-day trip to Japan.' This takes time. You can track the progress and get the complete itinerary when it's done."

**Notes:**
- Contrast with Messages (quick vs long)
- Show the lifecycle clearly
- Give concrete time example (>30 seconds)

---

### SLIDE 16: Agent Executor - The Bridge
**Timing:** 1 minute 30 seconds

**What to say:**
> "Now, the Agent Executor is the key piece that makes everything work."

**Point to the diagram:**
> "Think of it as a translator. It receives A2A messages in standard format, translates them to your internal logic, whether that's CrewAI, LangGraph, or custom code."

> "This is the bridge between the A2A protocol and your framework-specific implementation."

**Point to the bottom:**
> "The key point: it works with ANY framework. CrewAI, LangGraph, ADK, custom code... doesn't matter. The agent just needs to implement the Executor interface."

**Notes:**
- Use "translator" and "bridge" metaphors
- Emphasize "ANY framework"
- This is the key to interoperability

---

### SLIDE 17: Complete Flow - Weather Agent
**Timing:** 1 minute 30 seconds

**What to say:**
> "Let me show you a complete example, step by step."

**Trace the sequence diagram:**

> "A client asks the Travel Planner to 'Plan a trip to Paris.'"

> "The Travel Planner first gets the Weather Agent's card to know what it can do."

> "Then it sends a message: 'Get weather for Paris.'"

> "The Weather Agent executes. It calls the OpenWeather API, gets the data, and returns a message: 'Sunny, 25 degrees.'"

> "Finally, the Travel Planner gives the complete itinerary back to the client."

**Pause**

> "Notice: all communication uses the same A2A protocol."

**Notes:**
- Follow the arrows with your hand
- Make it flow naturally
- Emphasize "same protocol"

---

### SLIDE 18: Real Case - Pickleball Game
**Timing:** 1 minute

**What to say:**
> "Here's a more complex real case. Imagine you want to schedule a pickleball game with 3 friends."

> "Each friend has their own agent, built with different frameworks: Alice uses LangGraph, Bob uses ADK, Charlie uses a custom framework."

**Trace the flow:**
> "The Coordinator agent asks each one about their availability. Alice is free Saturday 2-4pm. Bob is free 3-5pm. Charlie is free 2-6pm."

> "The Coordinator finds the overlap: Saturday 3-4pm. Game scheduled."

**Point to the note:**
> "Different frameworks, same A2A protocol, seamless collaboration!"

**Notes:**
- Tell it like a story
- Emphasize the different frameworks
- Celebrate the success at the end

---

## PART 4: MCP (4 minutes)
*Goal: Clarify the difference between A2A and MCP*

---

### SLIDE 19: Wait... What About MCP?
**Timing:** 30 seconds

**What to say:**
> "Now, I know what some of you are thinking: 'Wait, what about MCP? How is this different?'"

**Pause**

> "Good question! Let's clarify that."

**Notes:**
- Acknowledge the confusion
- Show you anticipated this question
- Transition smoothly

---

### SLIDE 20: A2A vs MCP - Different Purposes
**Timing:** 2 minutes

**What to say:**
> "A2A and MCP are different protocols for different purposes."

**Point to the left side - A2A:**
> "A2A is horizontal. It's for agent-to-agent communication. Agents talking to each other, collaborating, orchestrating work together."

**Give the example:**
> "Use case: 'Ask the Weather Agent for the forecast.' One agent talks to another agent."

**Point to the right side - MCP:**
> "MCP is vertical. It's for agents using tools. Function calling, augmentation, giving agents capabilities."

**Give the example:**
> "Use case: 'Use the calculator tool for precise math.' An agent uses a tool."

**Pause**

> "Different protocols for different needs."

**Notes:**
- Use hand gestures: horizontal vs vertical
- Make the distinction very clear
- The examples help a lot

---

### SLIDE 21: A2A + MCP = Perfect Combo
**Timing:** 1 minute

**What to say:**
> "But here's the great thing: they work together!"

**Point to the diagram:**
> "In the same system, you can use both. The client talks to the Travel Planner using A2A. The Travel Planner coordinates other agents - Weather, Translator - all using A2A."

> "But the Calculator Agent receives requests via A2A, then uses MCP to access math tools, then responds via A2A."

**Point to the info box:**
> "A2A for horizontal communication. MCP for vertical tool usage. Together, you get a complete platform."

**Notes:**
- Show excitement about the combination
- Trace the flow in the diagram
- Emphasize "complete platform"

---

### SLIDE 22: Our Project Uses Both
**Timing:** 30 seconds

**What to say:**
> "And that's exactly what our demo does. The Travel Planner uses A2A to coordinate 5 agents."

> "The Calculator Agent is special: it receives via A2A, uses MCP tools for calculations, and responds via A2A."

> "Best of both worlds!"

**Notes:**
- Reference the upcoming demo
- Build anticipation
- Smile at "best of both worlds"

---

## PART 5: NEW POSSIBILITIES (4 minutes)
*Goal: Show the exciting future*

---

### SLIDE 23: What Becomes Possible?
**Timing:** 2 minutes

**What to say:**
> "So what becomes possible with A2A? Let me show you three exciting possibilities."

**Point to Agent Marketplaces:**
> "First, agent marketplaces. Imagine downloading agents like apps. 'I need a translation agent' - browse, connect, plug and play."

**Point to Federated Systems:**
> "Second, federated systems. Your company's agents can work with partner agents across organizations, securely."

**Point to Plug-and-Play:**
> "Third, plug-and-play integration. Add new agents without changing any code. Just discover the card and start using it."

**Pause**

> "A2A unlocks a new era of AI collaboration."

**Notes:**
- Paint the vision
- Show excitement
- Make it sound transformative

---

### SLIDE 24: The Ecosystem Vision
**Timing:** 1 minute 30 seconds

**What to say:**
> "Imagine an open marketplace of AI agents."

**Point to the diagram:**
> "There's a central registry. Companies, developers, enterprises can all discover agents by capability. Weather agents, translation agents, data analysis, travel, finance, healthcare."

> "Dynamic discovery: find agents by what they can do. Instant integration: just read the card and connect. Global collaboration: agents from anywhere work together."

**Pause**

> "Like the app store, but for AI agents."

**Notes:**
- Paint the big picture
- Use "imagine" to engage imagination
- The app store analogy is powerful

---

### SLIDE 25: Our Demo
**Timing:** 30 seconds

**What to say:**
> "Speaking of which, let me show you what you're about to see in the demo."

**Point to the architecture:**
> "A Travel Planning System with 5 agents working together. The Travel Planner coordinates everything. We have a Weather Agent, Translator Agent, and Web Search Agent all using A2A."

> "Plus the Calculator Agent that uses both A2A and MCP."

> "All communication happens through the A2A protocol."

**Pause**

> "Let me show you..."

**Notes:**
- Quick overview
- Build anticipation
- Transition to demo smoothly

---

## PART 6: CONCLUSION (2 minutes)
*Goal: Summarize and prepare for demo*

---

### SLIDE 26: Key Takeaways
**Timing:** 1 minute 30 seconds

**What to say:**
> "Before the demo, let's recap the key takeaways."

**Go through each point clearly:**

> "One: A2A is the universal language for AI agents, created by Google in 2025."

> "Two: Standardization eliminates fragmentation. No more custom integrations for each agent."

> "Three: It's built on 3 pillars - Agent Card for discovery, Messages and Tasks for communication, Executor for execution."

> "Four: MCP complements A2A. A2A for agents talking to each other, MCP for agents using tools."

> "Five: Together, they create a complete agent platform."

> "Six: The future is an open ecosystem of interoperable agents - marketplaces, federated systems, plug-and-play."

**Notes:**
- Count on fingers: 1, 2, 3, 4, 5, 6
- Pause between each point
- Make eye contact

---

### SLIDE 27: Thank You
**Timing:** 30 seconds

**What to say:**
> "Thank you! Any quick questions before the demo?"

**Wait for questions (if time allows)**

**Then:**

> "Alright, let's see this in action. I'm going to show you 5 agents collaborating to plan a trip, using both A2A and MCP protocols."

**Switch to terminal/demo**

**Notes:**
- Keep questions brief
- If no time, move directly to demo
- Show enthusiasm for the demo

---

## DEMO SECTION (10 minutes)
*Goal: Demonstrate real working system*

---

### Demo Preparation

**Before starting:**
1. Switch to terminal
2. Make sure all agents are running
3. Have the demo client ready
4. Zoom in on terminal for visibility

**What to say:**
> "Let me show you the system running. I have 5 agents already started:"
- Weather Agent on port 4000
- Translator Agent on port 4001
- Travel Planner on port 4002
- Web Search Agent on port 4003
- Calculator Agent on port 4004

---

### Demo Part 1: Show Agent Cards (2 minutes)

**Run:**
```bash
curl http://localhost:4000/.well-known/agent-card.json | jq
```

**What to say:**
> "First, let's see an agent card. This is the Weather Agent's business card."

**Point to the output:**
> "You can see the name, description, skills it offers. This is how agents discover each other."

**Show one more agent card briefly**

---

### Demo Part 2: Run the Travel Demo (5 minutes)

**Run:**
```bash
npm run dev:demo
```

**What to say:**
> "Now I'll ask the Travel Planner to create a 3-day itinerary for Tokyo in July."

**As it runs, narrate:**

> "Watch what happens. The Travel Planner is coordinating all the agents:"
- "It's calling the Weather Agent to get the forecast"
- "It's calling the Translator Agent for key Japanese phrases"
- "It's calling the Web Search Agent to find attractions"
- "It's calling the Calculator Agent to estimate costs"

> "All of this is happening through A2A protocol. Each agent is independent, but they all understand each other."

**When it completes:**
> "And there we go! A complete 3-day itinerary with weather, translations, attractions, and budget."

---

### Demo Part 3: Highlight MCP Integration (2 minutes)

**What to say:**
> "Notice the Calculator Agent. Let me show you something interesting."

**Point to calculator output:**
> "When it calculated the budget, it used MCP tools internally. It received the request via A2A, used MCP's add() and multiply() functions, then returned the result via A2A."

> "This is A2A and MCP working together."

---

### Demo Part 4: Show the Code (Optional - 1 minute if time)

**Open agent-card.ts or show structure:**
> "And look how simple the code is. Each agent just defines its card, implements the executor interface, and that's it. A2A handles all the communication."

---

### Demo Conclusion

**What to say:**
> "So there you have it. 5 agents, different capabilities, all collaborating seamlessly through the A2A protocol."

**Return to presentation slide 27 if needed**

---

## Q&A (Remaining time)

### Common Expected Questions:

**Q: "Is A2A production-ready?"**
> "A2A was released by Google in 2025, so it's still relatively new. The protocol specification is stable, and there are SDKs available. For production use, you'd want to add error handling, authentication, and monitoring. But the core protocol is solid."

**Q: "What about security?"**
> "Great question. A2A supports authentication through standard HTTP mechanisms. In production, you'd use API keys, OAuth, or mTLS. For federated systems, there are provisions for authorization and capability restrictions."

**Q: "How does it handle errors?"**
> "The protocol defines error message formats. If an agent fails, it returns an error message instead of a result. The calling agent can handle that error - retry, fallback to another agent, or report to the user."

**Q: "Can agents from different companies work together?"**
> "Yes, that's one of the main benefits. As long as both agents speak A2A, they can collaborate. You control access through standard API security measures."

**Q: "What's the performance overhead?"**
> "A2A uses HTTP/REST, so there's network latency. For local agents, it's negligible. For remote agents, it's the same as any HTTP API call. The streaming support with SSE helps for long-running tasks."

**Q: "Do I have to rewrite my existing agents?"**
> "No. You create an A2A wrapper around your existing agent. The executor translates A2A messages to your agent's internal format. Your core logic stays the same."

**Q: "What if an agent needs specific features not in A2A?"**
> "A2A is extensible. The message format supports custom fields. You can add agent-specific parameters while maintaining A2A compatibility."

**Q: "How does this compare to CrewAI's approach?"**
> "CrewAI is a framework for building multi-agent systems within one codebase. A2A is a protocol for agents to communicate across different frameworks and systems. You can actually use A2A to connect multiple CrewAI systems together."

---

## Post-Presentation Notes

### What Went Well
- [ ] Timing (under 30 minutes?)
- [ ] Audience engagement
- [ ] Demo worked smoothly
- [ ] Questions answered well

### What to Improve
- [ ] Areas where you rushed
- [ ] Technical difficulties
- [ ] Questions you struggled with
- [ ] Slides that needed more/less time

---

## Quick Reference - Key Points to Remember

1. **A2A = Universal language** (like HTTP, USB)
2. **Created by Google, 2025**
3. **Solves fragmentation problem**
4. **3 Pillars:** Agent Card, Messages/Tasks, Executor
5. **A2A ≠ MCP:** Horizontal vs Vertical
6. **They work together** for complete platform
7. **Future:** Marketplaces, federation, plug-and-play

---

## Emergency Backup Plans

**If demo fails:**
- Show screenshots/videos prepared in advance
- Walk through the code instead
- Show agent cards via curl
- Explain what SHOULD happen

**If you run out of time:**
- Skip the USB analogy (slide 11)
- Skip the Pickleball example (slide 18)
- Shorten the ecosystem vision (slide 24)
- Go straight to key takeaways

**If you have extra time:**
- Dive deeper into code
- Show more agent cards
- Run multiple demo scenarios
- More detailed Q&A

---

## Pronunciation Guide

- **A2A**: "A-two-A" or "A-to-A"
- **MCP**: "M-C-P"
- **Interoperability**: in-ter-op-er-a-BIL-i-ty
- **Orchestration**: or-kes-TRAY-shun
- **Federated**: FED-er-ay-ted
- **Executor**: ex-e-CU-tor
- **Artifact**: AR-ti-fact

---

## Visual Cues to Remember

- 👉 **Point to diagrams** when explaining flows
- ✋ **Hand gestures** for "messy" vs "clean"
- 🤝 **Count on fingers** for numbered lists
- 👀 **Make eye contact** during key points
- 😊 **Smile** when showing successes
- 😤 **Show frustration** when discussing problems

---

## Energy Management

- **High energy:** Introduction, problem statement, demo
- **Moderate energy:** Technical explanations, examples
- **Calm energy:** Code reviews, detailed Q&A
- **Build up:** Conclusion, key takeaways

---

## Slides That Need Extra Time
- Slide 5 (Consequences) - 1 minute
- Slide 17 (Weather flow) - 1:30
- Slide 18 (Pickleball) - 1 minute
- Slide 20 (A2A vs MCP) - 2 minutes

## Slides You Can Speed Through
- Slide 1 (Title) - 30 seconds
- Slide 6 (Question) - 30 seconds
- Slide 19 (Wait MCP?) - 30 seconds
- Slide 27 (Thank you) - 30 seconds

---

**GOOD LUCK! YOU'VE GOT THIS! 🚀**
