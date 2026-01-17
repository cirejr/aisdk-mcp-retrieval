# AI SDK UI Skill

This skill provides comprehensive guidance for building AI-powered user interfaces using the Vercel AI SDK UI hooks and components.

## Overview

The AI SDK UI is a set of React hooks and components designed to simplify the creation of conversational AI interfaces. It handles the complexity of streaming responses, message state management, tool integration, and accessibility concerns out of the box.

## Key Features Covered

### Core Hooks
- **useChat**: Primary hook for building chat interfaces with conversation history
- **useCompletion**: Single-turn text generation without conversation memory
- **useObject**: Structured data generation with schema validation

### Advanced Patterns
- **Streaming Architecture**: Custom streaming implementations and message processing
- **Performance Optimization**: Message pruning, caching, and virtual scrolling
- **Tool Integration**: Handling tool calls and displaying tool-specific UI
- **Error Handling**: Robust error boundaries and recovery mechanisms

### Accessibility & Testing
- **ARIA Implementation**: Screen reader support and keyboard navigation
- **Testing Strategies**: Hook testing with React Testing Library
- **Integration Testing**: End-to-end UI component testing

## When to Use This Skill

Use this AI SDK UI skill when you are:

1. **Building Chat Interfaces**: Creating conversational UIs with message history
2. **Implementing Streaming**: Handling real-time AI responses and updates
3. **Tool Integration**: Displaying tool calls and their results in the UI
4. **Performance Optimization**: Managing large conversation histories efficiently
5. **Accessibility Compliance**: Ensuring your AI interface is accessible to all users
6. **Error Recovery**: Implementing robust error handling and retry logic
7. **Testing AI Components**: Writing tests for AI-powered UI components

## File Structure

This skill is organized with the following structure:

```
ai-sdk-ui/
├── SKILL.md              # Main skill documentation
├── README.md             # This overview file
└── references/           # Detailed reference documentation
    ├── hooks/           # Individual hook documentation
    │   ├── use-chat.md
    │   ├── use-completion.md
    │   ├── use-object.md
    │   ├── convert-to-model-messages.md
    │   ├── prune-messages.md
    │   ├── create-ui-message-stream.md
    │   ├── create-ui-message-stream-response.md
    │   ├── pipe-ui-message-stream-to-response.md
    │   └── read-ui-message-stream.md
    ├── streaming.md      # Streaming architecture and patterns
    └── patterns.md      # Common UI patterns and best practices
```

## Integration with Other Skills

This skill works well with:

- **ai-sdk-usage-prompt**: For designing prompts that drive the UI
- **ai-sdk-tool-calling**: For implementing tool-based interactions
- **ai-sdk-tool-calling-usage**: For understanding tool integration patterns
- **ai-sdk-mcp-expert**: For MCP server integration with UI components

## Common Use Cases

### Chat Applications
Build full-featured chat interfaces with:
- Message history and threading
- Real-time streaming responses
- Tool call visualization
- Error handling and retry mechanisms

### Content Generation
Create interfaces for:
- Blog post generation
- Code completion
- Image generation with prompts
- Structured data extraction

### AI-Powered Forms
Build forms that:
- Auto-complete based on AI suggestions
- Validate input using AI
- Generate content dynamically
- Provide contextual help

## Getting Started

1. **Install Dependencies**: Ensure you have `@ai-sdk/react` installed
2. **Choose Your Hook**: Select the appropriate hook for your use case
3. **Implement Error Handling**: Always include error boundaries
4. **Add Accessibility**: Ensure ARIA labels and keyboard navigation
5. **Test Thoroughly**: Write tests for both hooks and components

## Best Practices

1. **Start Simple**: Begin with basic useChat implementation
2. **Add Features Incrementally**: Layer in complexity as needed
3. **Test Early**: Write tests alongside your implementation
4. **Consider Accessibility**: Design for all users from the start
5. **Optimize Performance**: Use pruning and virtualization for scale
6. **Handle Errors Gracefully**: Provide clear feedback and recovery options

This skill serves as your comprehensive guide to building professional-grade AI interfaces with the Vercel AI SDK UI toolkit.