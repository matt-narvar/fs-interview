import { Condition, ConditionGroup, ReturnCart } from '../types.js';

// Dot-walks an object. If it hits an array mid-path, maps the remaining path
// over each element and returns an array of resolved values.
function resolveField(cart: ReturnCart, fieldPath: string): unknown {
  if (fieldPath.startsWith('return_items.')) {
    const prop = fieldPath.slice('return_items.'.length) as keyof typeof cart.return_items[0];
    return cart.return_items.map((item) => item[prop]);
  }

  const parts = fieldPath.split('.');
  let current: unknown = cart.order_info;

  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return undefined;

    if (Array.isArray(current)) {
      const rest = parts.slice(i).join('.');
      return current.map((el) => resolveField({ ...cart, order_info: el } as ReturnCart, rest));
    }

    current = (current as Record<string, unknown>)[parts[i]];
  }

  return current;
}

function applyOperator(actual: unknown, operator: string, expected: unknown): boolean {
  // Array value = multi-leaf reason selection: IS means "is any of", IS_NOT means "is none of"
  if (Array.isArray(expected)) {
    if (operator === 'IS')     return expected.includes(actual as string);
    if (operator === 'IS_NOT') return !expected.includes(actual as string);
    return false;
  }

  switch (operator) {
    case 'IS':
      return actual == expected;
    case 'IS_NOT':
      return actual != expected;
    case 'CONTAINS':
      return typeof actual === 'string' && actual.includes(String(expected));
    case 'STARTS_WITH':
      return typeof actual === 'string' && actual.startsWith(String(expected));
    case 'ENDS_WITH':
      return typeof actual === 'string' && actual.endsWith(String(expected));
    case 'GT':
      return Number(actual) > Number(expected);
    case 'GTE':
      return Number(actual) >= Number(expected);
    case 'LT':
      return Number(actual) < Number(expected);
    case 'LTE':
      return Number(actual) <= Number(expected);
    default:
      return false;
  }
}

function evaluateCondition(cart: ReturnCart, condition: Condition): boolean {
  const resolved = resolveField(cart, condition.field);

  if (Array.isArray(resolved)) {
    const test = (v: unknown) => applyOperator(v, condition.operator, condition.value);
    return condition.quantifier === 'all'
      ? resolved.every(test)
      : resolved.some(test);
  }

  return applyOperator(resolved, condition.operator, condition.value);
}

function isGroup(node: Condition | ConditionGroup): node is ConditionGroup {
  return 'logic' in node;
}

export function evaluateGroup(cart: ReturnCart, group: ConditionGroup): boolean {
  const evaluate = (node: Condition | ConditionGroup): boolean =>
    isGroup(node) ? evaluateGroup(cart, node) : evaluateCondition(cart, node);

  return group.logic === 'AND'
    ? group.conditions.every(evaluate)
    : group.conditions.some(evaluate);
}
