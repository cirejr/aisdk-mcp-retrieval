# createUIStreamMessageStream Function

The `createUIStreamMessageStream` function creates a custom UI message stream with fine-grained control over message processing, error handling, and stream management. It's ideal for custom streaming implementations and advanced use cases.

## Basic Usage

```ts
import { createUIStreamMessageStream } from '@ai-sdk/react';

export default function CustomStreamingChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const stream = createUIStreamMessageStream({
    onFinish: (message) => {
      setMessages(prev => [...prev, message]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Stream error:', error);
      setIsLoading(false);
    },
    onChunk: (chunk) => {
      // Handle streaming chunks
      console.log('Received chunk:', chunk);
    },
  });

  const handleSubmit = async (input) => {
    setIsLoading(true);
    
    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Start streaming response
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });
    
    await stream.processResponse(response);
  };

  return (
    <div>
      {messages.map(message => (
        <div key={message.id} className={message.role}>
          {message.content}
        </div>
      ))}
      
      {isLoading && <div>Assistant is typing...</div>}
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e.target.elements.input.value);
      }}>
        <input name="input" disabled={isLoading} />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

## Configuration Options

### Core Options

```ts
const stream = createUIStreamMessageStream({
  onFinish: (message) => {
    console.log('Stream completed:', message);
  },
  onError: (error) => {
    console.error('Stream failed:', error);
  },
  onChunk: (chunk) => {
    console.log('Data chunk received:', chunk);
  },
  onStart: () => {
    console.log('Stream started');
  },
  onToolCall: (toolCall) => {
    console.log('Tool call:', toolCall);
  },
  onToolResult: (toolResult) => {
    console.log('Tool result:', toolResult);
  },
});
```

### Advanced Options

```ts
const stream = createUIStreamMessageStream({
  onFinish: (message) => {
    // Process completed message
    saveMessage(message);
    updateAnalytics(message);
  },
  onError: (error) => {
    // Custom error handling
    trackError('stream_error', error);
    showUserNotification('Stream failed. Please try again.');
  },
  onChunk: (chunk) => {
    // Real-time chunk processing
    updateTypingIndicator(chunk);
    updateWordCount(chunk);
  },
  // Custom parsing options
  parseToolCalls: true,
  toolCallTimeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000,
  // Stream configuration
  streamProtocol: 'text', // 'text' or 'data'
  chunkSize: 1024,
  bufferTimeout: 100,
});
```

## Advanced Patterns

### Custom Message Processing

```ts
function EnhancedStreamingChat() {
  const [messages, setMessages] = useState([]);
  const [streamStats, setStreamStats] = useState({
    chunksReceived: 0,
    totalCharacters: 0,
    toolCalls: 0,
  });

  const stream = createUIStreamMessageStream({
    onFinish: (message) => {
      // Post-process message
      const processedMessage = {
        ...message,
        wordCount: message.content.split(/\s+/).length,
        readingTime: Math.ceil(message.content.split(/\s+/).length / 200), // 200 wpm
        sentiment: await analyzeSentiment(message.content),
      };

      setMessages(prev => [...prev, processedMessage]);
    },
    onChunk: (chunk) => {
      // Update streaming statistics
      setStreamStats(prev => ({
        chunksReceived: prev.chunksReceived + 1,
        totalCharacters: prev.totalCharacters + (chunk.length || 0),
      }));
    },
    onToolCall: (toolCall) => {
      setStreamStats(prev => ({
        ...prev,
        toolCalls: prev.toolCalls + 1,
      }));
      
      // Show tool call UI
      showToolCallNotification(toolCall);
    },
    onToolResult: (toolResult) => {
      // Process tool results
      updateToolCallUI(toolResult);
    },
  });

  return (
    <div>
      <StreamStats stats={streamStats} />
      <MessageList messages={messages} />
      <ChatForm onSubmit={handleCustomSubmit} />
    </div>
  );
}
```

### Multi-source Streaming

```ts
function MultiSourceChat() {
  const [messages, setMessages] = useState([]);
  const [activeStreams, setActiveStreams] = useState(new Map());

  const createStreamForSource = (sourceId) => {
    return createUIStreamMessageStream({
      onFinish: (message) => {
        const enhancedMessage = {
          ...message,
          source: sourceId,
          sourcePriority: getSourcePriority(sourceId),
        };
        
        setMessages(prev => [...prev, enhancedMessage]);
        setActiveStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(sourceId);
          return newStreams;
        });
      },
      onError: (error) => {
        console.error(`Stream ${sourceId} failed:`, error);
        setActiveStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(sourceId);
          return newStreams;
        });
      },
    });
  };

  const handleMultiSourceSubmit = async (prompt) => {
    const sources = ['primary', 'backup', 'context'];
    
    for (const source of sources) {
      const stream = createStreamForSource(source);
      setActiveStreams(prev => new Map(prev).set(source, stream));
      
      const response = await fetch(`/api/chat/${source}`, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      
      stream.processResponse(response);
    }
  };

  return (
    <div>
      <div className="active-streams">
        {Array.from(activeStreams.entries()).map(([source, stream]) => (
          <div key={source} className="stream-indicator">
            {source} active...
          </div>
        ))}
      </div>
      
      <MessageList messages={messages} />
      <form onSubmit={(e) => {
        e.preventDefault();
        handleMultiSourceSubmit(e.target.elements.input.value);
      }}>
        <input name="input" />
        <button type="submit">Multi-Source Query</button>
      </form>
    </div>
  );
}
```

### Buffered Streaming

```ts
function BufferedStreamingChat() {
  const [messages, setMessages] = useState([]);
  const [buffer, setBuffer] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const stream = createUIStreamMessageStream({
    onChunk: (chunk) => {
      // Buffer chunks for smooth display
      setBuffer(prev => prev + chunk);
    },
    onFinish: (message) => {
      // Flush buffer and add message
      setMessages(prev => [...prev, { ...message, content: buffer }]);
      setBuffer('');
      setIsTyping(false);
    },
    onStart: () => {
      setBuffer('');
      setIsTyping(true);
    },
    bufferTimeout: 100, // Process chunks every 100ms
  });

  // Smooth typewriter effect
  useEffect(() => {
    if (!isTyping || !buffer) return;

    const timeout = setTimeout(() => {
      // Update display with buffered content
      updateTypingDisplay(buffer);
    }, 50);

    return () => clearTimeout(timeout);
  }, [buffer, isTyping]);

  return (
    <div>
      <MessageList messages={messages} />
      {isTyping && (
        <div className="typing-indicator">
          <span>{buffer}</span>
          <span className="cursor">|</span>
        </div>
      )}
      <ChatForm onSubmit={handleSubmit} />
    </div>
  );
}
```

## Error Handling

### Robust Error Recovery

```ts
function RobustStreamingChat() {
  const [messages, setMessages] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [errorState, setErrorState] = useState(null);

  const stream = createUIStreamMessageStream({
    onFinish: (message) => {
      setMessages(prev => [...prev, message]);
      setRetryCount(0); // Reset retry count on success
      setErrorState(null);
    },
    onError: async (error) => {
      console.error('Stream error:', error);
      setErrorState(error);

      // Automatic retry logic
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        
        setTimeout(async () => {
          try {
            await retryLastRequest();
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          }
        }, delay);
      } else {
        // Show user-facing error
        showErrorMessage('Failed to get response after 3 attempts. Please try again.');
        setRetryCount(0);
      }
    },
    maxRetries: 3,
    retryDelay: 1000,
  });

  return (
    <div>
      {errorState && (
        <div className="error-display">
          <p>Error: {errorState.message}</p>
          <p>Retry attempt: {retryCount}/3</p>
          <button onClick={() => setRetryCount(0)}>Reset</button>
        </div>
      )}
      
      <MessageList messages={messages} />
      <ChatForm onSubmit={handleSubmit} />
    </div>
  );
}
```

### Fallback Handling

```ts
function FallbackStreamingChat() {
  const [messages, setMessages] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);

  const stream = createUIStreamMessageStream({
    onFinish: (message) => {
      setMessages(prev => [...prev, message]);
      setUsingFallback(false);
    },
    onError: async (error) => {
      console.error('Primary stream failed:', error);
      
      // Try fallback stream
      try {
        const fallbackResponse = await fetch('/api/chat/fallback', {
          method: 'POST',
          body: JSON.stringify({ 
            messages: messages,
            fallback: true,
          }),
        });

        const fallbackStream = createUIStreamMessageStream({
          onFinish: (message) => {
            setMessages(prev => [...prev, {
              ...message,
              isFallback: true,
              fallbackReason: error.message,
            }]);
            setUsingFallback(false);
          },
        });

        await fallbackStream.processResponse(fallbackResponse);
        setUsingFallback(true);
        
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        showErrorMessage('All streaming options failed. Please try again later.');
      }
    },
  });

  return (
    <div>
      {usingFallback && (
        <div className="fallback-notice">
          Using fallback mode due to: {errorState?.message}
        </div>
      )}
      
      <MessageList messages={messages} />
      <ChatForm onSubmit={handleSubmit} />
    </div>
  );
}
```

## Performance Optimization

### Stream Pooling

```ts
function StreamPoolChat() {
  const [streamPool, setStreamPool] = useState([]);
  const [activeStream, setActiveStream] = useState(null);

  const createPooledStream = () => {
    const stream = createUIStreamMessageStream({
      onFinish: (message) => {
        addMessageToQueue(message);
        returnStreamToPool(stream);
      },
      onChunk: (chunk) => {
        // Process chunk efficiently
        processChunk(chunk);
      },
    });

    return stream;
  };

  const getStreamFromPool = () => {
    if (streamPool.length > 0) {
      return streamPool.pop();
    }
    return createPooledStream();
  };

  const returnStreamToPool = (stream) => {
    // Reset stream state
    stream.reset();
    setStreamPool(prev => [...prev, stream]);
  };

  const handleSubmit = async (input) => {
    const stream = getStreamFromPool();
    setActiveStream(stream);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
    
    await stream.processResponse(response);
  };

  return (
    <div>
      <div className="pool-stats">
        Available streams: {streamPool.length}
        Active: {activeStream ? 'Yes' : 'No'}
      </div>
      
      <MessageList messages={messages} />
      <ChatForm onSubmit={handleSubmit} />
    </div>
  );
}
```

## Testing

### Unit Testing

```ts
import { createUIStreamMessageStream } from '@ai-sdk/react';

describe('createUIStreamMessageStream', () => {
  it('should handle message completion', async () => {
    const onFinish = jest.fn();
    const stream = createUIStreamMessageStream({ onFinish });

    // Mock response
    const mockResponse = {
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Hello world'));
          controller.close();
        }
      })
    };

    await stream.processResponse(mockResponse);

    expect(onFinish).toHaveBeenCalledWith({
      id: expect.any(String),
      role: 'assistant',
      content: 'Hello world',
      createdAt: expect.any(Date),
    });
  });

  it('should handle streaming chunks', async () => {
    const onChunk = jest.fn();
    const stream = createUIStreamMessageStream({ onChunk });

    const chunks = ['Hello', ' ', 'world', '!'];
    const mockResponse = {
      body: new ReadableStream({
        start(controller) {
          chunks.forEach(chunk => {
            controller.enqueue(new TextEncoder().encode(chunk));
          });
          controller.close();
        }
      })
    };

    await stream.processResponse(mockResponse);

    expect(onChunk).toHaveBeenCalledTimes(chunks.length);
    expect(onChunk).toHaveBeenCalledWith('Hello');
    expect(onChunk).toHaveBeenCalledWith('world!');
  });

  it('should handle errors', async () => {
    const onError = jest.fn();
    const stream = createUIStreamMessageStream({ onError });

    const mockResponse = {
      body: new ReadableStream({
        start(controller) {
          controller.error(new Error('Stream failed'));
        }
      })
    };

    await stream.processResponse(mockResponse);

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});
```

## Common Pitfalls

1. **Memory Leaks**: Not properly cleaning up streams
2. **Race Conditions**: Multiple streams running simultaneously
3. **Error Propagation**: Not handling stream errors correctly
4. **Buffer Overflow**: Not limiting buffer size for long streams
5. **Resource Exhaustion**: Creating too many concurrent streams

## Best Practices

1. **Always include error handling** with fallbacks
2. **Implement stream cleanup** to prevent memory leaks
3. **Use appropriate timeouts** for tool calls
4. **Monitor stream performance** and adjust buffering
5. **Test error scenarios** thoroughly
6. **Implement backpressure** handling for fast streams
7. **Use pooling** for high-frequency scenarios
8. **Log stream events** for debugging