import { Router } from 'express';

export const evaluateRouter = Router();

// TODO: POST / - Evaluate conditions against an order payload
//
// Request body shape:
//   {
//     conditions: ConditionGroup,
//     order: <order object from /api/orders>
//   }
//
// A ConditionGroup has:
//   { logic: "AND" | "OR", conditions: Array<Condition | ConditionGroup> }
//
// A Condition has:
//   { field: string, operator: string, value: string | number | boolean }
//
// Operators: EQ, NOT_EQ, GT, GTE, LT, LTE, CONTAINS, STARTS_WITH, ENDS_WITH
//
// The order payload is a nested object with arrays (order_items, shipments).
// How you resolve fields like "order_items.unit_price" against arrays is up to you.
//
// Return: { match: boolean }
//
// Example rules to support:
//   - "customer.email CONTAINS @example.com"
//   - "billing.amount GT 500"
//   - "order_items.unit_price GT 100" (any item priced over $100)
//   - "order_items.is_final_sale EQ true" (any item is final sale)
//   - "shipments.carrier EQ fedex"

evaluateRouter.post('/', (req, res) => {
  // Implement: evaluate the conditions against the order
  res.status(501).json({ error: 'Not implemented' });
});
