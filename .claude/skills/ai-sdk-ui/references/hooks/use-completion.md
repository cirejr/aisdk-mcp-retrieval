# useCompletion Hook

The `useCompletion` hook is designed for single-turn text generation without maintaining conversation history. It's ideal for content generation, text completion, and other one-off generation tasks.

## Basic Usage

```ts
import { useCompletion } from '@ai-sdk/react';

export default function CompletionInterface() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } = 
    useCompletion({
      api: '/api/completion',
    });

  return (
    <div>
      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Enter your prompt..."
        rows={4}
      />
      
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      
      {completion && (
        <div className="completion-result">
          <h3>Generated Content:</h3>
          <p>{completion}</p>
        </div>
      )}
    </div>
  );
}
```

## Configuration Options

### Core Options

```ts
const { completion, /* ... */ } = useCompletion({
  api: '/api/completion',               // Required: API endpoint
  initialCompletion: '',                // Initial completion text
  initialInput: '',                     // Initial input value
  headers: {},                         // Additional request headers
  body: {},                           // Additional request body data
  onFinish: (prompt, completion) => {},  // Called when completion finishes
  onError: (error) => {},              // Called on error
});
```

### Streaming Options

```ts
const { completion, /* ... */ } = useCompletion({
  api: '/api/completion',
  streamProtocol: 'text',               // 'text' or 'data' (default)
  onFinish: (prompt, completion) => {
    console.log('Prompt:', prompt);
    console.log('Completion:', completion);
  },
});
```

## Return Values

### Core State

```ts
const {
  completion,        // Generated text content
  input,            // Current input value
  setInput,          // Set input value programmatically
  handleSubmit,      // Submit handler
  handleInputChange, // Input change handler
  isLoading,        // Loading state
  reload,           // Regenerate completion
  stop,             // Stop current generation
} = useCompletion({ api: '/api/completion' });
```

### Advanced State

```ts
const {
  completion,
  input,
  setInput,
  handleSubmit,
  handleInputChange,
  isLoading,
  reload,
  stop,
  setCompletion,     // Set completion programmatically
  complete,          // Programmatic completion trigger
  error,             // Current error state
} = useCompletion({ api: '/api/completion' });
```

## Advanced Patterns

### Custom Submission

```ts
const { complete, input } = useCompletion({
  api: '/api/completion',
  onFinish: (prompt, completion) => {
    console.log('Generated:', completion);
    // Auto-save completion
    saveCompletion({ prompt, completion });
  },
});

const handleCustomSubmit = async (customPrompt) => {
  await complete(customPrompt);
};

return (
  <div>
    <button onClick={() => handleCustomSubmit('Write a poem')}>
      Generate Poem
    </button>
  </div>
);
```

### Template-based Generation

```ts
const { complete } = useCompletion({
  api: '/api/completion',
});

function TemplateGenerator() {
  const templates = [
    'Write a {topic} blog post about {subject}',
    'Create a {tone} email about {purpose}',
    'Generate {number} ideas for {topic}'
  ];

  const generateFromTemplate = async (template, variables) => {
    const prompt = template.replace(/\{(\w+)\}/g, (match, key) => 
      variables[key] || match
    );
    
    await complete(prompt);
  };

  return (
    <div>
      {templates.map((template, index) => (
        <button
          key={index}
          onClick={() => generateFromTemplate(template, {
            topic: 'technology',
            subject: 'AI',
            tone: 'professional',
            purpose: 'meeting request',
            number: '5'
          })}
        >
          Use Template {index + 1}
        </button>
      ))}
    </div>
  );
}
```

### Multi-step Generation

```ts
const { complete, completion, setCompletion } = useCompletion({
  api: '/api/completion',
  onFinish: async (prompt, completion) => {
    // Generate follow-up based on first completion
    if (prompt.includes('outline')) {
      await complete(`Expand on this outline: ${completion}`);
    }
  },
});

function MultiStepGenerator() {
  const [step, setStep] = useState(1);

  const handleStepSubmit = async () => {
    if (step === 1) {
      await complete('Create an outline for a blog post about AI');
    } else if (step === 2) {
      setCompletion(''); // Clear for new completion
      await complete('Now write the full blog post based on the outline');
    }
    
    setStep(step + 1);
  };

  return (
    <div>
      <div className="step-indicator">Step {step} of 2</div>
      <button onClick={handleStepSubmit}>
        {step === 1 ? 'Create Outline' : 'Write Full Post'}
      </button>
      <div className="completion-display">{completion}</div>
    </div>
  );
}
```

### Batch Generation

```ts
const { complete, completion, setCompletion } = useCompletion({
  api: '/api/completion',
});

function BatchGenerator() {
  const [prompts, setPrompts] = useState([
    'Write a headline',
    'Write an introduction',
    'Write three main points',
    'Write a conclusion'
  ]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [allCompletions, setAllCompletions] = useState([]);

  const handleBatchGeneration = async () => {
    const completions = [];
    
    for (let i = 0; i < prompts.length; i++) {
      setCurrentPromptIndex(i);
      setCompletion(''); // Clear for new completion
      
      await complete(prompts[i]);
      
      // Wait for completion to finish
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      completions.push(completion);
    }
    
    setAllCompletions(completions);
    setCompletion(completions.join('\n\n'));
  };

  return (
    <div>
      <div className="progress">
        Generating part {currentPromptIndex + 1} of {prompts.length}
      </div>
      <button onClick={handleBatchGeneration}>
        Generate All Parts
      </button>
      <textarea
        value={completion}
        readOnly
        placeholder="Generated content will appear here..."
      />
    </div>
  );
}
```

## Integration Examples

### Code Generation

```ts
function CodeGenerator() {
  const { complete, completion, input, handleInputChange, isLoading } = 
    useCompletion({
      api: '/api/generate-code',
      onFinish: (prompt, completion) => {
        // Syntax highlight the result
        highlightCode(completion);
      },
    });

  const languages = ['javascript', 'python', 'java', 'typescript'];

  return (
    <div>
      <select 
        onChange={(e) => 
          complete(`Write a function to ${e.target.value} in JavaScript`)
        }
      >
        <option value="">Select a function to generate...</option>
        <option value="sort an array">Sort Array</option>
        <option value="reverse a string">Reverse String</option>
        <option value="calculate factorial">Calculate Factorial</option>
      </select>
      
      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Or enter your own prompt..."
      />
      
      <button onClick={() => complete(input)}>
        Generate Code
      </button>
      
      {completion && (
        <div className="code-output">
          <pre><code>{completion}</code></pre>
        </div>
      )}
    </div>
  );
}
```

### Text Formatting

```ts
function TextFormatter() {
  const { complete, completion } = useCompletion({
    api: '/api/format-text',
  });

  const formatOptions = [
    'summarize this text',
    'make this more formal',
    'make this more casual',
    'convert to bullet points',
    'add emoji to this text'
  ];

  const formatText = async (formatType) => {
    const userText = document.getElementById('user-text').value;
    await complete(`${formatType}: ${userText}`);
  };

  return (
    <div>
      <textarea
        id="user-text"
        placeholder="Enter text to format..."
      />
      
      <div className="format-buttons">
        {formatOptions.map(option => (
          <button
            key={option}
            onClick={() => formatText(option)}
          >
            {option}
          </button>
        ))}
      </div>
      
      {completion && (
        <div className="formatted-result">
          <h4>Formatted Text:</h4>
          <p>{completion}</p>
        </div>
      )}
    </div>
  );
}
```

## Performance Considerations

### Debounced Generation

```ts
const { complete } = useCompletion({
  api: '/api/completion',
});

const debouncedComplete = useCallback(
  debounce((prompt) => complete(prompt), 1000),
  [complete]
);

function DebouncedGenerator() {
  const [input, setInput] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    debouncedComplete(`Complete this: ${value}`);
  };

  return (
    <input
      value={input}
      onChange={handleInputChange}
      placeholder="Type to see auto-completion..."
    />
  );
}
```

### Caching

```ts
const { complete, completion } = useCompletion({
  api: '/api/completion',
});

const [cache, setCache] = useState(new Map());

const cachedComplete = async (prompt) => {
  if (cache.has(prompt)) {
    return cache.get(prompt);
  }

  // This would normally trigger the hook's completion
  // For caching, you might need a custom implementation
  const result = await fetch('/api/completion', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
  
  const text = await result.text();
  setCache(prev => new Map(prev).set(prompt, text));
  return text;
};
```

## Testing

### Hook Testing

```ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompletion } from '@ai-sdk/react';

describe('useCompletion', () => {
  it('should handle completion generation', async () => {
    const mockResponse = {
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Generated text'));
          controller.close();
        }
      })
    };

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => 
      useCompletion({ api: '/api/completion' })
    );

    act(() => {
      result.current.handleSubmit({
        prompt: 'Test prompt'
      });
    });

    await waitFor(() => {
      expect(result.current.completion).toBe('Generated text');
      expect(fetch).toHaveBeenCalledWith('/api/completion', {
        method: 'POST',
        body: expect.stringContaining('Test prompt'),
      });
    });
  });

  it('should call onFinish callback', async () => {
    const onFinish = jest.fn();
    const mockResponse = {
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Result'));
          controller.close();
        }
      })
    };

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    renderHook(() => 
      useCompletion({ 
        api: '/api/completion',
        onFinish 
      })
    );

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledWith('Test prompt', 'Result');
    });
  });
});
```

## Common Pitfalls

1. **Memory Leaks**: Not cleaning up completion state
2. **Race Conditions**: Multiple simultaneous completions
3. **Missing Error Handling**: No fallback for failed generations
4. **Performance Issues**: No debouncing for real-time scenarios
5. **Accessibility**: Missing loading indicators

## Best Practices

1. **Always show loading state** during generation
2. **Implement error handling** with fallbacks
3. **Use debouncing** for real-time scenarios
4. **Cache results** for repeated prompts
5. **Provide clear feedback** for user actions
6. **Test streaming behavior** thoroughly