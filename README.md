# Condition Editor

Build a condition editor with two parts:

1. A **Node/Express backend** that serves data and evaluates conditions
2. A **React frontend** where users create conditions by picking a field, an operator, and a value

The editor also includes a nested reason selector with checkboxes.

Use AI tools freely. Use TypeScript for all code.

---

## Getting Started

```bash
# Backend
cd backend
npm install
npm run dev    # Runs on http://localhost:3001

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev    # Runs on http://localhost:3000, proxies /api to backend
```

Types are defined in `frontend/src/types.ts` and `backend/src/types.ts`.

---

## Part 1 — Backend

Build the API endpoints listed below. Route stubs already exist in `backend/src/routes/`. The orders endpoint already works — you need to implement the rest.

### `GET /api/reasons`

Return a reason tree. The tree must be at least 3 levels deep with multiple branches. Use this structure:

```
Fit
  Too large
    Collar, Sleeves, Waist
  Too small
    Collar, Sleeves, Waist
  Too short
    Collar, Sleeves, Waist
Item damaged
  Wrinkled
    Severely, Easily noticeable, Somewhat noticeable
  Ripped
    Severely, Easily noticeable, Somewhat noticeable
  Thread lose
    Severely, Easily noticeable, Somewhat noticeable
```

Response shape:

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
          { "id": "too-large-collar", "label": "Collar" }
        ]
      }
    ]
  }
]
```

### `GET /api/condition-fields`

Return the list of fields that can be used in conditions. Each field has a type and a set of valid operators.

These fields map to properties inside the order object (see `GET /api/orders` for the full structure).

| Field | Type | Path in Order | Notes |
|-------|------|---------------|-------|
| Customer Email | string | `customer.email` | |
| Order Total | number | `billing.amount` | |
| Item Price | number | `order_items.unit_price` | Array field — each order has multiple items |
| Carrier | string | `shipments.carrier` | Array field — each order has multiple shipments |
| Country | string | `customer.address.country` | |
| Is Final Sale | boolean | `order_items.is_final_sale` | Array field |
| Is Gift | boolean | `order_items.is_gift` | Array field |
| Item Color | string | `order_items.color` | Array field |
| Reason | special | — | Values come from `/api/reasons` |

Operators by type:
- **string**: is, is not, contains, starts with, ends with
- **number**: is, is not, >, >=, <, <=
- **boolean**: is, is not

### `GET /api/orders`

Already implemented. Returns the sample orders from `backend/src/data/orders.ts`. These are the orders that conditions will be tested against. There are 4 orders with different characteristics (high/low value, domestic/international, gifts, final sale items, different carriers, etc.).

### `POST /api/conditions/evaluate`

Accept a set of conditions and an order. Return whether the order matches.

Conditions can be nested using AND/OR groups. Here is an example request:

```json
{
  "conditions": {
    "logic": "AND",
    "conditions": [
      { "field": "customer.email", "operator": "CONTAINS", "value": "@example.com" },
      {
        "logic": "OR",
        "conditions": [
          { "field": "billing.amount", "operator": "GT", "value": 500 },
          { "field": "order_items.unit_price", "operator": "GT", "value": 100 }
        ]
      }
    ]
  },
  "order": { ... }
}
```

Response: `{ "match": true }`

Some fields (like `order_items.unit_price`) point to arrays in the order object. For example, an order can have many items, each with its own price. You need to decide how to handle this. For example: does `order_items.unit_price GT 100` mean "any item over $100" or "all items over $100"? The choice is yours.

**Example rules your endpoint should handle:**
- `customer.email CONTAINS @example.com` — email contains "@example.com"
- `billing.amount GT 500` — order total is greater than 500
- `order_items.unit_price GT 100` — at least one item is priced over 100
- `shipments.carrier EQ fedex` — carrier is "fedex"
- `order_items.is_final_sale EQ true` — at least one item is final sale
- `customer.address.country NOT_EQ US` — country is not "US"

---

## Part 2 — Frontend

Build a condition editor sidebar.

### Condition Rows

Each condition row has three inputs:
1. **Field dropdown** — shows the fields from `GET /api/condition-fields`
2. **Operator dropdown** — shows only the operators valid for the selected field's type
3. **Value input** — text input for strings, number input for numbers, checkbox/dropdown for booleans

### Adding Conditions

Users can add more condition rows. Each row is joined to the others by AND or OR.

### Nested Reason Selector

When the user picks **"Reason"** as the field, the value input changes to a checkbox dropdown. This dropdown shows the reason tree from `GET /api/reasons`.

**How it should work:**

1. Show the reason tree as nested checkboxes inside a dropdown
2. **Checking a box** checks that item and all items below it. Items at the same level and above are not affected.
   - Example: Everything is unchecked. You check "Fit". Now Fit, Too large, Too small, Too short, and all their children (Collar, Sleeves, Waist) are checked. "Item damaged" is still unchecked.
3. **Unchecking a box** unchecks that item and all items below it. Items at the same level and the parent stay as they are.
   - Example: Everything is checked. You uncheck "Collar" (under Too large). Only Collar becomes unchecked. "Sleeves" and "Waist" stay checked. "Too large" shows a dash (indeterminate) because not all of its children are checked.
4. **Indeterminate state (dash):** When some children are checked and some are not, the parent shows a dash instead of a checkmark. This applies at every level — if "Too large" shows a dash, then "Fit" also shows a dash.
5. **Summary display:** Show the selected values as chips/tags:
   - If all children of a parent are selected: `"Fit > All"`
   - If some children are selected: `"Fit > Too large > Collar, Sleeves"`
   - A mix of both is possible — show multiple chips
6. Individual leaf items (items with no children) can always be checked or unchecked on their own

### Evaluate Button

Add an "Evaluate" button. When clicked, it sends the current conditions to `POST /api/conditions/evaluate` along with one of the sample orders from `GET /api/orders`. Display whether the order matched or not. You can let the user pick which order to test, or use a hardcoded one.

---

## Stretch Goals

If you have extra time:

- Support multiple cases (Case 1, Case 2, Else)
- Support nested condition groups within a case
