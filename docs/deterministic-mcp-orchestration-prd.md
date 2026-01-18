# Deterministic MCP Orchestration PRD

## 1. Overview

This document defines the product requirements for a deterministic orchestration layer built on top of MCP (Model Context Protocol) tools and AI models. The system is designed to ensure predictable, repeatable behavior when interacting with infrastructure (databases, APIs, services), especially when using lightweight language models (3B–4B).

The core principle is strict separation of concerns:

* **AI models reason and describe**
* **Code orchestrates and executes**

---

## 2. Problem Statement

### 2.1 Current Issues

When AI models are allowed to reason over and directly invoke MCP tools:

* Lightweight models fail at multi-step planning
* Tool calls happen in the wrong order
* Models ask for confirmations that should be implicit
* Execution becomes non-deterministic and hard to debug

These failures increase as the number of successive MCP tool calls grows.

### 2.2 Root Cause

The model is overloaded with responsibilities:

* Interpreting intent
* Planning execution
* Selecting tools
* Managing state and side effects

This mixes reasoning with execution, which is brittle and unpredictable.

---

## 3. Goals

* Achieve deterministic, repeatable execution flows
* Support lightweight models without degradation
* Abstract MCP complexity away from the model
* Enable agent portability across IDEs and runtimes
* Make failures observable and debuggable

---

## 4. Non-Goals

* Building fully autonomous agents
* Allowing models to self-direct execution
* Dynamic tool discovery driven by the model
* Replacing MCP or extending its protocol

---

## 5. Key Design Principles

1. **Determinism over autonomy**
2. **Code controls flow, AI provides intelligence**
3. **No model-driven tool chaining**
4. **Explicit, fixed execution pipelines**
5. **Strict input/output contracts**

---

## 6. System Architecture

### 6.1 AI Layer (Declarative)

The model is responsible for:

* Understanding user intent
* Producing structured outputs (plans, queries, summaries)
* Explaining results

The model is not allowed to:

* Choose tools
* Decide execution order
* Perform side effects

---

### 6.2 Orchestration Layer (Imperative)

The orchestration code:

* Defines step-by-step execution flows
* Invokes MCP tools in a fixed order
* Passes outputs from one step to the next
* Handles errors and validation

---

### 6.3 MCP Tools (Execution Units)

MCP tools are:

* Single-purpose
* Stateless
* Strictly typed
* Invoked only by the orchestrator

They do not contain planning or decision logic.

---

## 7. Example Use Case (High-Level)

User: "Show me sales per month"

1. Model extracts intent and desired aggregation
2. Orchestrator fetches project and schema context
3. Model generates a SQL query
4. Orchestrator executes the query via MCP
5. Model formats and explains the result

Execution order is fixed and guaranteed.

---

## 8. Success Metrics

* Zero model-driven execution branching
* Identical behavior across multiple runs
* Successful execution with ≤3B models
* Reduced tool-call related errors

---

## 9. Risks & Mitigations

| Risk                   | Mitigation                                 |
| ---------------------- | ------------------------------------------ |
| Reduced flexibility    | Add new pipelines instead of dynamic logic |
| More code upfront      | Gains in reliability and debuggability     |
| Over-constrained flows | Use multiple specialized pipelines         |

---

## 10. Summary

This system redefines AI agents as **deterministic systems with intelligent components**, rather than autonomous actors. By removing execution authority from the model, we achieve reliability, scalability, and model-agnostic behavior.
