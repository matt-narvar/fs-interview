# Backend Requirements — from Frontend Agent

This file documents what the frontend needs from the backend to function correctly. The backend agent should treat these as acceptance criteria.

---

## Authentication

**Current state:** No authentication on any endpoint. All `/api/*` routes are open.

**Question for backend agent:** Does the frontend need to send any credentials (API key header, session cookie, Bearer token)? If yes, specify:
- Header name / cookie name
- How the frontend should obtain the token (login endpoint? hardcoded for dev?)
- Whether the frontend should handle 401 responses and redirect somewhere

For now the frontend assumes **no auth required** and sends plain fetch requests. If auth is added, all three hooks (`useConditionFields`, `useReasons`, `useReturnCarts`) and the evaluate POST call will need a credentials header added.

---

## Required Endpoints

### `GET /api/reasons`

**Response shape:**
```ts
ReasonNode[]

interface ReasonNode {
  id: string;
  label: string;
  children?: ReasonNode[];   // absent on leaf nodes
}
```

**Constraints the frontend depends on:**
- Leaf nodes (no `children`) are the only IDs that will appear in `return_items[].reason_id`
- The following leaf IDs MUST exist to match the sample carts: `too-large-collar`, `ripped`, `too-small`, `thread-loose`
- Tree must be at least 2 levels deep (root → leaf or root → branch → leaf)

**Example (minimum acceptable):**
```json
[
  { "id": "fit", "label": "Fit", "children": [
    { "id": "too-large", "label": "Too large", "children": [
      { "id": "too-large-collar", "label": "Collar" },
      { "id": "too-large-sleeves", "label": "Sleeves" },
      { "id": "too-large-waist", "label": "Waist" }
    ]},
    { "id": "too-small", "label": "Too small" },
    { "id": "too-short", "label": "Too short" }
  ]},
  { "id": "item-damaged", "label": "Item damaged", "children": [
    { "id": "wrinkled", "label": "Wrinkled" },
    { "id": "ripped", "label": "Ripped" },
    { "id": "thread-loose", "label": "Thread loose" }
  ]}
]
```

---

### `GET /api/condition-fields`

**Response shape:**
```ts
interface ConditionFieldsResponse {
  fields: ConditionField[];
  operators: Record<'string' | 'number' | 'boolean', Operator[]>;
}

interface ConditionField {
  value: string;   // dot-path used in Condition.field
  label: string;   // human-readable display name
  type: 'string' | 'number' | 'boolean';
}

interface Operator {
  value: string;   // sent as Condition.operator in evaluate request
  label: string;   // displayed in operator dropdown
}
```

**Constraints the frontend depends on:**
- `type` must be exactly `'string'`, `'number'`, or `'boolean'` — NOT `'enum'`
- The `operators` map must have keys for all three types
- Operator `value` strings must match exactly what `POST /api/conditions/evaluate` accepts

**Expected exact response:**
```json
{
  "fields": [
    { "value": "customer.email",            "label": "Customer Email",  "type": "string"  },
    { "value": "billing.amount",            "label": "Order Total",     "type": "number"  },
    { "value": "order_items.unit_price",    "label": "Item Price",      "type": "number"  },
    { "value": "shipments.carrier",         "label": "Carrier",         "type": "string"  },
    { "value": "customer.address.country",  "label": "Country",         "type": "string"  },
    { "value": "order_items.is_final_sale", "label": "Is Final Sale",   "type": "boolean" },
    { "value": "order_items.is_gift",       "label": "Is Gift",         "type": "boolean" },
    { "value": "order_items.color",         "label": "Item Color",      "type": "string"  },
    { "value": "return_items.reason_id",    "label": "Reason",          "type": "string"  }
  ],
  "operators": {
    "string":  [
      { "value": "IS",          "label": "is"          },
      { "value": "IS_NOT",      "label": "is not"      },
      { "value": "CONTAINS",    "label": "contains"    },
      { "value": "STARTS_WITH", "label": "starts with" },
      { "value": "ENDS_WITH",   "label": "ends with"   }
    ],
    "number":  [
      { "value": "IS",     "label": "is"     },
      { "value": "IS_NOT", "label": "is not" },
      { "value": "GT",     "label": ">"      },
      { "value": "GTE",    "label": ">="     },
      { "value": "LT",     "label": "<"      },
      { "value": "LTE",    "label": "<="     }
    ],
    "boolean": [
      { "value": "IS",     "label": "is"     },
      { "value": "IS_NOT", "label": "is not" }
    ]
  }
}
```

---

### `GET /api/return-carts`

**Already implemented.** Frontend uses `id` and `description` fields for the cart picker, and sends the full cart object in the evaluate request body. No changes needed.

---

### `POST /api/conditions/evaluate`

**Request body:**
```ts
interface EvaluateRequest {
  conditions: ConditionGroup;
  cart: ReturnCart;   // full object from GET /api/return-carts
}

interface ConditionGroup {
  logic: 'AND' | 'OR';
  conditions: Array<Condition | ConditionGroup>;   // recursive
}

interface Condition {
  field: string;                               // e.g. "billing.amount"
  operator: string;                            // e.g. "GT" — must match values from /api/condition-fields
  value: string | number | boolean | string[]; // string[] for multi-leaf reason selections
  quantifier?: 'any' | 'all';                 // only for array fields; omit or set 'any' for default behaviour
}
```

**Response:**
```json
{ "match": true }
```

**Constraints the frontend depends on:**
- Must accept `Content-Type: application/json`
- Must return `{ match: boolean }` — no other shape
- Must support nested `ConditionGroup` inside `conditions[]` (recursive)
- The `value` field: the frontend will send `true`/`false` as actual JSON booleans and numbers as actual JSON numbers (not strings). The backend must NOT require string coercion.
- Must return `400` for malformed body (missing `conditions` or `cart`)
- Must return `200` (not `201`) on success

**Semantics the backend must implement:**
- Array fields (`order_items.*`, `shipments.carrier`, `return_items.reason_id`) → controlled by `quantifier`:
  - `'any'` (default, omitted) — passes if **any** element satisfies the condition
  - `'all'` — passes if **all** elements satisfy the condition
  - The UI should render an "any item / all items" toggle when an array field is selected
- Reason matching → **exact leaf ID match**: `IS "too-large-collar"` only matches a cart with that exact `reason_id`, not parent IDs like `"fit"`

---

## CORS

Frontend runs on `http://localhost:3000`, backend on `http://localhost:3001`. CORS must allow `localhost:3000` (already configured via `cors()` middleware). No changes needed.

---

## Error format

If the backend returns an error, the frontend will display a generic error message. The frontend only checks for:
- `response.ok` (status 200–299) → success
- Any non-ok response → show error state

The error body shape does not matter to the frontend.
