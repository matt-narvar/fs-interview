import { Router } from 'express';

export const fieldsRouter = Router();

// TODO: GET / - Return available condition fields with their types and valid operators
//
// Each field maps to a path in the order payload (see /api/orders for structure).
// Each field has: value (path), label, type (string | number | boolean), and for enums: enumValues
//
// Operators vary by type:
//   - string: EQ, NOT_EQ, CONTAINS, STARTS_WITH, ENDS_WITH
//   - number: EQ, NOT_EQ, GT, GTE, LT, LTE
//   - boolean: EQ, NOT_EQ
//
// Fields to include (see README for full list):
//   - Customer Email (customer.email, string)
//   - Order Total (billing.amount, number)
//   - Item Price (order_items.unit_price, number — note: array field)
//   - Carrier (shipments.carrier, string — note: array field)
//   - Country (customer.address.country, string)
//   - Is Final Sale (order_items.is_final_sale, boolean — note: array field)
//   - Is Gift (order_items.is_gift, boolean — note: array field)
//   - Item Color (order_items.color, string — note: array field)
//   - Reason (special — values come from /api/reasons)

fieldsRouter.get('/', (req, res) => {
  // Implement: return fields and operators
  res.status(501).json({ error: 'Not implemented' });
});
