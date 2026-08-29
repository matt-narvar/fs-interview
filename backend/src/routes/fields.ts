import { Router } from 'express';
import { ConditionFieldsResponse } from '../types.js';

export const fieldsRouter = Router();

const STRING_OPS = [
  { value: 'EQ', label: 'is' },
  { value: 'NOT_EQ', label: 'is not' },
  { value: 'CONTAINS', label: 'contains' },
  { value: 'STARTS_WITH', label: 'starts with' },
  { value: 'ENDS_WITH', label: 'ends with' },
];

const NUMBER_OPS = [
  { value: 'EQ', label: 'is' },
  { value: 'NOT_EQ', label: 'is not' },
  { value: 'GT', label: '>' },
  { value: 'GTE', label: '>=' },
  { value: 'LT', label: '<' },
  { value: 'LTE', label: '<=' },
];

const BOOLEAN_OPS = [
  { value: 'EQ', label: 'is' },
  { value: 'NOT_EQ', label: 'is not' },
];

const response: ConditionFieldsResponse = {
  fields: [
    { value: 'customer.email', label: 'Customer Email', type: 'string' },
    { value: 'billing.amount', label: 'Order Total', type: 'number' },
    { value: 'order_items.unit_price', label: 'Item Price', type: 'number' },
    { value: 'shipments.carrier', label: 'Carrier', type: 'string' },
    { value: 'customer.address.country', label: 'Country', type: 'string' },
    { value: 'order_items.is_final_sale', label: 'Is Final Sale', type: 'boolean' },
    { value: 'order_items.is_gift', label: 'Is Gift', type: 'boolean' },
    { value: 'order_items.color', label: 'Item Color', type: 'string' },
    { value: 'return_items.reason_id', label: 'Reason', type: 'reason' },
  ],
  operators: {
    string: STRING_OPS,
    number: NUMBER_OPS,
    boolean: BOOLEAN_OPS,
    reason: [{ value: 'EQ', label: 'is' }],
  },
};

fieldsRouter.get('/', (_req, res) => {
  try {
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load condition fields' });
  }
});
