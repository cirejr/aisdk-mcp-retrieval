# convertToModelMessages Function

The `convertToModelMessages` function converts UI messages to core messages, enabling compatibility between UI hooks and core AI SDK functions. This is essential when you need to use UI messages with functions like `streamText` or `generateText`.

## Basic Usage

```ts
import { useChat, convertToModelMessages } from '@ai-sdk/react';
import { streamText } from 'ai';

export default function EnhancedChat() {
  const { messages, handleSubmit } = useChat({
    api: '/api/chat',
  });

  const handleAdvancedSubmit = async (e) => {
    e.preventDefault();
    
    // Convert UI messages to core messages
    const coreMessages = await convertToModelMessages(messages);
    
    // Use with core SDK functions
    const result = await streamText({
      model: yourModel,
      messages: coreMessages,
      tools: yourTools,
    });
    
    // Process stream...
  };

  return (
    <div>
      {/* Chat interface */}
      <form onSubmit={handleAdvancedSubmit}>
        {/* Form elements */}
      </form>
    </div>
  );
}
```

## Purpose and Use Cases

### Why Convert Messages?

UI hooks return `UIMessage` objects while core functions expect `ModelMessage` objects:

```ts
// UI Message (from useChat)
interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  toolInvocations?: ToolInvocation[];
}

// Core Message (for streamText/generateText)
interface ModelMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | ContentPart[];
  toolCallId?: string;
  toolName?: string;
  toolArgs?: any;
}
```

### Common Scenarios

1. **Tool Processing**: Apply provider options to tool messages
2. **Message Filtering**: Filter or modify messages before sending
3. **Custom API Calls**: Use UI messages with custom API logic
4. **Message Analysis**: Analyze conversation before processing
5. **Advanced Routing**: Route messages to different models based on content

## Advanced Patterns

### Tool Message Enhancement

```ts
function EnhancedToolChat() {
  const { messages, handleSubmit } = useChat({
    api: '/api/chat',
  });

  const handleEnhancedSubmit = async () => {
    const coreMessages = await convertToModelMessages(messages, {
      // Apply provider options to tool messages
      providerOptions: {
        openai: { 
          // Add caching for tool messages
          tool_choice: 'auto',
          temperature: 0.1,
        },
      },
    });

    // Use enhanced messages with core SDK
    const result = await streamText({
      model: openai('gpt-4'),
      messages: coreMessages,
    });

    return result.toUIMessageStreamResponse();
  };

  return (
    <div>
      <ChatInterface 
        messages={messages} 
        onSubmit={handleEnhancedSubmit}
      />
    </div>
  );
}
```

### Message Filtering and Processing

```ts
function FilteredChat() {
  const { messages, handleSubmit } = useChat({
    api: '/api/chat',
  });

  const handleFilteredSubmit = async () => {
    const coreMessages = await convertToModelMessages(messages);
    
    // Filter messages
    const filteredMessages = coreMessages
      .filter(msg => msg.role !== 'system' || msg.content.length < 1000)
      .map(msg => {
        // Process content if needed
        if (msg.role === 'user') {
          return {
            ...msg,
            content: msg.content.replace(/\b(password|secret)\b/gi, '[REDACTED]')
          };
        }
        return msg;
      });

    const result = await streamText({
      model: yourModel,
      messages: filteredMessages,
    });

    return result.toUIMessageStreamResponse();
  };

  return <ChatComponent onSubmit={handleFilteredSubmit} />;
}
```

### Multi-Model Routing

```ts
function MultiModelChat() {
  const { messages, handleSubmit } = useChat({
    api: '/api/chat',
  });

  const routeToModel = async (messages) => {
    const coreMessages = await convertToModelMessages(messages);
    
    // Analyze content to determine best model
    const lastUserMessage = coreMessages.reverse().find(m => m.role === 'user');
    const content = lastUserMessage?.content || '';
    
    let selectedModel;
    if (content.includes('code') || content.includes('programming')) {
      selectedModel = openai('gpt-4'); // Good for coding
    } else if (content.includes('creative') || content.includes('write')) {
      selectedModel = anthropic('claude-3-sonnet'); // Good for creative tasks
    } else {
      selectedModel = google('gemini-pro'); // General purpose
    }

    return streamText({
      model: selectedModel,
      messages: coreMessages,
    });
  };

  const handleSubmitWithRouting = async (e) => {
    e.preventDefault();
    
    const result = await routeToModel(messages);
    return result.toUIMessageStreamResponse();
  };

  return (
    <form onSubmit={handleSubmitWithRouting}>
      {/* Chat form */}
    </form>
  );
}
```

### Message Augmentation

```ts
function AugmentedChat() {
  const { messages, handleSubmit } = useChat({
    api: '/api/chat',
  });

  const handleAugmentedSubmit = async () => {
    const coreMessages = await convertToModelMessages(messages);
    
    // Add context or metadata
    const augmentedMessages = [
      {
        role: 'system',
        content: `Current date: ${new Date().toISOString()}
User preferences: ${JSON.stringify(getUserPreferences())}
Available tools: ${JSON.stringify(getAvailableTools())}`,
        providerOptions: {
          anthropic: { cacheControl: { type: 'ephemeral' } },
        },
      },
      ...coreMessages,
    ];

    const result = await streamText({
      model: yourModel,
      messages: augmentedMessages,
    });

    return result.toUIMessageStreamResponse();
  };

  return <ChatComponent onSubmit={handleAugmentedSubmit} />;
}
```

## Configuration Options

### Conversion Options

```ts
const coreMessages = await convertToModelMessages(uiMessages, {
  // Apply provider options to specific message types
  providerOptions: {
    openai: {
      // Options applied to all messages
      max_tokens: 2000,
      temperature: 0.7,
    },
    anthropic: {
      // Cache control for specific message types
      cacheControl: (message) => 
        message.role === 'system' ? { type: 'ephemeral' } : undefined,
    },
  },
  
  // Custom message transformation
  transform: (message) => {
    // Modify messages during conversion
    if (message.role === 'user') {
      return {
        ...message,
        content: enhanceUserContent(message.content),
      };
    }
    return message;
  },
  
  // Filter messages during conversion
  filter: (message) => {
    // Remove unwanted messages
    return message.role !== 'system' || 
           message.content.trim().length > 0;
  },
});
```

### Tool Message Handling

```ts
const coreMessages = await convertToModelMessages(uiMessages, {
  // Handle tool invocations specially
  handleToolInvocations: (toolInvocations) => {
    return toolInvocations.map(invocation => ({
      role: 'assistant',
      content: [
        {
          type: 'tool-call',
          toolCallId: invocation.toolCallId,
          toolName: invocation.toolName,
          args: invocation.args,
        },
      ],
      providerOptions: {
        // Tool-specific options
        openai: { tool_choice: 'auto' },
      },
    }));
  },
});
```

## Error Handling

### Conversion Errors

```ts
async function safeConvertMessages(uiMessages) {
  try {
    const coreMessages = await convertToModelMessages(uiMessages);
    return { success: true, messages: coreMessages };
  } catch (error) {
    console.error('Message conversion failed:', error);
    
    // Fallback: create simple messages
    const fallbackMessages = uiMessages.map(msg => ({
      role: msg.role,
      content: msg.content || '',
    }));
    
    return { success: false, messages: fallbackMessages, error };
  }
}

function RobustChat() {
  const { messages, handleSubmit } = useChat({ api: '/api/chat' });

  const handleSafeSubmit = async () => {
    const { success, messages: coreMessages, error } = 
      await safeConvertMessages(messages);
    
    if (!success) {
      console.warn('Using fallback message conversion:', error);
      // Could show user notification here
    }

    const result = await streamText({
      model: yourModel,
      messages: coreMessages,
    });

    return result.toUIMessageStreamResponse();
  };

  return <ChatComponent onSubmit={handleSafeSubmit} />;
}
```

## Performance Considerations

### Caching Converted Messages

```ts
function CachedMessageConverter() {
  const [messageCache, setMessageCache] = useState(new Map());
  
  const convertWithCache = async (uiMessages) => {
    const cacheKey = JSON.stringify(uiMessages.map(m => m.id));
    
    if (messageCache.has(cacheKey)) {
      return messageCache.get(cacheKey);
    }

    const coreMessages = await convertToModelMessages(uiMessages);
    setMessageCache(prev => new Map(prev).set(cacheKey, coreMessages));
    
    return coreMessages;
  };

  return { convertWithCache };
}
```

### Batch Processing

```ts
function BatchMessageProcessor() {
  const [messageQueue, setMessageQueue] = useState([]);
  
  const processBatch = async (batches) => {
    const results = await Promise.all(
      batches.map(async (messages) => {
        const coreMessages = await convertToModelMessages(messages);
        return processWithModel(coreMessages);
      })
    );
    
    return results;
  };

  const addToQueue = (messages) => {
    setMessageQueue(prev => [...prev, messages]);
  };

  return { addToQueue, processBatch };
}
```

## Testing

### Unit Testing

```ts
import { convertToModelMessages } from '@ai-sdk/react';

describe('convertToModelMessages', () => {
  it('should convert basic UI messages to core messages', async () => {
    const uiMessages = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there!' },
    ];

    const coreMessages = await convertToModelMessages(uiMessages);

    expect(coreMessages).toHaveLength(2);
    expect(coreMessages[0]).toMatchObject({
      role: 'user',
      content: 'Hello',
    });
    expect(coreMessages[1]).toMatchObject({
      role: 'assistant',
      content: 'Hi there!',
    });
  });

  it('should handle tool invocations', async () => {
    const uiMessages = [
      {
        id: '1',
        role: 'assistant',
        content: 'Let me check the weather',
        toolInvocations: [{
          toolCallId: 'call_123',
          toolName: 'getWeather',
          args: { location: 'London' },
        }],
      },
    ];

    const coreMessages = await convertToModelMessages(uiMessages);

    expect(coreMessages[0]).toMatchObject({
      role: 'assistant',
      content: expect.arrayContaining([
        expect.objectContaining({
          type: 'tool-call',
          toolCallId: 'call_123',
          toolName: 'getWeather',
        }),
      ]),
    });
  });
});
```

## Common Pitfalls

1. **Missing Tool Data**: Not properly handling tool invocations
2. **Type Mismatch**: Expecting different message structure
3. **Memory Leaks**: Not cleaning up converted message caches
4. **Async Issues**: Not handling conversion promises correctly
5. **Provider Conflicts**: Applying incompatible provider options

## Best Practices

1. **Always handle conversion errors** with try-catch
2. **Validate message structure** after conversion
3. **Cache converted messages** for performance
4. **Use appropriate provider options** for your use case
5. **Test with different message types** thoroughly
6. **Document conversion logic** for maintenance