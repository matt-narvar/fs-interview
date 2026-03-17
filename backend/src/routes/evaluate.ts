import { Router } from 'express';

export const evaluateRouter = Router();

// TODO: POST / - Evaluate conditions against a return cart
//
// Request body shape:
//   {
//     conditions: ConditionGroup,
//     cart: <return cart from /api/return-carts>
//   }
//
// A return cart contains order_info (same shape as orders) plus return_items[],
// where each return item has { item_id, reason_id, quantity }.
//
// A ConditionGroup has:
//   { logic: "AND" | "OR", conditions: Array<Condition | ConditionGroup> }
//
// A Condition has:
//   { field: string, operator: string, value: string | number | boolean }
//
// Operators: EQ, NOT_EQ, GT, GTE, LT, LTE, CONTAINS, STARTS_WITH, ENDS_WITH
//
// The cart's order_info is a nested object with arrays (order_items, shipments).
// How you resolve fields like "order_items.unit_price" against arrays is up to you.
//
// The Reason field evaluates against return_items[].reason_id.
// Whether matching is exact (leaf only) or prefix-based (parent categories like "fit")
// is a design decision for the candidate.
//
// Return: { match: boolean }
//
// Example rules to support:
//   - "customer.email CONTAINS @example.com"
//   - "billing.amount GT 500"
//   - "order_items.unit_price GT 100" (any item priced over $100)
//   - "order_items.is_final_sale EQ true" (any item is final sale)
//   - "shipments.carrier EQ fedex"
//   - "return_items.reason_id EQ too-large-collar" (any return item has this reason)

evaluateRouter.post('/', (req, res) => {
  // Implement: evaluate the conditions against the order
  res.status(501).json({ error: 'Not implemented' });
});
