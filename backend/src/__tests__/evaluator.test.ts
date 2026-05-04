import { describe, it, expect } from 'vitest';
import { evaluateGroup } from '../lib/evaluator.js';
import { sampleReturnCarts } from '../data/return-carts.js';
import { ConditionGroup } from '../types.js';

// cart-1: alice.chen@gmail.com, billing $554.19, FedEx, US, items at $150.61/$220.99/$10.99, reason: too-large-collar
// cart-2: marc.dupont@outlook.ca, billing $25.99, UPS, CA, is_gift: true, reason: ripped
// cart-3: j.smith@example.com, billing $288.30, USPS, US, is_final_sale: true, reason: too-small
// cart-4: orders@example.com, billing $2133.70, FedEx+UPS, US, reason: thread-loose

const [cart1, cart2, cart3, cart4] = sampleReturnCarts;

function group(logic: 'AND' | 'OR', ...conditions: ConditionGroup['conditions']): ConditionGroup {
  return { logic, conditions };
}

function cond(field: string, operator: string, value: string | number | boolean | string[]) {
  return { field, operator, value };
}

describe('string operators', () => {
  it('IS — exact match', () => {
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'IS', 'alice.chen@gmail.com')))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'IS', 'wrong@email.com')))).toBe(false);
  });

  it('IS_NOT', () => {
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'IS_NOT', 'wrong@email.com')))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'IS_NOT', 'alice.chen@gmail.com')))).toBe(false);
  });

  it('CONTAINS', () => {
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'CONTAINS', '@gmail.com')))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'CONTAINS', '@outlook.com')))).toBe(false);
  });

  it('STARTS_WITH', () => {
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'STARTS_WITH', 'alice')))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'STARTS_WITH', 'marc')))).toBe(false);
  });

  it('ENDS_WITH', () => {
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'ENDS_WITH', '.com')))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('customer.email', 'ENDS_WITH', '.org')))).toBe(false);
  });
});

describe('number operators', () => {
  it('IS / IS_NOT', () => {
    expect(evaluateGroup(cart1, group('AND', cond('billing.amount', 'IS', 554.19)))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('billing.amount', 'IS_NOT', 554.19)))).toBe(false);
  });

  it('GT', () => {
    expect(evaluateGroup(cart1, group('AND', cond('billing.amount', 'GT', 500)))).toBe(true);
    expect(evaluateGroup(cart2, group('AND', cond('billing.amount', 'GT', 500)))).toBe(false);
  });

  it('GTE — boundary', () => {
    expect(evaluateGroup(cart1, group('AND', cond('billing.amount', 'GTE', 554.19)))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('billing.amount', 'GTE', 555)))).toBe(false);
  });

  it('LT', () => {
    expect(evaluateGroup(cart2, group('AND', cond('billing.amount', 'LT', 30)))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('billing.amount', 'LT', 30)))).toBe(false);
  });

  it('LTE — boundary', () => {
    expect(evaluateGroup(cart2, group('AND', cond('billing.amount', 'LTE', 25.99)))).toBe(true);
    expect(evaluateGroup(cart2, group('AND', cond('billing.amount', 'LTE', 25)))).toBe(false);
  });
});

describe('boolean operators', () => {
  it('IS true — array field (is_final_sale)', () => {
    expect(evaluateGroup(cart3, group('AND', cond('order_items.is_final_sale', 'IS', true)))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('order_items.is_final_sale', 'IS', true)))).toBe(false);
  });

  it('IS false', () => {
    expect(evaluateGroup(cart1, group('AND', cond('order_items.is_final_sale', 'IS', false)))).toBe(true);
  });

  it('IS_NOT true', () => {
    expect(evaluateGroup(cart1, group('AND', cond('order_items.is_gift', 'IS_NOT', true)))).toBe(true);
    expect(evaluateGroup(cart2, group('AND', cond('order_items.is_gift', 'IS_NOT', true)))).toBe(false);
  });
});

describe('array field — ANY semantics (default)', () => {
  // cart-1 items: $150.61, $220.99, $10.99
  it('GT 100 → true when any item qualifies', () => {
    expect(evaluateGroup(cart1, group('AND', cond('order_items.unit_price', 'GT', 100)))).toBe(true);
  });

  it('GT 300 → false when no item qualifies', () => {
    expect(evaluateGroup(cart1, group('AND', cond('order_items.unit_price', 'GT', 300)))).toBe(false);
  });

  it('LT 20 → true ($10.99 qualifies)', () => {
    expect(evaluateGroup(cart1, group('AND', cond('order_items.unit_price', 'LT', 20)))).toBe(true);
  });

  it('carrier IS fedex — matches cart-1 (FedEx shipment)', () => {
    expect(evaluateGroup(cart1, group('AND', cond('shipments.carrier', 'IS', 'fedex')))).toBe(true);
  });

  it('carrier IS fedex — false for cart-2 (UPS only)', () => {
    expect(evaluateGroup(cart2, group('AND', cond('shipments.carrier', 'IS', 'fedex')))).toBe(false);
  });

  it('color IS Green — matches cart-1 (has Green sweatshirt)', () => {
    expect(evaluateGroup(cart1, group('AND', cond('order_items.color', 'IS', 'Green')))).toBe(true);
  });
});

describe('array field — ALL semantics (quantifier: all)', () => {
  // cart-1 items: $150.61, $220.99, $10.99
  it('GT 100 with quantifier:all → false (not all items > $100)', () => {
    const c = { ...cond('order_items.unit_price', 'GT', 100), quantifier: 'all' as const };
    expect(evaluateGroup(cart1, group('AND', c))).toBe(false);
  });

  it('GT 5 with quantifier:all → true (all items > $5)', () => {
    const c = { ...cond('order_items.unit_price', 'GT', 5), quantifier: 'all' as const };
    expect(evaluateGroup(cart1, group('AND', c))).toBe(true);
  });

  // cart-3: all items are final sale (Leather Crossbody + Canvas Tote both is_final_sale:true; Merino Scarf is false)
  it('is_final_sale IS true with quantifier:all → false for cart-3 (scarf is not final sale)', () => {
    const c = { ...cond('order_items.is_final_sale', 'IS', true), quantifier: 'all' as const };
    expect(evaluateGroup(cart3, group('AND', c))).toBe(false);
  });

  // cart-4: all shipments are either fedex or ups — carrier IS fedex with all → false (has UPS)
  it('carrier IS fedex with quantifier:all → false for cart-4 (has both FedEx and UPS)', () => {
    const c = { ...cond('shipments.carrier', 'IS', 'fedex'), quantifier: 'all' as const };
    expect(evaluateGroup(cart4, group('AND', c))).toBe(false);
  });

  // cart-1 has only one shipment (FedEx) → all shipments are fedex
  it('carrier IS fedex with quantifier:all → true for cart-1 (only FedEx shipment)', () => {
    const c = { ...cond('shipments.carrier', 'IS', 'fedex'), quantifier: 'all' as const };
    expect(evaluateGroup(cart1, group('AND', c))).toBe(true);
  });
});

describe('reason field — single leaf match', () => {
  it('IS matching leaf → true', () => {
    expect(evaluateGroup(cart1, group('AND', cond('return_items.reason_id', 'IS', 'too-large-collar')))).toBe(true);
    expect(evaluateGroup(cart2, group('AND', cond('return_items.reason_id', 'IS', 'ripped')))).toBe(true);
    expect(evaluateGroup(cart3, group('AND', cond('return_items.reason_id', 'IS', 'too-small')))).toBe(true);
    expect(evaluateGroup(cart4, group('AND', cond('return_items.reason_id', 'IS', 'thread-loose')))).toBe(true);
  });

  it('IS wrong leaf → false', () => {
    expect(evaluateGroup(cart1, group('AND', cond('return_items.reason_id', 'IS', 'ripped')))).toBe(false);
  });

  it('IS_NOT', () => {
    expect(evaluateGroup(cart2, group('AND', cond('return_items.reason_id', 'IS_NOT', 'too-large-collar')))).toBe(true);
    expect(evaluateGroup(cart1, group('AND', cond('return_items.reason_id', 'IS_NOT', 'too-large-collar')))).toBe(false);
  });
});

describe('reason field — multi-leaf array value (UI expands subtree to leaf IDs)', () => {
  // Simulates: user checks "Fit" → frontend sends all Fit leaf IDs
  const fitLeaves = ['too-large-collar', 'too-large-sleeves', 'too-large-waist', 'too-small', 'too-short'];
  const damagedLeaves = ['wrinkled', 'ripped', 'thread-loose'];

  it('IS array — cart-1 (too-large-collar) matches fitLeaves', () => {
    expect(evaluateGroup(cart1, group('AND', cond('return_items.reason_id', 'IS', fitLeaves)))).toBe(true);
  });

  it('IS array — cart-2 (ripped) matches damagedLeaves', () => {
    expect(evaluateGroup(cart2, group('AND', cond('return_items.reason_id', 'IS', damagedLeaves)))).toBe(true);
  });

  it('IS array — cart-1 (too-large-collar) does NOT match damagedLeaves', () => {
    expect(evaluateGroup(cart1, group('AND', cond('return_items.reason_id', 'IS', damagedLeaves)))).toBe(false);
  });

  it('IS_NOT array — cart-1 is NOT in damagedLeaves → true', () => {
    expect(evaluateGroup(cart1, group('AND', cond('return_items.reason_id', 'IS_NOT', damagedLeaves)))).toBe(true);
  });

  it('IS_NOT array — cart-2 (ripped) IS in damagedLeaves → false', () => {
    expect(evaluateGroup(cart2, group('AND', cond('return_items.reason_id', 'IS_NOT', damagedLeaves)))).toBe(false);
  });

  it('partial subtree — only Too Large leaves, cart-1 (too-large-collar) matches', () => {
    const tooLargeLeaves = ['too-large-collar', 'too-large-sleeves', 'too-large-waist'];
    expect(evaluateGroup(cart1, group('AND', cond('return_items.reason_id', 'IS', tooLargeLeaves)))).toBe(true);
    expect(evaluateGroup(cart3, group('AND', cond('return_items.reason_id', 'IS', tooLargeLeaves)))).toBe(false); // too-small not in list
  });
});

describe('nested AND/OR groups', () => {
  it('AND — both conditions must pass', () => {
    const g = group('AND',
      cond('customer.address.country', 'IS', 'US'),
      cond('order_items.is_final_sale', 'IS', true),
    );
    expect(evaluateGroup(cart3, g)).toBe(true);  // US + final sale
    expect(evaluateGroup(cart1, g)).toBe(false); // US but no final sale
  });

  it('OR — at least one must pass', () => {
    const g = group('OR',
      cond('customer.address.country', 'IS', 'CA'),
      cond('billing.amount', 'GT', 500),
    );
    expect(evaluateGroup(cart1, g)).toBe(true);  // billing > 500
    expect(evaluateGroup(cart2, g)).toBe(true);  // country CA
    expect(evaluateGroup(cart3, g)).toBe(false); // US + $288 — neither
  });

  it('OR — all conditions fail', () => {
    const g = group('OR',
      cond('customer.address.country', 'IS', 'MX'),
      cond('billing.amount', 'GT', 9000),
      cond('shipments.carrier', 'IS', 'dhl'),
    );
    expect(evaluateGroup(cart1, g)).toBe(false);
    expect(evaluateGroup(cart2, g)).toBe(false);
  });

  it('AND — 3 conditions, all must pass', () => {
    const g = group('AND',
      cond('customer.address.country', 'IS', 'US'),
      cond('billing.amount', 'GT', 500),
      cond('shipments.carrier', 'IS', 'fedex'),
    );
    expect(evaluateGroup(cart1, g)).toBe(true);  // US + $554 + FedEx
    expect(evaluateGroup(cart3, g)).toBe(false); // US + $288 + USPS — carrier fails
    expect(evaluateGroup(cart4, g)).toBe(true);  // US + $2133 + has FedEx
  });

  it('AND — 3 conditions, one fails → false', () => {
    const g = group('AND',
      cond('customer.address.country', 'IS', 'US'),
      cond('billing.amount', 'GT', 500),
      cond('order_items.is_gift', 'IS', true),
    );
    expect(evaluateGroup(cart1, g)).toBe(false); // US + high billing but not gift
  });

  it('mixed nesting: (email CONTAINS @gmail) AND (billing > 500 OR billing < 30)', () => {
    const g = group('AND',
      cond('customer.email', 'CONTAINS', '@gmail.com'),
      group('OR',
        cond('billing.amount', 'GT', 500),
        cond('billing.amount', 'LT', 30),
      ),
    );
    expect(evaluateGroup(cart1, g)).toBe(true);  // gmail + billing $554 > 500
    expect(evaluateGroup(cart2, g)).toBe(false); // not gmail
    expect(evaluateGroup(cart3, g)).toBe(false); // not gmail
  });

  it('3-level deep nesting: AND(OR(AND(...)))', () => {
    // ((country IS US AND billing > 200) OR is_gift IS true) AND carrier IS_NOT dhl
    const g = group('AND',
      group('OR',
        group('AND',
          cond('customer.address.country', 'IS', 'US'),
          cond('billing.amount', 'GT', 200),
        ),
        cond('order_items.is_gift', 'IS', true),
      ),
      cond('shipments.carrier', 'IS_NOT', 'dhl'),
    );
    expect(evaluateGroup(cart1, g)).toBe(true);  // US + $554 > 200, carrier fedex ≠ dhl
    expect(evaluateGroup(cart2, g)).toBe(true);  // is_gift true, carrier ups ≠ dhl
    expect(evaluateGroup(cart3, g)).toBe(true);  // US + $288 > 200, carrier usps ≠ dhl
  });
});

describe('reason combined with other conditions', () => {
  const fitLeaves = ['too-large-collar', 'too-large-sleeves', 'too-large-waist', 'too-small', 'too-short'];
  const damagedLeaves = ['wrinkled', 'ripped', 'thread-loose'];

  it('reason IS fitLeaves AND country IS US → true for cart-1, false for cart-2 (CA + damaged)', () => {
    const g = group('AND',
      cond('return_items.reason_id', 'IS', fitLeaves),
      cond('customer.address.country', 'IS', 'US'),
    );
    expect(evaluateGroup(cart1, g)).toBe(true);  // too-large-collar ∈ fitLeaves, US
    expect(evaluateGroup(cart2, g)).toBe(false); // ripped ∉ fitLeaves
    expect(evaluateGroup(cart3, g)).toBe(true);  // too-small ∈ fitLeaves, US
  });

  it('reason IS damagedLeaves AND billing > 2000 → true only for cart-4', () => {
    const g = group('AND',
      cond('return_items.reason_id', 'IS', damagedLeaves),
      cond('billing.amount', 'GT', 2000),
    );
    expect(evaluateGroup(cart1, g)).toBe(false); // fit reason, not damaged
    expect(evaluateGroup(cart2, g)).toBe(false); // damaged but $25 < 2000
    expect(evaluateGroup(cart4, g)).toBe(true);  // thread-loose ∈ damagedLeaves, $2133 > 2000
  });

  it('reason IS_NOT damagedLeaves OR is_gift IS true → true for cart-1, cart-2, cart-3', () => {
    const g = group('OR',
      cond('return_items.reason_id', 'IS_NOT', damagedLeaves),
      cond('order_items.is_gift', 'IS', true),
    );
    expect(evaluateGroup(cart1, g)).toBe(true);  // too-large-collar ∉ damagedLeaves
    expect(evaluateGroup(cart2, g)).toBe(true);  // ripped ∈ damagedLeaves BUT is_gift true
    expect(evaluateGroup(cart3, g)).toBe(true);  // too-small ∉ damagedLeaves
    expect(evaluateGroup(cart4, g)).toBe(false); // thread-loose ∈ damagedLeaves, not gift
  });
});

describe('all 4 carts — comprehensive rule', () => {
  it('segments all carts correctly by a multi-condition rule', () => {
    // High-value domestic non-gift returns: billing > 200 AND country IS US AND is_gift IS false
    const g = group('AND',
      cond('billing.amount', 'GT', 200),
      cond('customer.address.country', 'IS', 'US'),
      cond('order_items.is_gift', 'IS', false),
    );
    expect(evaluateGroup(cart1, g)).toBe(true);  // $554, US, not gift
    expect(evaluateGroup(cart2, g)).toBe(false); // $25, CA, gift
    expect(evaluateGroup(cart3, g)).toBe(true);  // $288, US, not gift
    expect(evaluateGroup(cart4, g)).toBe(true);  // $2133, US, not gift
  });

  it('@example.com bulk orders: email ENDS_WITH @example.com AND billing > 1000', () => {
    const g = group('AND',
      cond('customer.email', 'ENDS_WITH', '@example.com'),
      cond('billing.amount', 'GT', 1000),
    );
    expect(evaluateGroup(cart1, g)).toBe(false); // gmail
    expect(evaluateGroup(cart2, g)).toBe(false); // outlook.ca
    expect(evaluateGroup(cart3, g)).toBe(false); // example.com but $288
    expect(evaluateGroup(cart4, g)).toBe(true);  // orders@example.com + $2133
  });
});
