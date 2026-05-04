# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack TypeScript interview project implementing a **condition editor** for evaluating return-cart conditions. The backend serves order/return data and evaluates conditions; the frontend renders a UI for building those conditions.

## Commands

### Backend (`backend/`)
```sh
npm run dev        # Start dev server on port 3001 (tsx watch)
npm test           # Run vitest tests once
npm run test:watch # Run vitest in watch mode
```

### Frontend (`frontend/`)
```sh
npm run dev        # Start Vite dev server on port 3000
npm test           # Run vitest tests once
npm run test:watch # Run vitest in watch mode
npm run build      # Build for production
```

**Run a single test file:**
```sh
npx vitest run src/__tests__/myFile.test.ts
```

Frontend proxies `/api/*` to `http://localhost:3001`, so both servers must be running for the full stack.

## Architecture

### Backend (`backend/src/`)
- `index.ts` — Express app (port 3001), CORS enabled, mounts 5 routes under `/api/`
- `types.ts` — All shared TypeScript interfaces
- `data/orders.ts` — 4 sample `OrderPayload` objects
- `data/return-carts.ts` — 4 sample `ReturnCart` objects (reference orders + `return_items[]`)
- `routes/orders.ts` — `GET /api/orders` ✓ implemented
- `routes/return-carts.ts` — `GET /api/return-carts` ✓ implemented
- `routes/reasons.ts` — `GET /api/reasons` TODO: return hierarchical `ReasonNode[]`
- `routes/fields.ts` — `GET /api/condition-fields` TODO: return `ConditionFieldsResponse` (fields + operators by type)
- `routes/evaluate.ts` — `POST /api/conditions/evaluate` TODO: evaluate a `ConditionGroup` against a `ReturnCart`

### Frontend (`frontend/src/`)
- `main.tsx` — React 19 + StrictMode entry
- `App.tsx` — Stub shell; condition editor UI goes here
- `types.ts` — Mirrors backend types (note: uses `'enum'` where backend uses `'boolean'` for `FieldType`)

### Key Types

```ts
// A single condition leaf
type Condition = { field: string; operator: Operator; value: string | number | boolean }

// Recursive condition tree
type ConditionGroup = { logic: 'AND' | 'OR'; conditions: (Condition | ConditionGroup)[] }

// Hierarchical reason tree node
type ReasonNode = { id: string; label: string; children?: ReasonNode[] }

// POST /api/conditions/evaluate body
type EvaluateRequest = { cartId: string; condition: ConditionGroup }
```

### Data Relationships

`ReturnCart` embeds an `order_info` (a full `OrderPayload`) plus `return_items[]`. Each `return_item` has an `item_id` matching an `order_item`, a `reason_id` (leaf node in the reason tree), and a `quantity`.

The sample `return_items` reference reason IDs: `too-large-collar`, `ripped`, `too-small`, `thread-loose` — the reason tree must include these leaf IDs.

### Design Decisions to Make

- **Array field semantics**: Fields like `order_items.unit_price` are arrays — decide whether conditions apply with ANY or ALL semantics.
- **Reason matching**: Whether `reason_id` conditions match exact leaf IDs or prefix-match subtrees.

### Reference Screenshots

`screenshots/` contains 6 PNG mockups showing the target UI: condition builder, condition joining, nested groups, nested reason tree (all/partial selection), and secondary cases.
