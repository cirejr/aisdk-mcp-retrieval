---
name: zod-expert
description: Zod validation expert for this codebase. Use when designing, refining, or wiring Zod schemas into forms so that validation is precise, domain-accurate, and consistent with existing schemas.
license: MIT
version: 1.0.0
---

# Zod Expert Skill

Specialized guidance for using Zod effectively in this repo (especially in `apps/web/lib/schemas` and React forms).

## When to Use

Use this skill when:
- Creating or updating Zod schemas for domain models (Patient, Practitioner, Organization, etc.)
- Adding or tightening validation for React forms (multi-step wizards, field components)
- Deriving TypeScript types from Zod schemas for safer form state and API payloads
- Validating data at boundaries (API responses, user input, external services)

## Core Principles

- Treat Zod schemas as the **single source of truth** for validation.
- Always derive TypeScript types from Zod schemas with `z.infer` instead of hand-written interfaces.
- Prefer **composable sub-schemas** (e.g. `addressSchema`, `contactPointSchema`) reused across domain models.
- Encode real domain constraints (required vs optional, enums, formats) instead of permissive `z.any()`.
- Keep schemas close to where they are conceptually owned (e.g. `lib/schemas/patient.ts` for patient-facing forms).

## Project-Specific Guidance

### 1. Domain Schemas (apps/web/lib/schemas)

- Use existing building blocks from `organization.ts`, `practitioner.ts`, `patient.ts` when modeling new resources.
- For new fields:
  - Choose between `optional()`, `default()`, and `nullable()` deliberately based on FHIR and business rules.
  - Use `z.enum([...])` or `z.literal()` for controlled vocabularies instead of `z.string()`.
- For numeric fields coming from inputs, use `z.preprocess` patterns like in `patientSchema.multipleBirthInteger` to convert strings to numbers safely.

### 2. Forms + Zod Integration

- For forms driven by TanStack React Form or similar:
  - Use the Zod schema as the validation function for `onSubmit` or `onChange`.
  - Example pattern (already used in `patient-form.tsx`):
    - `validators.onSubmit` calls `patientSchema.parseAsync(value)` and returns errors.
- When adding validation to individual fields:
  - Reflect schema constraints in the UI (e.g. mark `.min(1, "message")` fields as required with `*`).
  - Surface `field.state.meta.errors` through `FieldError` components so Zod messages reach the user.

### 3. Error Messages and UX

- Use Zod’s message arguments (`z.string().min(1, "City is required")`) for user-facing text.
- Prefer **short, specific** messages: mention which field is wrong and why.
- Keep messages consistent with translation keys where possible:
  - Either hardcode messages in the schema, or map Zod issues to i18n keys in the UI layer.

### 4. Refinements and Preprocessing

- Use `z.preprocess` for:
  - Converting string inputs to numbers/dates before validation.
  - Normalizing whitespace or formatting (e.g. trim, lowercase emails) at the edge.
- Use `.refine` and `.superRefine` for cross-field constraints:
  - Example: `deceasedDateTime` only valid if `deceasedBoolean === true`.
  - Example: require at least one of several alternative fields.

### 5. API Boundaries

- When consuming backend data or external APIs:
  - Define a Zod schema that mirrors the expected payload.
  - Parse with `schema.parse` / `schema.safeParse` before using data in the UI.
- For FHIR-like resources (CoverageEligibilityRequest, Patient, etc.), keep frontend Zod schemas aligned with backend models and OpenAPI documentation.

## Usage Style for AI Agent

- When adding a new form or step:
  - First design or update the Zod schema in `lib/schemas/*` to reflect the desired constraints.
  - Infer the TS type via `z.infer` and wire it into the form state type.
  - Map each `schemaKey` from the form design to the correct schema path, ensuring UI fields line up with Zod keys.
- When asked to "add validation":
  - Strengthen existing `z.string()` or `z.number()` types with `.min`, `.max`, `.email`, `.url`, `.regex`, or `enum` constraints.
  - Add cross-field `refine` logic where the domain requires it.
- Avoid using `z.any()` or `z.unknown()` unless absolutely necessary, and if used, constrain them as close to the boundary as possible.

This skill must consistently promote precise, domain-accurate Zod schemas and ensure they are correctly wired to both TypeScript types and form components.