# createUIMessageStreamResponse()

## Purpose

`createUIMessageStreamResponse` wraps a **UI message stream** into a standard Web `Response` object.

Use this when:

* you are in a Web / Edge / Next.js Route Handler
* you already have a `ReadableStream<UIMessageChunk>`
* you want proper headers, status, and SSE handling

This is the **Web-standard counterpart** to `pipeUIMessageStreamToResponse`.

---

## Mental Model

* Input: `ReadableStream<UIMessageChunk>`
* Output: `Response`

Think of it as:

> “Finalize my UI stream into a real HTTP response.”

---

## Typical Usage

```ts
const response = createUIMessageStreamResponse({
  stream,
  status: 200,
  headers: {
    'Cache-Control': 'no-store',
  },
});
```

---

## Parameters

### `stream`

* Type: `ReadableStream<UIMessageChunk>`
* Required

Usually created via `createUIMessageStream()` or `streamText().toUIMessageStream()`.

---

### `status`

* Type: `number`
* Default: `200`

HTTP status code.

---

### `statusText`

* Type: `string`

Optional HTTP status text.

---

### `headers`

* Type: `Headers | Record<string, string>`

Used for:

* SSE headers
* CORS
* caching
* auth propagation

---

### `consumeSseStream`

Optional hook to tap into the SSE stream:

* stream is **teed**
* does not affect the client

Useful for:

* logging
* analytics
* mirroring to another consumer

---

## Returns

* `Response`

A fully configured streaming HTTP response.

---

## Common Use Cases

* Next.js Route Handlers (`app/api/*/route.ts`)
* Edge Functions
* Web-native runtimes (Deno, Bun)

---

## Common Pitfalls

* Using this in Node `http.ServerResponse` (wrong API)
* Forgetting SSE headers when manually overriding

---

## When to Use Something Else

| Environment         | Use                             |
| ------------------- | ------------------------------- |
| Node.js HTTP server | `pipeUIMessageStreamToResponse` |
| UI stream creation  | `createUIMessageStream`         |
| Stream consumption  | `readUIMessageStream`           |


const existingMessages: UIMessage[] = [
  /* ... */
];

const stream = createUIMessageStream({
  async execute({ writer }) {
    // Start a text message
    // Note: The id must be consistent across text-start, text-delta, and text-end steps
    // This allows the system to correctly identify they belong to the same text block
    writer.write({
      type: 'text-start',
      id: 'example-text',
    });

    // Write a message chunk
    writer.write({
      type: 'text-delta',
      id: 'example-text',
      delta: 'Hello',
    });

    // End the text message
    writer.write({
      type: 'text-end',
      id: 'example-text',
    });

    // Merge another stream from streamText
    const result = streamText({
      model: google("gemini-2.5-flash-image-preview"),
      prompt: 'Write a haiku about AI',
    });

    writer.merge(result.toUIMessageStream());
  },
  onError: error => `Custom error: ${error.message}`,
  originalMessages: existingMessages,
  onFinish: ({ messages, isContinuation, responseMessage }) => {
    console.log('Stream finished with messages:', messages);
  },
});
