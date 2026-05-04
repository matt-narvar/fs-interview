# Frontend Agent Spec — Condition Editor

### Context

This is a condition editor for a returns management system. Conditions are evaluated against a **return cart** — an order combined with a customer's in-progress return selections (which items they're returning and why). The backend evaluates those conditions and returns whether a given cart matches.

---

### Type Alignment

The frontend `types.ts` has `FieldType = 'string' | 'number' | 'enum'`. **Change this to:**

```ts
export type FieldType = 'string' | 'number' | 'boolean';
```

Remove `'enum'` — it is not used. The backend will send `'boolean'` for boolean fields. The `operators` map in `ConditionFieldsResponse` is keyed by this type, so they must match.

---

### API Contracts

All endpoints are served at `http://localhost:3001` (proxied from the frontend via `/api`).

---

#### `GET /api/reasons`

Returns a tree of return reasons. The tree is 2–3 levels deep. **Leaf nodes** are the values a customer can actually select; the root/branch nodes are groupings only.

```json
[
  {
    "id": "fit",
    "label": "Fit",
    "children": [
      {
        "id": "too-large",
        "label": "Too large",
        "children": [
          { "id": "too-large-collar", "label": "Collar" },
          { "id": "too-large-sleeves", "label": "Sleeves" },
          { "id": "too-large-waist", "label": "Waist" }
        ]
      },
      { "id": "too-small", "label": "Too small" },
      { "id": "too-short", "label": "Too short" }
    ]
  },
  {
    "id": "item-damaged",
    "label": "Item damaged",
    "children": [
      { "id": "wrinkled", "label": "Wrinkled" },
      { "id": "ripped", "label": "Ripped" },
      { "id": "thread-loose", "label": "Thread loose" }
    ]
  }
]
```

Nodes without `children` are leaves. **Only leaf IDs will ever appear in a cart's `return_items[].reason_id`.**

---

#### `GET /api/condition-fields`

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
    "string": [
      { "value": "IS",          "label": "is" },
      { "value": "IS_NOT",      "label": "is not" },
      { "value": "CONTAINS",    "label": "contains" },
      { "value": "STARTS_WITH", "label": "starts with" },
      { "value": "ENDS_WITH",   "label": "ends with" }
    ],
    "number": [
      { "value": "IS",     "label": "is" },
      { "value": "IS_NOT", "label": "is not" },
      { "value": "GT",     "label": ">"  },
      { "value": "GTE",    "label": ">=" },
      { "value": "LT",     "label": "<"  },
      { "value": "LTE",    "label": "<=" }
    ],
    "boolean": [
      { "value": "IS",     "label": "is" },
      { "value": "IS_NOT", "label": "is not" }
    ]
  }
}
```

**Reason field note:** `return_items.reason_id` has type `"string"` and will appear with the full string operator set. The frontend should detect this field by its `value` identifier and render a **nested checkbox tree** (sourced from `GET /api/reasons`) instead of a text input. Restricting the operator dropdown to IS / IS_NOT only for this field is recommended for UX but not required.

---

#### `GET /api/return-carts`

Returns 4 sample carts. Each cart has a full `order_info` embedded plus `return_items`.

```ts
interface ReturnCart {
  id: string;
  description: string;
  order_info: { /* full order */ };
  return_items: Array<{ item_id: string; reason_id: string; quantity: number }>;
}
```

The 4 carts and their notable characteristics for testing:

| id | description | notable fields |
|----|-------------|----------------|
| `cart-1` | High-value US, FedEx | `billing.amount: 554.19`, items over $100, `reason: too-large-collar`, country: US |
| `cart-2` | Gift, Canada, UPS | `is_gift: true`, country: CA, `reason: ripped`, low billing amount |
| `cart-3` | Final sale, USPS, US | `is_final_sale: true`, `reason: too-small` |
| `cart-4` | Bulk, FedEx+UPS, `@example.com` email | `billing.amount: 2133.70`, `reason: thread-loose` |

---

#### `POST /api/conditions/evaluate`

**Request body:**

```ts
interface EvaluateRequest {
  conditions: ConditionGroup;
  cart: ReturnCart; // full cart object from GET /api/return-carts
}

interface ConditionGroup {
  logic: 'AND' | 'OR';
  conditions: Array<Condition | ConditionGroup>; // recursive
}

interface Condition {
  field: string;                          // e.g. "billing.amount"
  operator: string;                       // e.g. "GT"
  value: string | number | boolean | string[]; // string[] for multi-leaf reason selections
  quantifier?: 'any' | 'all';            // only for array fields; defaults to 'any'
}
```

**Response:**

```json
{ "match": true }
```

**Semantics to know:**
- Array fields (`order_items.unit_price`, `order_items.is_final_sale`, `order_items.is_gift`, `order_items.color`, `shipments.carrier`) support a `quantifier` on the condition:
  - `'any'` (default) — passes if **any** element satisfies the condition
  - `'all'` — passes if **all** elements satisfy the condition
  - The UI should show an "any item / all items" toggle when the selected field is an array field.
- Reason matching is **exact leaf match** — `reason_id IS too-large-collar` only matches a cart whose `return_items` contains `reason_id === "too-large-collar"`. Pick leaf IDs from the tree as condition values.

---

### UI Requirements

#### Condition rows

Each row: **Field dropdown** → **Operator dropdown** (filtered to the selected field's type) → **Value input** (text for string, number input for number, IS/IS_NOT toggle or dropdown for boolean).

Rows are joined by a shared AND / OR selector.

#### Reason field — nested checkbox tree

When the selected field is `return_items.reason_id`, replace the value input with a checkbox dropdown showing the reason tree.

Rules:
- **Check a node** → checks it and all descendants
- **Uncheck a node** → unchecks it and all descendants; parent stays, but may become indeterminate
- **Indeterminate** → shown when some but not all children are checked; propagates up all levels
- **Leaf nodes** → always independently checkable

Summary chips below (or in) the dropdown:
- All children of a node selected → `"Fit > All"`
- Some children selected → `"Fit > Too large > Collar, Sleeves"`

The condition value sent to the API should be a **`string[]` of all selected leaf IDs**. When the user checks a parent node (e.g. "Fit"), expand it to all leaf IDs underneath and send those as the array. The backend's IS operator on an array value means "is any of" — so one condition row covers the whole subtree selection.

Example: user checks "Fit" → send `{ field: "return_items.reason_id", operator: "IS", value: ["too-large-collar", "too-large-sleeves", "too-large-waist", "too-small", "too-short"] }`

#### Evaluate button

Lets the user pick one of the 4 return carts (show `description` as the label), then POSTs the current condition group + selected cart to `/api/conditions/evaluate`. Display `✓ Matched` or `✗ No match`.

---

### Startup

```bash
cd backend && npm install && npm run dev   # port 3001
cd frontend && npm install && npm run dev  # port 3000, proxies /api to backend
```
