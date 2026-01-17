# AI SDK Usage Prompt Expert

Expert guidance on using AI SDK prompts for effective LLM interaction. Use when designing, implementing, or optimizing prompts with the Vercel AI SDK.

## Core Concepts

### Text Prompts
- Simple strings for basic generation use cases
- Use template literals for dynamic data injection
- Ideal for repeated content generation with variations
- Set via `prompt` property in `generateText`, `streamText`, `generateObject`

### System Prompts
- Initial instructions that guide and constrain model behavior
- Set via `system` property, works with both `prompt` and `messages`
- Alternative: use system messages in message arrays
- Best for establishing role, tone, and behavioral constraints

### Message Prompts
- Arrays of user, assistant, and tool messages
- Essential for chat interfaces and complex multi-modal prompts
- Set via `messages` property
- Each message has `role` and `content` properties

## Content Types

### User Messages
- **Text Parts**: Simple string content or array with `{type: 'text', text: '...'}`
- **Image Parts**: Support base64, binary (Buffer/Uint8Array/ArrayBuffer), or URLs
- **File Parts**: Various MIME types (PDF, audio, etc.) with `mediaType` specification
- **Multi-part**: Combine multiple content types in single message

### Assistant Messages
- **Text Content**: Simple strings or arrays with `{type: 'text', text: '...'}`
- **Tool Calls**: `{type: 'tool-call', toolCallId, toolName, input}`
- **Generated Files**: `{type: 'file', mediaType, data}` for model-generated content

### Tool Messages
- **Tool Results**: `{type: 'tool-result', toolCallId, toolName, output}`
- **Multi-modal Results**: Use `experimental_content` for complex tool outputs
- **Parallel Tool Calls**: Multiple tool results in single message

## Provider Options

### Function Call Level
```ts
const { text } = await generateText({
  model: provider('model'),
  providerOptions: {
    openai: { reasoningEffort: 'low' },
    anthropic: { maxTokens: 1000 },
  },
});
```

### Message Level
```ts
const messages: ModelMessage[] = [
  {
    role: 'system',
    content: 'Cached system message',
    providerOptions: {
      anthropic: { cacheControl: { type: 'ephemeral' } },
    },
  },
];
```

### Message Part Level
```ts
const messages: ModelMessage[] = [
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: 'Describe the image.',
        providerOptions: {
          openai: { imageDetail: 'low' },
        },
      },
      {
        type: 'image',
        image: 'https://example.com/image.jpg',
        providerOptions: {
          openai: { imageDetail: 'low' },
        },
      },
    ],
  },
];
```

## Best Practices

### Prompt Structure
1. **System First**: Always start with clear system instructions
2. **Context Building**: Use template literals for dynamic content
3. **Role Consistency**: Maintain consistent user/assistant roles in conversations
4. **Tool Integration**: Ensure tool calls and results match IDs correctly

### Multi-modal Handling
- Check model capabilities before using images/files
- Use appropriate media types for file content
- Consider file size and format limitations
- Implement proper error handling for unsupported content

### Provider Compatibility
- Verify model supports all used features (tools, images, files)
- Use `convertToModelMessages` for UI hooks compatibility
- Apply provider options at appropriate granularity level
- Handle provider-specific limitations gracefully

## Advanced Features

### Custom Download Functions
```ts
const result = await generateText({
  model: __MODEL__,
  experimental_download: async (requestedDownloads) => {
    // Custom download logic with throttling, retries, authentication
  },
  messages: [...],
});
```

### Caching Strategies
- Use provider-specific cache control options
- Implement message-level caching for repeated content
- Consider ephemeral vs persistent caching needs

### Error Handling
- Validate message structure before sending
- Handle provider-specific error responses
- Implement fallback strategies for unsupported features
- Log debugging information for prompt troubleshooting

## Integration Patterns

### Chat Applications
- Use message prompts for conversation history
- Maintain consistent message ordering
- Handle streaming responses appropriately
- Implement proper message state management

### Content Generation
- Use text prompts with template literals
- Implement dynamic prompt composition
- Handle generation limits and constraints
- Provide clear generation parameters

### Tool-Heavy Workflows
- Design clear tool schemas
- Match tool calls with results using IDs
- Handle parallel tool execution
- Implement proper tool result formatting

## Common Pitfalls

1. **Message Order**: Incorrect role sequence breaks conversation flow
2. **Tool ID Mismatch**: Tool calls and results must have matching IDs
3. **Provider Limits**: Exceeding model-specific constraints
4. **Format Errors**: Incorrect message structure or content types
5. **Missing System Prompts**: Uncontrolled model behavior without guidance

## Testing and Validation

- Test prompts with various model providers
- Validate message structure before API calls
- Implement proper error handling and logging
- Test edge cases (empty content, large files, unsupported types)
- Verify tool integration end-to-end

Use this skill to ensure robust, efficient, and maintainable prompt implementations with the Vercel AI SDK.