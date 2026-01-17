# pipeUIMessageStreamToResponse()

## Purpose

`pipeUIMessageStreamToResponse` pipes a **UI message stream** directly into a **Node.js `ServerResponse`**.

Use this when:

* running in Node.js (not Edge)
* using `http` / `https`
* working with custom servers or frameworks

This is the **Node equivalent** of `createUIMessageStreamResponse`.

---

## Mental Model

* Input: `ReadableStream<UIMessageChunk>`
* Target: `ServerResponse`

Think of it as:

> “Bridge Web streams into Node’s response system.”

---

## Typical Usage

```ts
pipeUIMessageStreamToResponse({
  response: res,
  stream,
  status: 200,
  headers: {
    'Content-Type': 'text/event-stream',
  },
});
```

---

## Parameters

### `response`

* Type: `ServerResponse`
* Required

The Node.js response object.

---

### `stream`

* Type: `ReadableStream<UIMessageChunk>`
* Required

Usually produced by `createUIMessageStream` or `streamText`.

---

### `status`

* Type: `number`

HTTP status code.

---

### `statusText`

* Type: `string`

Optional status message.

---

### `headers`

* Type: `Headers | Record<string, string>`

Common headers:

* `Content-Type: text/event-stream`
* `Cache-Control: no-store`

---

### `consumeSseStream`

Optional observer for the SSE stream.

* Receives a **teed copy**
* Safe for logging or analytics

---

## Returns

* `void`

The response is streamed and ended automatically.

---

## Common Use Cases

* Custom Node servers
* Express / Fastify adapters
* Non-Web runtimes

---

## Common Pitfalls

* Using this in Edge runtimes
* Writing to `response` manually after piping

---

## When to Use Something Else

| Environment     | Use                             |
| --------------- | ------------------------------- |
| Web / Edge      | `createUIMessageStreamResponse` |
| Stream creation | `createUIMessageStream`         |
| Stream parsing  | `readUIMessageStream`           |
