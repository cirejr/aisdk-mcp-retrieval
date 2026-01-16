# System Architecture


## Components


- Next.js App Router
- AI SDK (server actions)
- Ollama (local LLM)
- Neon MCP Server
- Postgres database


## Flow
1. User enters NL query in UI
2. Server Action sends prompt to LLM
3. LLM decides which MCP tool to call
4. Neon MCP executes DB query
5. Structured data returned
6. UI renders response


## Key Principle
NO direct SQL generation in UI.
All DB access goes through MCP tools.