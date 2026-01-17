# readUIMessageStream()

## Purpose

`readUIMessageStream` converts a **low-level UIMessageChunk stream** into a **high-level async stream of UIMessage objects**.

Use this when:

* you need message-level semantics
* consuming streams outside of Chat UI
* building terminals, RSCs, or custom renderers

---

## Mental Model

* Input: `ReadableStream<UIMessageChunk>`
* Output: `AsyncIterableStream<UIMessage>`

Think of it as:

> “Reconstruct full messages from streaming chunks.”

---

## Typical Usage

```ts
for await (const message of readUIMessageStream({ stream })) {
  render(message);
}
```

---

## Parameters

### `stream`

* Type: `ReadableStream<UIMessageChunk>`
* Required

The raw UI message stream.

---

### `message`

* Type: `UIMessage`
* Optional

Used when resuming an interrupted stream.

---

### `onError`

* Type: `(error: unknown) => void`

Called when stream processing fails.

---

### `terminateOnError`

* Type: `boolean`
* Default: `false`

If true, stops iteration immediately on error.

---

## Returns

* `AsyncIterableStream<UIMessage>`

Each yielded value represents a **progressively updated version** of the same message.

---

## Common Use Cases

* Terminal UIs
* React Server Components
* Custom streaming renderers
* Non-chat streaming UIs

---

## Common Pitfalls

* Expecting multiple messages per iteration
* Forgetting messages mutate over time
* Mixing chunk-level and message-level APIs

---

## When to Use Something Else

| Need                | Use                             |
| ------------------- | ------------------------------- |
| Create streams      | `createUIMessageStream`         |
| Send HTTP responses | `createUIMessageStreamResponse` |
| Node.js HTTP piping | `pipeUIMessageStreamToResponse` |
