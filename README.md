# Neon MCP + AI SDK Demo (Agent-Driven)


## 🧠 What This Project Is
An AI agent-driven Next.js application that demonstrates how to use AI SDK with Ollama and Neon MCP to retrieve data from a Neon database using natural language through the Neon MCP server.


The project demonstrates how to:
- Use **AI SDK + Ollama** for LLM reasoning
- Use **Vercel AI Elements** to build an AI‑powered chat UI
- Access a **Neon Postgres database exclusively via MCP**
- Retrieve and present **real database data using natural language**, not handwritten SQL


the product goal is to showcase **NL → MCP → Neon data retrieval inside a modern Next.js app**.


## 🎯 High-Level Goal


Build an app where:
1. A user types a natural-language question
2. An LLM (via AI SDK + Ollama) interprets the request
3. The LLM calls Neon MCP tools
4. Data is fetched from Neon
5. Results are rendered in a chat UI


No direct SQL generation in the UI. Only the result is shown to the user.
All database access goes through MCP tools.


---