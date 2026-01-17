# AI SDK UI Expert

Expert guidance on using AI SDK UI hooks and components for building conversational interfaces. Use when designing, implementing, or optimizing React UI components with the Vercel AI SDK.

## Core Concepts

### AI SDK UI Overview
The AI SDK UI provides React hooks and components for building AI-powered user interfaces. It simplifies:
- Real-time streaming responses
- Message state management
- Tool calling integration
- Error handling and loading states
- Accessibility and responsive design

### Key UI Hooks

#### useChat
The primary hook for building chat interfaces. Manages conversation state, streaming, and tool integration.

```ts
import { useChat } from '@ai-sdk/react';

function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onFinish: (message) => console.log('Message completed:', message),
    onError: (error) => console.error('Chat error:', error),
  });

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>{message.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

#### useCompletion
For single-turn text generation without conversation history.

```ts
import { useCompletion } from '@ai-sdk/react';

function CompletionComponent() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } = 
    useCompletion({
      api: '/api/completion',
    });

  return (
    <div>
      <div>{completion}</div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>Generate</button>
      </form>
    </div>
  );
}
```

#### useObject
For structured data generation with Zod schema validation.

```ts
import { useObject } from '@ai-sdk/react';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

function ObjectGenerationComponent() {
  const { object, submit, isLoading } = useObject({
    api: '/api/generate-object',
    schema,
  });

  return (
    <div>
      <button 
        onClick={() => submit('Generate a blog post idea')}
        disabled={isLoading}
      >
        Generate
      </button>
      {object && (
        <div>
          <h3>{object.title}</h3>
          <p>{object.description}</p>
          <div>{object.tags.join(', ')}</div>
        </div>
      )}
    </div>
  );
}
```

## Streaming

### Streaming Architecture
The AI SDK UI uses server-sent events for real-time streaming:
- Automatic reconnection handling
- Backpressure management
- Error recovery
- Performance optimization

### Custom Streaming Hooks

#### createUIStreamMessageStream
Create custom UI message streams with control over message processing.

```ts
import { createUIStreamMessageStream } from '@ai-sdk/ui';

function CustomStreamingComponent() {
  const [messages, setMessages] = useState([]);
  
  const stream = createUIStreamMessageStream({
    onFinish: (message) => setMessages(prev => [...prev, message]),
    onError: (error) => console.error('Stream error:', error),
  });

  const handleStream = async () => {
    const response = await fetch('/api/custom-stream');
    await stream.processResponse(response);
  };

  return <div>{/* render messages */}</div>;
}
```

#### readUIStreamMessage
Read and process UI stream messages manually.

```ts
import { readUIStreamMessage } from '@ai-sdk/ui';

async function processStream(response: Response) {
  const reader = response.body?.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const message = await readUIStreamMessage(value);
    // Process message
  }
}
```

## Advanced Patterns

### Message Pruning
Optimize performance by managing conversation history.

```ts
import { pruneMessages } from '@ai-sdk/ui';

function OptimizedChat() {
  const { messages, setMessages } = useChat({
    api: '/api/chat',
    maxSteps: 5, // Limit conversation steps
    onFinish: (message) => {
      const pruned = pruneMessages({
        messages: [...messages, message],
        keepLastN: 10, // Keep last 10 messages
        maxTokens: 4000, // Limit token count
      });
      setMessages(pruned);
    },
  });
}
```

### Tool Integration
Handle tool calls in UI components.

```ts
function ToolAwareChat() {
  const { messages, handleSubmit } = useChat({
    api: '/api/chat',
    onToolCall: ({ toolCall }) => {
      console.log('Tool called:', toolCall.name, toolCall.args);
    },
    onToolResult: ({ toolCall, toolResult }) => {
      console.log('Tool result:', toolCall.result);
    },
  });

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.content}
          {message.toolInvocations?.map(invocation => (
            <div key={invocation.toolCallId}>
              Tool: {invocation.toolName}
              {/* Render tool-specific UI */}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Error Handling
Implement robust error handling and recovery.

```ts
function ResilientChat() {
  const { error, reload, messages } = useChat({
    api: '/api/chat',
    onError: (error) => {
      // Log error for debugging
      console.error('Chat error:', error);
      
      // Show user-friendly message
      toast.error('Something went wrong. Please try again.');
    },
    onFinish: (message) => {
      // Validate message content
      if (!message.content || message.content.trim() === '') {
        throw new Error('Empty response received');
      }
    },
  });

  return (
    <div>
      {error && (
        <div className="error">
          <p>Failed to load response</p>
          <button onClick={reload}>Retry</button>
        </div>
      )}
      {/* Normal chat rendering */}
    </div>
  );
}
```

## Performance Optimization

### Message Caching
Cache responses to improve performance and reduce API calls.

```ts
function CachedChat() {
  const [cache, setCache] = useState(new Map());
  
  const { handleSubmit } = useChat({
    api: '/api/chat',
    onSubmit: async ({ messages }) => {
      const cacheKey = JSON.stringify(messages[messages.length - 1]);
      
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      
      // Make API call and cache result
    },
  });
}
```

### Virtual Scrolling
Handle large message lists efficiently.

```ts
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedChat() {
  const { messages } = useChat();
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated message height
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {messages[virtualItem.index].content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Accessibility

### ARIA Labels
Ensure chat interfaces are accessible.

```ts
function AccessibleChat() {
  const { messages, handleSubmit } = useChat();
  const [input, setInput] = useState('');

  return (
    <div role="application" aria-label="Chat interface">
      <div role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((message, index) => (
          <div
            key={message.id}
            role="article"
            aria-label={`Message ${index + 1} from ${message.role}`}
          >
            <strong>{message.role}: </strong>
            <span>{message.content}</span>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <label htmlFor="chat-input">Type your message:</label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-describedby="input-help"
        />
        <span id="input-help">
          Press Enter to send your message
        </span>
        <button type="submit" aria-label="Send message">
          Send
        </button>
      </form>
    </div>
  );
}
```

### Keyboard Navigation
Support keyboard-only users.

```ts
function KeyboardNavigationChat() {
  const { handleSubmit } = useChat();
  const [input, setInput] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMessage(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMessage(prev => prev + 1);
        break;
      case 'Enter':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleSubmit({ messages: [{ role: 'user', content: input }] });
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [input]);

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Chat interface with keyboard navigation */}
    </div>
  );
}
```

## Testing

### Hook Testing
Test AI SDK UI hooks with React Testing Library.

```ts
import { renderHook, waitFor } from '@testing-library/react';
import { useChat } from '@ai-sdk/react';

describe('useChat', () => {
  it('should handle message submission', async () => {
    const { result } = renderHook(() => useChat({
      api: '/api/chat',
    }));

    act(() => {
      result.current.handleSubmit({
        messages: [{ role: 'user', content: 'Hello' }]
      });
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hello');
    });
  });

  it('should handle streaming responses', async () => {
    const { result } = renderHook(() => useChat({
      api: '/api/chat',
    }));

    // Mock streaming response
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Hello'));
        controller.close();
      }
    });

    await act(async () => {
      await result.current.processStream(mockStream);
    });

    expect(result.current.messages[0].content).toBe('Hello');
  });
});
```

### Integration Testing
Test complete UI components with mocked API responses.

```ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatComponent } from './ChatComponent';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('ChatComponent', () => {
  it('should send and receive messages', async () => {
    const mockResponse = {
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Hello!'));
          controller.close();
        }
      })
    };

    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    render(<ChatComponent />);

    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button');

    await userEvent.type(input, 'Hello');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument();
    });
  });
});
```

## Common Pitfalls

1. **Missing Error Boundaries**: Components crash on streaming errors
2. **Memory Leaks**: Not cleaning up event listeners and subscriptions
3. **Race Conditions**: Multiple simultaneous requests causing state corruption
4. **Accessibility Issues**: Missing ARIA labels and keyboard navigation
5. **Performance Issues**: Not optimizing for large message histories

## Best Practices

1. **Error Handling**: Always implement error boundaries and retry logic
2. **Loading States**: Provide clear feedback during streaming
3. **Accessibility**: Ensure full keyboard navigation and screen reader support
4. **Performance**: Use virtual scrolling for long conversations
5. **Testing**: Write comprehensive tests for hooks and components
6. **Security**: Sanitize and validate all user inputs

Use this skill to build robust, accessible, and performant AI-powered UI interfaces with the Vercel AI SDK.