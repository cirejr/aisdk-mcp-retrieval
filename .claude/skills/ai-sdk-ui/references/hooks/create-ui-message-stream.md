# createUIMessageStream

The `createUIMessageStream` function lets you manually construct and control a **UI message stream**. It is the lowest-level primitive for sending structured, incremental UI messages to the client and is the foundation for advanced streaming use cases.

It supports:

* Incremental message construction (start / delta / end)
* Merging other UI message streams
* Error interception and transformation
* Message persistence and continuation handling
* Finish callbacks with full message context

This hook is typically used on the **server**.

---

## Import

```ts
import { createUIMessageStream } from "ai";
```

---

## Basic Example

```ts
import { createUIMessageStream } from "ai";

const stream = createUIMessageStream({
  async execute({ writer }) {
    writer.write({
      type: "text-start",
      id: "greeting",
    });

    writer.write({
      type: "text-delta",
      id: "greeting",
      delta: "Hello world",
    });

    writer.write({
      type: "text-end",
      id: "greeting",
    });
  },
});
```

The returned value is a `ReadableStream<UIMessageChunk>` that can be sent directly to the client.

---

## Full Example (Advanced)

```ts
import { createUIMessageStream, streamText } from "ai";

const existingMessages: UIMessage[] = [];

const stream = createUIMessageStream({
  async execute({ writer }) {
    // Start a new text block
    writer.write({
      type: "text-start",
      id: "example-text",
    });

    writer.write({
      type: "text-delta",
      id: "example-text",
      delta: "Hello",
    });

    writer.write({
      type: "text-end",
      id: "example-text",
    });

    // Merge another UI message stream
    const result = streamText({
      model: __MODEL__,
      prompt: "Write a haiku about AI",
    });

    writer.merge(result.toUIMessageStream());
  },

  onError: error => `Custom error: ${String(error)}`,

  originalMessages: existingMessages,

  onFinish: ({ messages, isContinuation, responseMessage }) => {
    console.log("Final messages:", messages);
    console.log("Is continuation:", isContinuation);
    console.log("Response message:", responseMessage);
  },
});
```

---

## Mental Model

Think of `createUIMessageStream` as:

> **A programmable writer for UI messages that emits a readable stream.**

Instead of returning a single response, you:

1. Open a message block
2. Stream content incrementally
3. Close the message
4. Optionally merge other streams

The client reconstructs UI messages from the emitted chunks.

---

## Message Chunk Lifecycle

For text messages, chunks must follow this sequence:

1. `text-start` (opens a message block)
2. One or more `text-delta` chunks
3. `text-end` (closes the block)

⚠️ **The `id` must remain the same across all chunks** so the client knows they belong together.

---

## API Signature

### Parameters

#### `execute`

```ts
(options: { writer: UIMessageStreamWriter }) => Promise<void> | void
```

Receives a `writer` used to emit or merge UI message chunks.

##### `writer.write`

```ts
(part: UIMessageChunk) => void
```

Writes a single UI message chunk to the stream.

##### `writer.merge`

```ts
(stream: ReadableStream<UIMessageChunk>) => void
```

Merges another UI message stream into this one.

##### `writer.onError`

```ts
(error: unknown) => string
```

Handles errors coming from merged streams.

---

#### `onError`

```ts
(error: unknown) => string
```

Global error handler for the stream. The returned string is sent as an error message.

---

#### `originalMessages`

```ts
UIMessage[] | undefined
```

If provided, the stream enters **persistence mode**:

* Message IDs are preserved
* Responses may extend the last message instead of creating a new one

---

#### `onFinish`

```ts
(options: {
  messages: UIMessage[];
  isContinuation: boolean;
  responseMessage: UIMessage;
}) => void
```

Called when the stream finishes.

* `messages`: full updated message list
* `isContinuation`: whether the response extended an existing message
* `responseMessage`: the message sent to the client

---

#### `generateId`

```ts
IdGenerator | undefined
```

Custom function for generating message IDs.

---

## Returns

```ts
ReadableStream<UIMessageChunk>
```

A readable stream that:

* Emits UI message chunks
* Handles merging and cleanup automatically
* Propagates and transforms errors correctly

---

## When to Use

Use `createUIMessageStream` when you need:

* Fine-grained control over UI messages
* Multiple concurrent or merged AI streams
* Custom streaming protocols
* Advanced persistence or continuation logic

---

## When NOT to Use

Avoid this function if:

* `useChat` or `useCompletion` already fits your needs
* You do not need manual message control
* You want minimal server-side logic

---

## Related APIs

* `useChat`
* `createUIMessageStreamResponse`
* `pipeUIMessageStreamToResponse`
* `readUIMessageStream`

---

## Agent Usage Notes

For coding agents:

* Always preserve chunk order
* Never reuse message IDs across unrelated messages
* Prefer merging AI-generated streams instead of re-implementing token streaming
* Use `onFinish` to synchronize persistence or side effects
