import { Router } from 'express';
import { Condition, ConditionGroup, ReturnCart } from '../types.js';

export const evaluateRouter = Router();

function isGroup(c: Condition | ConditionGroup): c is ConditionGroup {
  return 'logic' in c;
}

function resolveField(cart: ReturnCart, field: string): unknown[] {
  const order = cart.order_info;

  if (field === 'return_items.reason_id') {
    return cart.return_items.map(ri => ri.reason_id);
  }

  if (field.startsWith('order_items.')) {
    const prop = field.slice('order_items.'.length) as keyof (typeof order.order_items)[0];
    return order.order_items.map(item => item[prop]);
  }

  if (field.startsWith('shipments.')) {
    const prop = field.slice('shipments.'.length) as keyof (typeof order.shipments)[0];
    return order.shipments.map(s => s[prop]);
  }

  // Scalar nested path: customer.email, billing.amount, customer.address.country
  const parts = field.split('.');
  let current: unknown = order;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return [];
    current = (current as Record<string, unknown>)[part];
  }
  return [current];
}

function applyOperator(cartValue: unknown, operator: string, condValue: unknown): boolean {
  switch (operator) {
    case 'EQ':
      if (typeof cartValue === 'boolean') return cartValue === (condValue === true || condValue === 'true');
      if (typeof cartValue === 'number') return cartValue === Number(condValue);
      return String(cartValue).toLowerCase() === String(condValue).toLowerCase();
    case 'NOT_EQ':
      if (typeof cartValue === 'boolean') return cartValue !== (condValue === true || condValue === 'true');
      if (typeof cartValue === 'number') return cartValue !== Number(condValue);
      return String(cartValue).toLowerCase() !== String(condValue).toLowerCase();
    case 'GT': return Number(cartValue) > Number(condValue);
    case 'GTE': return Number(cartValue) >= Number(condValue);
    case 'LT': return Number(cartValue) < Number(condValue);
    case 'LTE': return Number(cartValue) <= Number(condValue);
    case 'CONTAINS': return String(cartValue).toLowerCase().includes(String(condValue).toLowerCase());
    case 'STARTS_WITH': return String(cartValue).toLowerCase().startsWith(String(condValue).toLowerCase());
    case 'ENDS_WITH': return String(cartValue).toLowerCase().endsWith(String(condValue).toLowerCase());
    default: return false;
  }
}

function evaluateCondition(condition: Condition, cart: ReturnCart): boolean {
  const values = resolveField(cart, condition.field);
  // Any-match: true if at least one cart value satisfies the condition
  for (const v of values) {
    if (applyOperator(v, condition.operator, condition.value)) return true;
  }
  return false;
}

function evaluateGroup(group: ConditionGroup, cart: ReturnCart): boolean {
  // Loop over every item in the conditions list (which may itself be a nested group)
  for (const item of group.conditions) {
    const result = isGroup(item) ? evaluateGroup(item, cart) : evaluateCondition(item, cart);

    // Short-circuit: AND fails on first false, OR passes on first true
    if (group.logic === 'AND' && !result) return false;
    if (group.logic === 'OR' && result) return true;
  }

  // AND with no early exit → all passed; OR with no early exit → none passed
  return group.logic === 'AND';
}

evaluateRouter.post('/', (req, res) => {
  try {
    const { conditions, cart } = req.body as { conditions: ConditionGroup; cart: ReturnCart };

    if (!conditions || !cart) {
      res.status(400).json({ error: 'Request must include both "conditions" and "cart"' });
      return;
    }

    if (!conditions.logic || !Array.isArray(conditions.conditions)) {
      res.status(400).json({ error: 'conditions must have a "logic" field ("AND" or "OR") and a "conditions" array' });
      return;
    }

    res.json({ match: evaluateGroup(conditions, cart) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: `Failed to evaluate conditions: ${message}` });
  }
});
