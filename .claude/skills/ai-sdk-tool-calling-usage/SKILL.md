# AI SDK Tool Calling Usage Expert

Expert guidance on using AI SDK tools and tool calling for extending LLM capabilities. Use when designing, implementing, or optimizing tools with the Vercel AI SDK.

## Core Concepts

### What are Tools?
Tools are actions that an LLM can invoke to perform discrete tasks and interact with the outside world. They enable LLMs to:
- Perform mathematics and logical operations
- Access real-time information (weather, search, etc.)
- Interact with external APIs and services
- Process and manipulate data beyond text generation

### Tool Structure
Every tool consists of three key properties:

```ts
const myTool = {
  description: 'Optional description that influences when the tool is picked',
  inputSchema: z.object({
    parameter: z.string(),
  }),
  execute: async ({ parameter }) => {
    // Tool execution logic
    return result;
  },
};
```

**Properties:**
- **`description`**: Influences LLM tool selection decisions
- **`inputSchema`**: Zod schema or JSON schema for input validation
- **`execute`**: Async function called with validated arguments

## Schemas

### Supported Schema Types
- **Zod**: Direct support for v3 and v4 via `zodSchema()`
- **Valibot**: Via `valibotSchema()` from `@ai-sdk/valibot`
- **JSON Schema**: Standard JSON Schema compatible schemas
- **Raw JSON**: Via `jsonSchema()` helper function

### Usage Examples

```ts
// Zod schema
const weatherTool = {
  inputSchema: z.object({
    location: z.string(),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  }),
  execute: async ({ location, units }) => {
    // Weather API call
  },
};

// JSON Schema
const weatherTool = {
  inputSchema: {
    type: 'object',
    properties: {
      location: { type: 'string' },
      units: { type: 'string', enum: ['celsius', 'fahrenheit'] },
    },
    required: ['location'],
  },
  execute: async (input) => {
    // Weather API call
  },
};
```

## Tool Usage

### Basic Tool Implementation
```ts
import { generateText, stepCountIs } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-haiku-4.5',
  prompt: 'What is the weather in London?',
  tools: {
    getWeather: {
      description: 'Get weather information for a location',
      inputSchema: z.object({
        location: z.string(),
        units: z.enum(['celsius', 'fahrenheit']).default('celsius'),
      }),
      execute: async ({ location, units }) => {
        const weather = await fetchWeather(location, units);
        return weather;
      },
    },
  },
  stopWhen: stepCountIs(10), // Allow multi-step tool calls
});
```

### Multi-step Tool Calling
When tools need to be called multiple times in sequence:

```ts
const result = await generateText({
  model,
  prompt: 'Search for Vercel Ship AI and summarize the key dates',
  tools: {
    webSearch: searchTool,
    summarize: summaryTool,
  },
  stopWhen: stepCountIs(5), // Allows tool chaining
});
```

## Tool Packages

### Using Ready-Made Tools
Install tool packages and import directly:

```bash
pnpm add @tavily/ai-sdk @perplexity-ai/ai-sdk
```

```ts
import { generateText } from 'ai';
import { searchTool } from '@tavily/ai-sdk';
import { perplexitySearchTool } from '@perplexity-ai/ai-sdk';

const { text } = await generateText({
  model: 'anthropic/claude-3-haiku-20240307',
  prompt: 'Search for the latest AI developments',
  tools: {
    tavily: searchTool,
    perplexity: perplexitySearchTool,
  },
});
```

### Publishing Your Own Tools
Create reusable tool packages:

```ts
// my-tools/index.ts
export const weatherTool = {
  description: 'Get weather information',
  inputSchema: z.object({
    location: z.string(),
    units: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  }),
  execute: async ({ location, units }) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await fetch(
      `https://api.weather.com/v1/weather?location=${location}&units=${units}&apiKey=${apiKey}`
    );
    return response.json();
  },
};

export const calculatorTool = {
  description: 'Perform mathematical calculations',
  inputSchema: z.object({
    expression: z.string(),
  }),
  execute: async ({ expression }) => {
    // Safe math evaluation
    return eval(expression);
  },
};
```

### Tool Package Template
Use the [AI SDK Tool Package Template](https://github.com/vercel-labs/ai-sdk-tool-as-package-template) for professional tool publishing.

## Toolsets and Ecosystem

### Ready-to-Use Tool Packages

**Web Search & Information:**
- `@exalabs/ai-sdk` - Web search with real-time information
- `@parallel-web/ai-sdk-tools` - Web search and content extraction
- `@perplexity-ai/ai-sdk` - Advanced search with filtering
- `@tavily/ai-sdk` - Enterprise-grade web exploration tools

**Enterprise Integration:**
- **Stripe agent tools** - Payment processing and financial operations
- **StackOne ToolSet** - 500+ enterprise SaaS integrations
- **Composio** - 250+ tools (GitHub, Gmail, Salesforce, etc.)

**Browser & Automation:**
- **Amazon Bedrock AgentCore** - Managed browser runtime and code interpreter
- **browserbase** - Headless browser automation
- **browserless** - Self-hosted or cloud-based browser automation

**Data & Search:**
- `@airweave/vercel-ai-sdk` - Semantic search across 35+ data sources
- **JigsawStack** - 30+ specialized fine-tuned models
- **AI Tools Registry** - Shadcn-compatible tool definitions

**Development & Utilities:**
- **bash-tool** - File operations and bash execution with sandbox support
- **Toolhouse** - 25+ actions in 3 lines of code

### MCP Tools

**Marketplace Platforms:**
- **Smithery** - 6,000+ MCPs including Browserbase and Exa
- **Pipedream** - 3,000+ integrations for apps and AI agents
- **Apify** - Marketplace of web scraping and automation tools

### Building Custom Tools

**API Integration:**
- **AI Tool Maker** - Generate tools from OpenAPI specs
- **Interlify** - Convert APIs into tools automatically
- **DeepAgent** - 50+ tools and integrations for various services

## Best Practices

### Tool Design Principles
1. **Clear Descriptions**: Help LLM understand when to use the tool
2. **Precise Schemas**: Validate inputs and prevent errors
3. **Error Handling**: Return structured error messages
4. **Idempotency**: Tools should produce consistent results
5. **Security**: Validate and sanitize all inputs

### Schema Design
```ts
// Good: Precise with constraints
const searchTool = {
  inputSchema: z.object({
    query: z.string().min(1).max(500),
    limit: z.number().min(1).max(100).default(10),
    type: z.enum(['web', 'news', 'images']).default('web'),
  }),
};

// Avoid: Too permissive
const badSearchTool = {
  inputSchema: z.object({
    query: z.string(),
    options: z.any(), // Avoid 'any' type
  }),
};
```

### Error Handling
```ts
const robustTool = {
  execute: async ({ input }) => {
    try {
      const result = await someApiCall(input);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        suggestion: 'Check your API key or try again later'
      };
    }
  },
};
```

### Performance Considerations
- **Caching**: Cache expensive API responses
- **Timeouts**: Set reasonable timeouts for external calls
- **Batching**: Combine multiple requests when possible
- **Rate Limiting**: Respect API rate limits

## Advanced Patterns

### Tool Chaining
```ts
const tools = {
  search: searchTool,
  extract: extractTool,
  summarize: summarizeTool,
};

// LLM can chain these tools automatically
const result = await generateText({
  model,
  prompt: 'Find recent AI news and create a summary',
  tools,
  stopWhen: stepCountIs(5),
});
```

### Conditional Tool Execution
```ts
const conditionalTool = {
  inputSchema: z.object({
    action: z.enum(['search', 'analyze', 'report']),
    data: z.string().optional(),
  }),
  execute: async ({ action, data }) => {
    switch (action) {
      case 'search':
        return await searchFunction(data);
      case 'analyze':
        return await analyzeFunction(data);
      case 'report':
        return await reportFunction(data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  },
};
```

### Tool Composition
```ts
const composedTool = {
  inputSchema: z.object({
    searchQuery: z.string(),
    analysisType: z.enum(['sentiment', 'topics', 'summary']),
  }),
  execute: async ({ searchQuery, analysisType }) => {
    // Step 1: Search
    const searchResults = await searchTool.execute({ query: searchQuery });
    
    // Step 2: Analyze results
    const analysis = await analysisTool.execute({
      data: searchResults,
      type: analysisType,
    });
    
    return { searchResults, analysis };
  },
};
```

## Testing and Validation

### Tool Testing
```ts
describe('weatherTool', () => {
  it('should validate input schema', async () => {
    const result = await weatherTool.execute({
      location: 'London',
      units: 'celsius',
    });
    expect(result).toBeDefined();
  });

  it('should handle invalid input', async () => {
    await expect(
      weatherTool.execute({ location: '', units: 'invalid' })
    ).rejects.toThrow();
  });
});
```

### Integration Testing
```ts
describe('Multi-step tool usage', () => {
  it('should chain tools correctly', async () => {
    const result = await generateText({
      model,
      prompt: 'Search for AI news and summarize',
      tools: { search: searchTool, summarize: summaryTool },
      stopWhen: stepCountIs(3),
    });
    
    expect(result.toolCalls).toHaveLength(2);
  });
});
```

## Common Pitfalls

1. **Missing Descriptions**: LLM doesn't know when to use the tool
2. **Poor Schema Validation**: Leads to runtime errors
3. **No Error Handling**: Tools fail silently or crash
4. **Blocking Operations**: Slow tools timeout and break the flow
5. **Security Issues**: Not validating inputs before processing

## Debugging

### Enable Detailed Logging
```ts
const result = await generateText({
  model,
  prompt,
  tools,
  onToolCall: ({ toolCall }) => {
    console.log('Tool called:', toolCall);
  },
  onToolResult: ({ toolCall, toolResult }) => {
    console.log('Tool result:', toolResult);
  },
});
```

### Common Debugging Scenarios
- Tool not being called: Check description and schema
- Tool errors: Review input validation
- Performance issues: Profile execute functions
- Unexpected behavior: Enable logging and trace execution

Use this skill to build robust, efficient, and maintainable tools that extend LLM capabilities with the Vercel AI SDK.