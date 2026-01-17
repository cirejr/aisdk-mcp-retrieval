---
name: ai-sdk-core
description: Use the Vercel AI SDK Core to generate text, structured data, embeddings, images, and audio. Ideal for building AI-powered applications, handling tool calls, and managing provider registries.
metadata:
  version: "1.0"
---

# AI SDK Core Skill

This skill provides instructions for using the Vercel AI SDK Core to interact with language, image, and embedding models.

## How to use this skill

1.  **Identify the Task**: Determine if the user needs to generate text, stream data, create structured objects, or handle multimedia (audio/images).
2.  **Select the Function**: 
    - For core generation tasks, refer to [Main Functions](references/main-functions.md).
    - For utilities, schemas, or middleware, refer to [Helper Functions](references/helper-functions.md).
3.  **Implementation**: Use the imported functions from `ai` or `@ai-sdk/core`.

## Basic Example: Text Generation

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Write a short poem about coding.',
});
