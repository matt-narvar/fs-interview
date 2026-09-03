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
// How a condition's field maps onto the cart payload is up to you. Some fields
// (e.g. Item Price) don't have a single value per cart — how you resolve those
// is a design decision.
//
// The Reason field (Part 2) evaluates against return_items[].reason_id.
// Whether matching is exact (leaf only) or prefix-based (parent categories like "fit")
// is a design decision for the candidate.
//
// Return: { match: boolean }
//
// Example rules to support:
//   - Customer Email contains "@example.com"
//   - Order Total > 500
//   - Item Price > 100 (your semantics)
//   - Is Final Sale is true (your semantics)
//   - Carrier is "fedex"
//   - Reason is "too-large-collar" (Part 2; your semantics)

evaluateRouter.post('/', (req, res) => {
  // Implement: evaluate the conditions against the return cart
  res.status(501).json({ error: 'Not implemented' });
});
