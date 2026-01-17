# pruneMessages Function

The `pruneMessages` function optimizes conversation performance by managing message history, reducing token usage, and maintaining context relevance. It's essential for long-running chat applications and memory management.

## Basic Usage

```ts
import { useChat, pruneMessages } from '@ai-sdk/react';

export default function OptimizedChat() {
  const { messages, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const allMessages = [...messages, message];
      
      // Prune messages after each response
      const pruned = pruneMessages({
        messages: allMessages,
        keepLastN: 10, // Keep last 10 messages
      });
      
      setMessages(pruned);
    },
  });

  return (
    <div>
      {/* Chat interface */}
    </div>
  );
}
```

## Configuration Options

### Basic Pruning

```ts
const prunedMessages = pruneMessages({
  messages: conversationMessages,
  keepLastN: 20,           // Keep last N messages
});

const prunedMessages = pruneMessages({
  messages: conversationMessages,
  maxTokens: 4000,          // Limit by token count
});
```

### Advanced Pruning

```ts
const prunedMessages = pruneMessages({
  messages: conversationMessages,
  keepLastN: 15,
  maxTokens: 3000,
  includeSystem: true,       // Keep system messages
  preserveToolResults: true,  // Keep important tool results
  importanceFunction: (message) => {
    // Custom importance scoring
    if (message.role === 'system') return 10;
    if (message.toolInvocations) return 8;
    if (message.content.length > 500) return 6;
    return 3;
  },
});
```

## Pruning Strategies

### Message Count Limiting

```ts
function CountLimitedChat() {
  const { messages, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const allMessages = [...messages, message];
      
      // Keep only last 15 messages
      const pruned = pruneMessages({
        messages: allMessages,
        keepLastN: 15,
      });
      
      setMessages(pruned);
    },
  });

  return <ChatInterface messages={messages} />;
}
```

### Token-based Limiting

```ts
function TokenLimitedChat() {
  const { messages, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const allMessages = [...messages, message];
      
      // Limit to 3000 tokens (approximate)
      const pruned = pruneMessages({
        messages: allMessages,
        maxTokens: 3000,
        // Rough token estimation (4 chars ≈ 1 token)
        tokenEstimator: (content) => Math.ceil(content.length / 4),
      });
      
      setMessages(pruned);
    },
  });

  return <ChatInterface messages={messages} />;
}
```

### Hybrid Pruning

```ts
function HybridPruningChat() {
  const { messages, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const allMessages = [...messages, message];
      
      // Use both message count and token limits
      const pruned = pruneMessages({
        messages: allMessages,
        keepLastN: 20,
        maxTokens: 4000,
        // Prioritize recent and important messages
        importanceFunction: (message, index, allMsgs) => {
          const age = allMsgs.length - index;
          const baseImportance = Math.max(1, 10 - age);
          
          if (message.role === 'system') return baseImportance + 5;
          if (message.toolInvocations?.length > 0) return baseImportance + 3;
          if (message.content.length > 200) return baseImportance + 2;
          
          return baseImportance;
        },
      });
      
      setMessages(pruned);
    },
  });

  return <ChatInterface messages={messages} />;
}
```

## Advanced Patterns

### Smart Context Preservation

```ts
function SmartContextChat() {
  const { messages, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const allMessages = [...messages, message];
      
      const pruned = pruneMessages({
        messages: allMessages,
        keepLastN: 12,
        includeSystem: true,
        // Preserve important context
        preserveCriteria: (message) => {
          // Always keep system messages
          if (message.role === 'system') return true;
          
          // Keep messages with tool calls
          if (message.toolInvocations?.length > 0) return true;
          
          // Keep long, detailed messages
          if (message.content.length > 300) return true;
          
          // Keep error messages
          if (message.content.toLowerCase().includes('error')) return true;
          
          return false;
        },
        // Group-related messages
        groupMessages: (messages) => {
          const groups = [];
          let currentGroup = [];
          
          messages.forEach((message, index) => {
            currentGroup.push(message);
            
            // Start new group after assistant response
            if (message.role === 'assistant' && index < messages.length - 1) {
              groups.push(currentGroup);
              currentGroup = [];
            }
          });
          
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }
          
          return groups;
        },
      });
      
      setMessages(pruned);
    },
  });

  return <ChatInterface messages={messages} />;
}
```

### Time-based Pruning

```ts
function TimeBasedChat() {
  const { messages, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const allMessages = [...messages, message];
      const now = Date.now();
      
      const pruned = pruneMessages({
        messages: allMessages,
        maxAge: 30 * 60 * 1000, // 30 minutes
        keepLastN: 5, // Always keep last 5 messages
        timeField: 'createdAt', // Field containing timestamp
        currentTime: now,
        importanceFunction: (message) => {
          // Score based on recency and importance
          const age = message.createdAt ? now - message.createdAt.getTime() : 0;
          const ageScore = Math.max(1, 10 - Math.floor(age / (5 * 60 * 1000))); // Decay every 5 min
          
          const contentScore = message.content.length / 100;
          const toolScore = message.toolInvocations ? 3 : 0;
          
          return ageScore + contentScore + toolScore;
        },
      });
      
      setMessages(pruned);
    },
  });

  return <ChatInterface messages={messages} />;
}
```

### Topic-based Pruning

```ts
function TopicAwareChat() {
  const { messages, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const allMessages = [...messages, message];
      
      const pruned = pruneMessages({
        messages: allMessages,
        keepLastN: 15,
        // Preserve messages about important topics
        preserveCriteria: (message) => {
          const importantTopics = ['bug', 'error', 'important', 'deadline', 'meeting'];
          const content = message.content.toLowerCase();
          
          return importantTopics.some(topic => content.includes(topic));
        },
        // Group by topic similarity
        topicGrouping: {
          enabled: true,
          similarity: 0.7, // Similarity threshold
          topics: [
            { name: 'technical', keywords: ['code', 'api', 'function', 'bug'] },
            { name: 'general', keywords: ['hello', 'how', 'what'] },
            { name: 'business', keywords: ['meeting', 'deadline', 'project'] },
          ],
        },
      });
      
      setMessages(pruned);
    },
  });

  return <ChatInterface messages={messages} />;
}
```

## Performance Considerations

### Memory Management

```ts
function MemoryEfficientChat() {
  const [messageStats, setMessageStats] = useState({
    totalTokens: 0,
    messageCount: 0,
    lastPruned: Date.now(),
  });
  
  const { messages, setMessages } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      const allMessages = [...messages, message];
      
      // Estimate token count
      const newTokens = estimateTokens(message.content);
      const newTotal = messageStats.totalTokens + newTokens;
      
      // Prune if exceeding limits
      if (newTotal > 5000 || allMessages.length > 25) {
        const pruned = pruneMessages({
          messages: allMessages,
          maxTokens: 4000,
          keepLastN: 20,
          tokenEstimator: estimateTokens,
        });
        
        setMessages(pruned);
        setMessageStats(prev => ({
          ...prev,
          totalTokens: pruned.reduce((sum, msg) => sum + estimateTokens(msg.content), 0),
          messageCount: pruned.length,
          lastPruned: Date.now(),
        }));
      } else {
        setMessages(allMessages);
        setMessageStats(prev => ({
          ...prev,
          totalTokens: newTotal,
          messageCount: prev.messageCount + 1,
        }));
      }
    },
  });

  return (
    <div>
      <div className="stats">
        Messages: {messageStats.messageCount} | 
        Tokens: {messageStats.totalTokens}
      </div>
      <ChatInterface messages={messages} />
    </div>
  );
}

function estimateTokens(content) {
  // Simple token estimation (rough approximation)
  return Math.ceil(content.length / 4);
}
```

### Batch Processing

```ts
function BatchPruningChat() {
  const { messages, setMessages } = useChat({
    api: '/api/chat',
  });

  // Batch prune multiple conversations
  const pruneAllConversations = async (conversations) => {
    return Promise.all(
      conversations.map(async (conv) => {
        const pruned = pruneMessages({
          messages: conv.messages,
          keepLastN: 15,
          maxTokens: 3000,
        });
        
        return {
          ...conv,
          messages: pruned,
          prunedAt: Date.now(),
        };
      })
    );
  };

  const handleBatchPrune = async () => {
    const conversations = await loadAllConversations();
    const prunedConversations = await pruneAllConversations(conversations);
    await saveAllConversations(prunedConversations);
  };

  return (
    <div>
      <button onClick={handleBatchPrune}>
        Prune All Conversations
      </button>
      <ChatInterface messages={messages} />
    </div>
  );
}
```

## Testing

### Unit Testing

```ts
import { pruneMessages } from '@ai-sdk/react';

describe('pruneMessages', () => {
  it('should keep last N messages', () => {
    const messages = Array.from({ length: 10 }, (_, i) => ({
      id: `msg_${i}`,
      role: 'user',
      content: `Message ${i}`,
    }));

    const pruned = pruneMessages({
      messages,
      keepLastN: 5,
    });

    expect(pruned).toHaveLength(5);
    expect(pruned[0].content).toBe('Message 5');
    expect(pruned[4].content).toBe('Message 9');
  });

  it('should preserve system messages', () => {
    const messages = [
      { id: '1', role: 'system', content: 'System message' },
      { id: '2', role: 'user', content: 'User 1' },
      { id: '3', role: 'assistant', content: 'Assistant 1' },
      { id: '4', role: 'user', content: 'User 2' },
      { id: '5', role: 'assistant', content: 'Assistant 2' },
      { id: '6', role: 'user', content: 'User 3' },
    ];

    const pruned = pruneMessages({
      messages,
      keepLastN: 3,
      includeSystem: true,
    });

    expect(pruned).toHaveLength(4); // system + last 3
    expect(pruned[0]).toEqual(messages[0]); // system message preserved
  });

  it('should respect token limits', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Short' },
      { id: '2', role: 'assistant', content: 'A'.repeat(1000) }, // ~250 tokens
      { id: '3', role: 'user', content: 'B'.repeat(1000) },   // ~250 tokens
      { id: '4', role: 'assistant', content: 'C'.repeat(1000) }, // ~250 tokens
    ];

    const pruned = pruneMessages({
      messages,
      maxTokens: 400,
      tokenEstimator: (content) => Math.ceil(content.length / 4),
    });

    expect(pruned.length).toBeLessThan(messages.length);
  });
});
```

## Common Pitfalls

1. **Losing Important Context**: Aggressive pruning removes crucial information
2. **Breaking Tool Chains**: Not preserving tool call/response pairs
3. **User Experience Issues**: Users lose track of conversation
4. **Memory Leaks**: Not properly cleaning up old messages
5. **Inconsistent State**: Messages out of sync between UI and backend

## Best Practices

1. **Always preserve system messages** for context
2. **Keep tool invocation pairs** together
3. **Inform users** when messages are pruned
4. **Use conservative limits** initially, adjust based on usage
5. **Test with real conversations** to validate pruning logic
6. **Monitor token usage** to optimize limits
7. **Provide message history** or export functionality
8. **Consider user preferences** for pruning behavior