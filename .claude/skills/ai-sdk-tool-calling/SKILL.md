---
name: ai-sdk-tool-calling
description: Expert guidance on defining and using tools with Vercel AI SDK Core. Use when implementing `tools` in `generateText` or `streamText`, defining schema validation with Zod, or handling multi-step agentic loops.
license: MIT
version: 1.0.0
---

# AI SDK Tool Calling Skill

## When to Use
- Adding capabilities (weather, calculator, API calls) to an LLM.
- Defining tools using the `tool()` helper and Zod schemas.
- Implementing "God Mode" or multi-step agentic loops (`maxSteps`, `stopWhen`).
- Debugging tool call errors or schema validation issues.

## Core Principles
1.  **Use `tool()` Helper**: Always wrap tool definitions in `tool()` for better type inference and provider compatibility.
2.  **Strict Mode**: Enable `strict: true` for providers (like OpenAI/Anthropic) that support Structured Outputs to guarantee schema adherence.
3.  **Descriptive Schemas**: Use `.describe()` in Zod to give the LLM semantic context about parameters.
4.  **Multi-Step**: Tools often require `maxSteps` (or `stopWhen`) to allow the LLM to see the result and generate a final answer.

## Usage Style for AI Agent

### 1. Basic Tool Definition
Define tools with explicit Zod schemas and async execution logic.

```typescript
import { tool, generateText } from 'ai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4o'),
  tools: {
    getWeather: tool({
      description: 'Get weather for a location',
      parameters: z.object({
        location: z.string().describe('The city and state, e.g. San Francisco, CA'),
      }),
      execute: async ({ location }) => {
        return { temp: 72, condition: 'Sunny' };
      },
    }),
  },
  maxSteps: 5, // Important: Allow tool roundtrip
  prompt: 'What is the weather in SF?',
});
```

### 2. Strict Mode (Reliability)
For supported providers, enforce strict schema matching.

```typescript
tool({
  description: 'Update user profile',
  parameters: z.object({
    userId: z.string(),
    email: z.string().email(),
  }),
  strict: true, // Enforces exact JSON schema match
  execute: async ({ userId, email }) => { ... }
});
```

### 3. Handling Tool Results (Generative UI)
When streaming, handle tool results on the client or server.

```typescript
// Server
const result = streamText({
  // ...tools...
  onStepFinish: ({ toolCalls, toolResults }) => {
    // Log or trace tool execution
  }
});

// Client (generative UI)
// Tools are automatically handled if you return the stream
```

### 4. Dynamic Approvals (Human-in-the-loop)
Require user confirmation for sensitive actions.

```typescript
tool({
  description: 'Delete database record',
  parameters: z.object({ id: z.string() }),
  needsApproval: true, // Pauses execution for user signal
  execute: async ({ id }) => { ... }
});
```

## Common Pitfalls
- **Missing `maxSteps`**: If you don't set `maxSteps > 1`, the model will call the tool but never see the result or generate a final answer.
- **Zod Description**: Omitted `.describe()` leads to poorer LLM performance. Always explain *what* the parameter is.
- **Provider Support**: `strict: true` fails on providers that don't support it. Check compatibility.
