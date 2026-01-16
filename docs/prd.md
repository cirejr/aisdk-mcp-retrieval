# Product Requirements Document


## 🏆 Project Name
Neon MCP NL Query App


## 🎯 Goal
Demonstrate how an AI agent can use natural language to retrieve structured data from a Neon database using MCP inside a Next.js app.


## 👤 Target Users
- Developers exploring MCP
- AI engineers
- Product builders


## 🧠 Core Features
1. Chat UI powered by Vercel AI Elements
2. Ollama‑powered LLM via AI SDK
3. Neon MCP server connection
4. Natural‑language → DB query → structured response


## 📌 User Stories


### US‑001
As a user
I want to ask questions about my data in natural language
So that I don’t need to write SQL


Acceptance:
- Input is natural language
- Data is retrieved from Neon via MCP


### US‑002
As a developer
I want a clean agent‑driven architecture
So that the system is easy to extend


## 📈 Success Criteria
- **Measurable**: All Acceptance Criteria in User Stories are verified by a passing test or script.
- End‑to‑end demo works locally
- Clear separation of AI, DB, UI layers