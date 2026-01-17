# useChat Hook

The `useChat` hook is the primary interface for building chat applications with the Vercel AI SDK. It manages conversation state, handles streaming responses, and integrates with tool calling.

## Basic Usage

```ts
import { useChat } from '@ai-sdk/react';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className={message.role}>
            <strong>{message.role}:</strong>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

## Configuration Options

### Core Options

```ts
const { messages, /* ... */ } = useChat({
  api: '/api/chat',                    // Required: API endpoint
  initialMessages: [],                  // Initial message history
  id: 'default-chat',                  // Unique chat identifier
  headers: {},                         // Additional request headers
  body: {},                           // Additional request body data
  onFinish: (message) => {},           // Called when message completes
  onError: (error) => {},              // Called on error
});
```

### Streaming Options

```ts
const { messages, /* ... */ } = useChat({
  api: '/api/chat',
  streamProtocol: 'text',               // 'text' or 'data' (default)
  onFinish: (message) => {
    console.log('Stream completed:', message);
  },
  onFinish: async (message) => {
    // Auto-save conversation
    await saveConversation(messages);
  },
});
```

### Tool Integration

```ts
const { messages, /* ... */ } = useChat({
  api: '/api/chat',
  onToolCall: ({ toolCall }) => {
    console.log('Tool called:', toolCall.name, toolCall.args);
  },
  onToolResult: ({ toolCall, toolResult }) => {
    console.log('Tool result:', toolResult);
  },
});
```

## Return Values

### Core State

```ts
const {
  messages,           // Array of chat messages
  input,             // Current input value
  setInput,           // Set input value programmatically
  handleSubmit,       // Submit handler for forms
  handleInputChange,   // Input change handler
  isLoading,          // Loading state
  reload,            // Retry last message
  stop,              // Stop current generation
} = useChat({ api: '/api/chat' });
```

### Advanced State

```ts
const {
  messages,
  input,
  setInput,
  handleSubmit,
  handleInputChange,
  isLoading,
  reload,
  stop,
  setMessages,        // Update messages programmatically
  append,            // Add message to conversation
  error,             // Current error state
  data,              // Additional response data
} = useChat({ api: '/api/chat' });
```

## Message Structure

```ts
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  toolInvocations?: ToolInvocation[];  // For tool-based messages
}
```

## Advanced Patterns

### Custom Message Submission

```ts
const { append, handleSubmit } = useChat({
  api: '/api/chat',
  onSubmit: async ({ messages }) => {
    // Custom preprocessing
    const processedMessages = await preprocessMessages(messages);
    
    // Custom API call
    const response = await fetch('/api/custom-chat', {
      method: 'POST',
      body: JSON.stringify({ messages: processedMessages }),
    });
    
    return response;
  },
});
```

### Message Preprocessing

```ts
const { append } = useChat({
  api: '/api/chat',
  onSubmit: async ({ messages }) => {
    // Add system message
    const enhancedMessages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...messages
    ];
    
    return fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: enhancedMessages }),
    });
  },
});
```

### Error Recovery

```ts
const { error, reload, messages } = useChat({
  api: '/api/chat',
  onError: (error) => {
    console.error('Chat error:', error);
    toast.error('Failed to send message');
  },
  onFinish: (message) => {
    if (!message.content || message.content.trim() === '') {
      throw new Error('Empty response received');
    }
  },
});

return (
  <div>
    {error && (
      <div className="error">
        <p>Failed to get response</p>
        <button onClick={reload}>Retry</button>
      </div>
    )}
    {/* Normal chat rendering */}
  </div>
);
```

### Multi-Chat Management

```ts
function ChatManager() {
  const [chats, setChats] = useState(new Map());
  const [activeChatId, setActiveChatId] = useState('chat1');

  const { messages, handleSubmit } = useChat({
    api: '/api/chat',
    id: activeChatId,
    onFinish: (message) => {
      // Update chat in state
      setChats(prev => {
        const newChats = new Map(prev);
        const existing = newChats.get(activeChatId) || [];
        newChats.set(activeChatId, [...existing, message]);
        return newChats;
      });
    },
  });

  return (
    <div>
      <div className="chat-tabs">
        {Array.from(chats.keys()).map(chatId => (
          <button
            key={chatId}
            onClick={() => setActiveChatId(chatId)}
            className={chatId === activeChatId ? 'active' : ''}
          >
            Chat {chatId}
          </button>
        ))}
      </div>
      
      <div className="chat-interface">
        {/* Chat UI for active chat */}
      </div>
    </div>
  );
}
```

## Tool Integration Examples

### Tool Call Visualization

```ts
function ToolAwareMessage({ message }) {
  return (
    <div className={`message ${message.role}`}>
      <div className="content">{message.content}</div>
      
      {message.toolInvocations?.map(invocation => (
        <div key={invocation.toolCallId} className="tool-invocation">
          <div className="tool-header">
            <span className="tool-name">{invocation.toolName}</span>
            <span className="tool-status">
              {invocation.state === 'result' ? '✓' : '⏳'}
            </span>
          </div>
          
          <div className="tool-args">
            <pre>{JSON.stringify(invocation.args, null, 2)}</pre>
          </div>
          
          {invocation.result && (
            <div className="tool-result">
              <pre>{JSON.stringify(invocation.result, null, 2)}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Custom Tool Handling

```ts
const { handleSubmit } = useChat({
  api: '/api/chat',
  onToolCall: async ({ toolCall }) => {
    if (toolCall.name === 'custom-search') {
      // Handle tool call locally
      const results = await customSearch(toolCall.args.query);
      return {
        toolCallId: toolCall.toolCallId,
        result: results,
      };
    }
    // Let server handle other tools
  },
});
```

## Performance Considerations

### Message Pruning

```ts
const { messages, setMessages } = useChat({
  api: '/api/chat',
  onFinish: (message) => {
    setMessages(prev => {
      const allMessages = [...prev, message];
      
      // Keep last 20 messages
      if (allMessages.length > 20) {
        return allMessages.slice(-20);
      }
      
      return allMessages;
    });
  },
});
```

### Debounced Input

```ts
const { handleSubmit } = useChat({
  api: '/api/chat',
});

const debouncedSubmit = useCallback(
  debounce((input) => {
    handleSubmit({ messages: [{ role: 'user', content: input }] });
  }, 500),
  [handleSubmit]
);
```

## Testing

### Hook Testing

```ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '@ai-sdk/react';

describe('useChat', () => {
  it('should handle message submission', async () => {
    const mockResponse = {
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Hello!'));
          controller.close();
        }
      })
    };

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChat({ api: '/api/chat' }));

    act(() => {
      result.current.handleSubmit({
        messages: [{ role: 'user', content: 'Hello' }]
      });
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2); // user + assistant
      expect(result.current.messages[1].content).toBe('Hello!');
    });
  });
});
```

## Common Pitfalls

1. **Missing Error Boundaries**: Components crash on streaming errors
2. **Memory Leaks**: Not cleaning up event listeners
3. **Race Conditions**: Multiple simultaneous requests
4. **Accessibility Issues**: Missing ARIA labels
5. **Performance Issues**: Not pruning message history

## Best Practices

1. **Always include error handling** with `onError` callback
2. **Implement loading states** for better UX
3. **Use `onFinish`** for side effects like saving
4. **Prune messages** for long conversations
5. **Test tool integration** thoroughly
6. **Implement accessibility** features from the start
