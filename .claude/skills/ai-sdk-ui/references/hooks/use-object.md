# useObject Hook

The `useObject` hook is designed for structured data generation using Zod schema validation. It's ideal for generating JSON objects, forms, configuration data, and any structured content that needs type safety.

## Basic Usage

```ts
import { useObject } from '@ai-sdk/react';
import { z } from 'zod';

const blogPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  published: z.boolean().default(false),
});

export default function ObjectGenerator() {
  const { object, submit, isLoading, error } = useObject({
    api: '/api/generate-object',
    schema: blogPostSchema,
  });

  return (
    <div>
      <button 
        onClick={() => submit('Generate a blog post about AI')}
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Blog Post'}
      </button>
      
      {error && <div className="error">Error: {error.message}</div>}
      
      {object && (
        <div className="generated-object">
          <h3>{object.title}</h3>
          <p>{object.content}</p>
          <div>Tags: {object.tags.join(', ')}</div>
          <div>Published: {object.published ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}
```

## Configuration Options

### Core Options

```ts
const { object, /* ... */ } = useObject({
  api: '/api/generate-object',           // Required: API endpoint
  schema: z.object({}),                  // Required: Zod schema
  initial: {},                          // Initial object value
  headers: {},                          // Additional request headers
  body: {},                            // Additional request body data
  onFinish: (object) => {},             // Called when object generation finishes
  onError: (error) => {},               // Called on error
});
```

### Advanced Options

```ts
const { object, /* ... */ } = useObject({
  api: '/api/generate-object',
  schema: complexSchema,
  mode: 'auto',                        // 'auto' or 'strict'
  onFinish: (object) => {
    console.log('Generated object:', object);
    // Auto-save or process the object
    saveToDatabase(object);
  },
});
```

## Return Values

### Core State

```ts
const {
  object,           // Generated object matching schema
  submit,           // Trigger generation with prompt
  isLoading,        // Loading state
  error,            // Error state
  reload,           // Regenerate object
  stop,             // Stop current generation
} = useObject({ api: '/api/generate-object', schema });
```

### Advanced State

```ts
const {
  object,
  submit,
  isLoading,
  error,
  reload,
  stop,
  setObject,        // Set object programmatically
  reset,           // Reset to initial value
  data,             // Additional response data
} = useObject({ api: '/api/generate-object', schema });
```

## Schema Examples

### Simple Object

```ts
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(18),
  bio: z.string().optional(),
});

const { object, submit } = useObject({
  api: '/api/generate-user',
  schema: userSchema,
});
```

### Nested Objects

```ts
const companySchema = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
  }),
  employees: z.array(z.object({
    name: z.string(),
    position: z.string(),
    department: z.string(),
  })),
  founded: z.date(),
});

const { object, submit } = useObject({
  api: '/api/generate-company',
  schema: companySchema,
});
```

### Complex Schemas

```ts
const eventSchema = z.object({
  name: z.string(),
  description: z.string(),
  date: z.string().transform(val => new Date(val)),
  location: z.object({
    venue: z.string(),
    address: z.string(),
    capacity: z.number(),
  }),
  speakers: z.array(z.object({
    name: z.string(),
    bio: z.string(),
    topics: z.array(z.string()),
  })),
  ticketTypes: z.array(z.object({
    name: z.string(),
    price: z.number(),
    available: z.number(),
  })),
});

const { object, submit } = useObject({
  api: '/api/generate-event',
  schema: eventSchema,
});
```

## Advanced Patterns

### Dynamic Schema Selection

```ts
const schemas = {
  blogPost: z.object({
    title: z.string(),
    content: z.string(),
    category: z.string(),
  }),
  product: z.object({
    name: z.string(),
    price: z.number(),
    description: z.string(),
    features: z.array(z.string()),
  }),
  user: z.object({
    name: z.string(),
    email: z.string().email(),
    preferences: z.object({
      theme: z.enum(['light', 'dark']),
      notifications: z.boolean(),
    }),
  }),
};

function DynamicObjectGenerator() {
  const [selectedSchema, setSelectedSchema] = useState('blogPost');
  const [prompt, setPrompt] = useState('');

  const { object, submit, isLoading } = useObject({
    api: '/api/generate-object',
    schema: schemas[selectedSchema],
  });

  return (
    <div>
      <select 
        value={selectedSchema} 
        onChange={(e) => setSelectedSchema(e.target.value)}
      >
        <option value="blogPost">Blog Post</option>
        <option value="product">Product</option>
        <option value="user">User Profile</option>
      </select>
      
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter generation prompt..."
      />
      
      <button 
        onClick={() => submit(prompt)}
        disabled={isLoading}
      >
        Generate {selectedSchema}
      </button>
      
      <ObjectDisplay object={object} schema={selectedSchema} />
    </div>
  );
}
```

### Form Auto-filling

```ts
const formSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string(),
});

function AutoFormFiller() {
  const [formData, setFormData] = useState({});
  const { object, submit, isLoading } = useObject({
    api: '/api/generate-form-data',
    schema: formSchema,
    onFinish: (generatedData) => {
      setFormData(generatedData);
    },
  });

  return (
    <div>
      <button 
        onClick={() => submit('Generate sample data for a software engineer')}
        disabled={isLoading}
      >
        Auto-fill Form
      </button>
      
      <form>
        <input
          name="firstName"
          value={formData.firstName || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          placeholder="First Name"
        />
        <input
          name="lastName"
          value={formData.lastName || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          placeholder="Last Name"
        />
        <input
          name="email"
          value={formData.email || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          type="email"
          placeholder="Email"
        />
        <input
          name="role"
          value={formData.role || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
          placeholder="Role"
        />
      </form>
    </div>
  );
}
```

### Batch Generation

```ts
const itemSchema = z.object({
  name: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
});

function BatchObjectGenerator() {
  const [items, setItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { object, submit, reset } = useObject({
    api: '/api/generate-item',
    schema: itemSchema,
    onFinish: (newItem) => {
      setItems(prev => [...prev, newItem]);
      reset();
    },
  });

  const generateBatch = async () => {
    setIsGenerating(true);
    const prompts = [
      'Generate a laptop product',
      'Generate a smartphone product',
      'Generate a tablet product',
    ];

    for (const prompt of prompts) {
      await submit(prompt);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between requests
    }
    
    setIsGenerating(false);
  };

  return (
    <div>
      <button 
        onClick={generateBatch}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating Batch...' : 'Generate Product Catalog'}
      </button>
      
      <div className="generated-items">
        {items.map((item, index) => (
          <div key={index} className="item">
            <h4>{item.name}</h4>
            <p>Price: ${item.price}</p>
            <p>{item.description}</p>
            <span className="category">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Error Handling

### Schema Validation Errors

```ts
function RobustObjectGenerator() {
  const { object, submit, error, isLoading } = useObject({
    api: '/api/generate-object',
    schema: strictSchema,
    onError: (error) => {
      console.error('Object generation failed:', error);
      // Log error for debugging
      trackError('object_generation_failed', { error: error.message });
    },
  });

  return (
    <div>
      {error && (
        <div className="error-container">
          <h4>Generation Failed</h4>
          <p>{error.message}</p>
          <details>
            <summary>Error Details</summary>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </details>
        </div>
      )}
      
      <button onClick={() => submit('Test prompt')}>
        Generate Object
      </button>
      
      {object && <ObjectDisplay object={object} />}
    </div>
  );
}
```

### Fallback Generation

```ts
function FallbackObjectGenerator() {
  const [attempts, setAttempts] = useState(0);
  const [fallbackData, setFallbackData] = useState(null);
  
  const { object, submit, error, isLoading } = useObject({
    api: '/api/generate-object',
    schema: userSchema,
    onError: async (error) => {
      if (attempts >= 3) {
        // Use fallback data after 3 failed attempts
        const fallback = await getFallbackUserData();
        setFallbackData(fallback);
        setAttempts(0);
      } else {
        setAttempts(prev => prev + 1);
        // Retry with simpler prompt
        setTimeout(() => submit('Generate a basic user profile'), 1000);
      }
    },
    onFinish: () => {
      setAttempts(0); // Reset on success
    },
  });

  return (
    <div>
      <button 
        onClick={() => submit('Generate a detailed user profile')}
        disabled={isLoading}
      >
        Generate User
      </button>
      
      {(object || fallbackData) && (
        <UserDisplay 
          user={object || fallbackData} 
          isFallback={!!fallbackData} 
        />
      )}
    </div>
  );
}
```

## Performance Considerations

### Object Caching

```ts
function CachedObjectGenerator() {
  const [cache, setCache] = useState(new Map());
  
  const { object, submit, isLoading } = useObject({
    api: '/api/generate-object',
    schema: productSchema,
    onFinish: (generatedObject, prompt) => {
      // Cache generated objects
      setCache(prev => new Map(prev).set(prompt, generatedObject));
    },
  });

  const cachedSubmit = async (prompt) => {
    if (cache.has(prompt)) {
      // Use cached object
      const cachedObject = cache.get(prompt);
      setObject(cachedObject);
      return;
    }
    
    await submit(prompt);
  };

  return (
    <div>
      <button onClick={() => cachedSubmit('Generate a laptop')}>
        Generate Laptop
      </button>
      {/* Rest of component */}
    </div>
  );
}
```

## Testing

### Hook Testing

```ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useObject } from '@ai-sdk/react';
import { z } from 'zod';

const testSchema = z.object({
  name: z.string(),
  age: z.number(),
});

describe('useObject', () => {
  it('should generate object matching schema', async () => {
    const mockResponse = {
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify({
            name: 'John Doe',
            age: 30,
          })));
          controller.close();
        }
      })
    };

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => 
      useObject({ 
        api: '/api/generate-object',
        schema: testSchema 
      })
    );

    act(() => {
      result.current.submit('Generate user');
    });

    await waitFor(() => {
      expect(result.current.object).toEqual({
        name: 'John Doe',
        age: 30,
      });
    });
  });

  it('should handle schema validation errors', async () => {
    const mockResponse = {
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify({
            name: 'John Doe',
            // missing age field
          })));
          controller.close();
        }
      })
    };

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const onError = jest.fn();

    renderHook(() => 
      useObject({ 
        api: '/api/generate-object',
        schema: testSchema,
        onError 
      })
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
```

## Common Pitfalls

1. **Invalid Schema**: Schema doesn't match expected output structure
2. **Missing Error Handling**: No fallback for validation failures
3. **Complex Schemas**: Overly complex schemas cause generation failures
4. **Performance Issues**: No caching for repeated generations
5. **Type Mismatch**: Frontend expects different structure than schema

## Best Practices

1. **Validate schemas thoroughly** before using
2. **Implement error handling** with fallbacks
3. **Start with simple schemas** and build complexity
4. **Cache generated objects** for repeated use
5. **Test edge cases** with malformed data
6. **Provide clear prompts** for better generation results