# Helper Functions Reference

Utility functions for schema definition, middleware, and connectivity.

### Core Helpers
- `tool()`: Type inference helper for defining tools.
- `jsonSchema()` / `zodSchema()`: Create compatible schema objects for structured output.
- `createMCPClient()`: Connect to Model Context Protocol servers.
- `createProviderRegistry()`: Manage multiple AI providers (OpenAI, Anthropic, etc.) in one place.

### Middleware & Streaming
- `wrapLanguageModel()`: Apply custom middleware to model calls.
- `extractReasoningMiddleware()`: Separate thinking/reasoning from the final text output.
- `smoothStream()`: Enhances the visual flow of streaming text.
- `simulateStreamingMiddleware()`: Makes non-streaming models appear to stream.

### Utilities
- `cosineSimilarity()`: Measure the distance between two embedding vectors.
- `generateId()`: Create unique identifiers for messages or runs.
- `createIdGenerator()`: Customize how IDs are generated.
- `simulateReadableStream()`: Test streaming logic with configurable delays.
