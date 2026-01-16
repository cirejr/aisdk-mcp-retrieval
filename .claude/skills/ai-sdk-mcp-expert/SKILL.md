---
name: ai-sdk-mcp-expert
description: Specialized expertise for integrating Model Context Protocol (MCP) with Vercel AI SDK. Use when setting up MCP clients, defining tools with schemas, or using resources/prompts via the AI SDK.
license: MIT
version: 1.0.0
---

# AI SDK MCP Expert Skill

## When to Use
- Initializing MCP clients in a Next.js/Node.js environment.
- Defining tools (`mcpClient.tools()`) with explicit Zod schemas.
- Fetching resources or prompts from an MCP server.
- Configuring transports (HTTP vs SSE vs Stdio).

## Core Principles
1.  **Use HTTP Transport for Production**: Always prefer `StreamableHTTPClientTransport` over `stdio` for deployable apps.
2.  **Explicit Tool Schemas**: Use the `schemas` property in `mcpClient.tools()` to define rigid Zod schemas. Do not rely on "Schema Discovery" unless prototyping.
3.  **Typed Tool Outputs**: Define `outputSchema` when the server returns structured content to ensure full E2E type safety.
4.  **Resource Handling**: Resources are application-driven (fetched by the app), whereas tools are model-driven (called by the LLM).

## Usage Style for AI Agent

### 1. Initializing the Client
Use the `streamableHttp` transport from `@modelcontextprotocol/sdk`.

```typescript
import { createMCPClient } from '@ai-sdk/mcp';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// RECOMMENDED: HTTP Transport for production
const mcpClient = await createMCPClient({
  transport: new StreamableHTTPClientTransport(new URL('https://your-mcp-server.com'), {
    sessionId: 'session_123', // Optional but good for stateful connections
    headers: { Authorization: 'Bearer ...' }
  }),
});
```

### 2. Defining Typed Tools
Avoid auto-discovery. Define input/output schemas explicitly.

```typescript
import { z } from 'zod';

const tools = await mcpClient.tools({
  schemas: {
    'get-weather': {
      inputSchema: z.object({
        location: z.string(),
      }),
      // CRITICAL: Define outputSchema for typed results if server supports it
      outputSchema: z.object({
        temperature: z.number(),
        conditions: z.string(),
      }),
    },
  },
});

// Result is now fully typed
const result = await tools['get-weather'].execute({ location: 'NYC' });
console.log(result.temperature); // Typed number
```

### 3. Using Resources
Fetch resources via URI.

```typescript
const resource = await mcpClient.readResource({ uri: 'file:///data/report.txt' });
// resource.contents[0].text
```

### 4. Handling Elicitation (User Input)
If the server requires user input mid-execution.

```typescript
mcpClient.onElicitationRequest(async (request) => {
  // logic to get user input
  return { action: 'accept', content: userInput };
});
```

## Common Pitfalls
- **Closing the Client**: Always ensure `mcpClient.close()` is called, especially in serverless functions (use `try/finally` or `onFinish` in `streamText`).
- **Stdio vs HTTP**: Never use `StdioClientTransport` in Vercel/Next.js production deployments; it only works locally.
- **Type Safety**: If you omit `schemas`, you lose TypeScript support for tool arguments and results.
