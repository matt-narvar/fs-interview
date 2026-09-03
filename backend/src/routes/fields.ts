import { Router } from 'express';

export const fieldsRouter = Router();

// TODO: GET / - Return available condition fields with their types and valid operators
//
// Each field has: value (identifier), label, type (string | number | boolean), and for enums: enumValues
// How a field identifier maps onto the return cart payload is up to you
// (see /api/return-carts for the structure).
//
// Operators vary by type:
//   - string: EQ, NOT_EQ, CONTAINS, STARTS_WITH, ENDS_WITH
//   - number: EQ, NOT_EQ, GT, GTE, LT, LTE
//   - boolean: EQ, NOT_EQ
//
// Fields to include (see README for full list):
//   - Customer Email (string)
//   - Order Total (number)
//   - Item Price (number)
//   - Carrier (string)
//   - Country (string)
//   - Is Final Sale (boolean)
//   - Is Gift (boolean)
//   - Item Color (string)
//   - Reason (special — Part 2; values come from /api/reasons)

fieldsRouter.get('/', (req, res) => {
  // Implement: return fields and operators
  res.status(501).json({ error: 'Not implemented' });
});
