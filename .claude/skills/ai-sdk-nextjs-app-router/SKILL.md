---
name: ai-sdk-nextjs-app-router
description: Expert guidance on building chat UIs with Vercel AI SDK in Next.js App Router. Use when implementing useChat, streaming responses, or integrating tools.
license: MIT
version: 1.0.0
---

# AI SDK Next.js App Router Skill

## When to Use
- Building chat interfaces with Next.js App Router
- Using `useChat` hook from `@ai-sdk/react`
- Implementing streaming responses via `streamText`
- Adding tools (function calling) to chat

## Core Principles
1.  **Use `@ai-sdk/react`**: Import `useChat` from `@ai-sdk/react`, NOT `ai/react`.
2.  **UIMessage Format**: Messages use `parts` array, not a single `content` string.
3.  **Route Handler**: Use `toUIMessageStreamResponse()` for proper streaming.
4.  **Multi-Step Tools**: Set `stopWhen: stepCountIs(N)` to allow tool result processing.

## Usage Style for AI Agent

### 1. Route Handler (`app/api/chat/route.ts`)

```typescript
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { ollama } from 'ai-sdk-ollama'; // Or your provider
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: ollama('gemma3:4b'),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // Allow multi-step tool calls
    tools: {
      weather: tool({
        description: 'Get weather for a location',
        inputSchema: z.object({
          location: z.string().describe('City name'),
        }),
        execute: async ({ location }) => ({ location, temp: 72 }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

### 2. Client Page (`app/page.tsx`)

```tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <span key={i}>{part.text}</span>;
              case 'tool-weather': // Tool parts are named tool-{toolName}
                return <pre key={i}>{JSON.stringify(part, null, 2)}</pre>;
            }
          })}
        </div>
      ))}

      <form onSubmit={e => {
        e.preventDefault();
        sendMessage({ text: input });
        setInput('');
      }}>
        <input value={input} onChange={e => setInput(e.target.value)} />
      </form>
    </div>
  );
}
```

## Key Differences from Legacy API
| Legacy (`ai/react`) | Current (`@ai-sdk/react`) |
|---------------------|---------------------------|
| `message.content` | `message.parts[].text` |
| `handleSubmit(e)` | `sendMessage(msg)` - accepts `CreateUIMessage` or `string` |
| `input, handleInputChange` | Manage input state yourself with `useState` |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` |

## useChat Returns
- `messages`: `UIMessage[]` - Current chat messages
- `status`: `'submitted' | 'streaming' | 'ready' | 'error'`
- `sendMessage(msg, options?)`: Send a message (string or `{ text, ... }`)
- `regenerate(options?)`: Regenerate last assistant message
- `stop()`: Abort current streaming response
- `setMessages(msgs)`: Update messages locally
- `addToolOutput(...)`: Add tool result to chat

## Common Pitfalls
- **Wrong Import**: Using `ai/react` instead of `@ai-sdk/react` causes build errors.
- **No Input State**: `useChat` no longer manages input; use `useState` yourself.
- **Accessing Content**: `message.content` is undefined; use `message.parts`.
- **Missing `stopWhen`**: Without it, tool results aren't sent back to the model.
- **Tool Part Names**: Tool parts are `tool-{toolName}`, not just `{toolName}`.
