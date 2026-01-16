---
name: typescript-expert
description: Deep TypeScript expertise for this codebase. Use when adding or refactoring TypeScript/TSX so that types are precise, inferred correctly, and avoid any except at clearly justified boundaries.
license: MIT
version: 1.0.0
---

# TypeScript Expert Skill

Strong-typing skill for working in this repo's TypeScript/TSX code (especially `apps/web`).

## When to Use

Use this skill when:
- Writing or refactoring TypeScript/TSX components, hooks, or utilities
- Designing or updating domain types (e.g. FHIR-oriented schemas, form value types)
- Wiring Zod schemas to React forms or API payloads
- Replacing loose `any`/`unknown` types with precise models
- Introducing new abstractions (hooks, utilities, components) that should be type-safe and ergonomic

## Core Principles

- Prefer **inference first**: let TypeScript infer types, then add annotations where it improves readability or catches real bugs.
- Avoid `any`. Prefer:
  - Specific concrete types
  - Generics (`<TValue, TError>`) where shape is caller-defined
  - `unknown` + runtime/refinement guards at boundaries (e.g. network, JSON, `any` libs).
- Model **domain concepts** explicitly (e.g. Patient, Practitioner, Organization, FHIR references) instead of generic records.
- Align **runtime schemas** (e.g. Zod) with **static types** (TypeScript) and derive TypeScript types from schemas wherever possible.
- Keep public APIs small, predictable, and well-named; keep complex implementation types internal.

## Project-Specific Guidance

### 1. Forms + Zod Schemas (apps/web)

- Treat `apps/web/lib/schemas/*.ts` as the **single source of truth** for many domain models.
- Always prefer `z.infer<typeof schema>` to re-declaring interfaces.
  - Example: `export type Patient = z.infer<typeof patientSchema>` (already used in this repo).
- When building forms:
  - Type the form state from the Zod schema: `FormApi<Patient>` or `UseFormReturn<Patient>`.
  - Ensure field components accept that specific form API type instead of `any`.

### 2. React Components and Props

- For components:
  - Export explicit `Props` types: `type PatientFormProps = { patient?: Patient }` instead of inline object types repeated across files.
  - Use `React.FC<Props>` only when you need `displayName`/`defaultProps`; otherwise prefer `function Component(props: Props)` for clearer inference.
- For reusable UI components:
  - Extend the correct intrinsic/HTML props: `ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`.
  - Keep generics close to use sites and avoid over-generalization.

### 3. Hooks

- Design hooks with clear, generic signatures:
  - `function useAsync<TData, TError = Error>(fn: () => Promise<TData>): UseAsyncResult<TData, TError>`.
- Avoid `any` in hook return types; define small helper interfaces instead.
- When a hook wraps external libraries, keep the external types at the boundary and expose a simplified, project-specific type surface.

### 4. Data and API Boundaries

- At API boundaries (fetch, Axios, etc.):
  - Start from `unknown` or `unknown`-ish types and refine with Zod (or other validators).
  - Export validated types with `z.infer` and use them across the UI instead of ad-hoc shapes.
- When interfacing with the Node/Express backend:
  - Mirror important backend models (e.g. Patient, CoverageEligibilityRequest) as TypeScript types derived from Zod schemas.
  - Keep FHIR references typed (`{ reference: string; display?: string }`) instead of plain `string` where structure matters.

### 5. Refactoring `any`

When encountering `any` (or obviously wrong types):

1. Identify the **true domain shape** by reading the code paths and related schemas/models.
2. Replace `any` with:
   - The exact domain type if it exists (e.g. `Patient`, `Organization`, `CoverageEligibilityRequest`).
   - A new type alias or interface if the concept is reusable.
   - A generic parameter if the function is intentionally polymorphic.
3. If a value really may be *anything*, switch to `unknown` and add runtime checks / schema validation at usage points.
4. Ensure function signatures, not just internals, communicate precise types so callers get strong completion and error checking.

### 6. Generics and Utility Types

- Use generics to express relationships between inputs and outputs (e.g. map/filter helpers, form utilities) rather than `any`-typed helpers.
- Prefer built-in utility types (`Partial`, `Pick`, `Omit`, `ReturnType`, etc.) over hand-rolled `Record<string, any>`.
- Keep generic constraints narrow: `T extends Patient` is better than `T extends object`.

## Usage Style for AI Agent

- When asked to write or modify TypeScript/TSX, **activate this skill** and:
  - Inspect nearby types and schemas before editing.
  - Propose type aliases/interfaces when seeing repeated shapes.
  - Explain type design tradeoffs briefly when introducing new generics or domain types.
- When generating code, prioritize examples that:
  - Compile under strict TypeScript settings
  - Avoid `any` and minimize casts (`as`) to only truly safe, well-justified cases.

This skill must consistently favor precise, domain-accurate types and avoid sprinkling `any` as a shortcut.
