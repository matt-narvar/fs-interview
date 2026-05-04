import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { sampleReturnCarts } from '../data/return-carts.js';

const [cart1, cart2, cart3] = sampleReturnCarts;

describe('GET /api/orders', () => {
  it('returns 200 with 4 orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('order_info.order_number');
  });
});

describe('GET /api/return-carts', () => {
  it('returns 200 with 4 carts', async () => {
    const res = await request(app).get('/api/return-carts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });

  it('each cart has return_items with a reason_id', async () => {
    const res = await request(app).get('/api/return-carts');
    for (const cart of res.body) {
      expect(cart.return_items.length).toBeGreaterThan(0);
      expect(cart.return_items[0]).toHaveProperty('reason_id');
    }
  });
});

describe('GET /api/reasons', () => {
  it('returns 200 with a non-empty array', async () => {
    const res = await request(app).get('/api/reasons');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('fit node has too-large child with 3 leaf children', async () => {
    const res = await request(app).get('/api/reasons');
    const fit = res.body.find((n: { id: string }) => n.id === 'fit');
    expect(fit).toBeDefined();
    const tooLarge = fit.children.find((n: { id: string }) => n.id === 'too-large');
    expect(tooLarge).toBeDefined();
    expect(tooLarge.children).toHaveLength(3);
  });

  it('all sample cart reason IDs exist as leaf nodes', async () => {
    const res = await request(app).get('/api/reasons');

    const leafIds = new Set<string>();
    function collectLeaves(nodes: Array<{ id: string; children?: unknown[] }>) {
      for (const node of nodes) {
        if (!node.children || node.children.length === 0) {
          leafIds.add(node.id);
        } else {
          collectLeaves(node.children as Array<{ id: string; children?: unknown[] }>);
        }
      }
    }
    collectLeaves(res.body);

    expect(leafIds.has('too-large-collar')).toBe(true);
    expect(leafIds.has('ripped')).toBe(true);
    expect(leafIds.has('too-small')).toBe(true);
    expect(leafIds.has('thread-loose')).toBe(true);
  });
});

describe('GET /api/condition-fields', () => {
  it('returns 200 with 9 fields', async () => {
    const res = await request(app).get('/api/condition-fields');
    expect(res.status).toBe(200);
    expect(res.body.fields).toHaveLength(9);
  });

  it('operators has string, number, boolean keys', async () => {
    const res = await request(app).get('/api/condition-fields');
    expect(res.body.operators).toHaveProperty('string');
    expect(res.body.operators).toHaveProperty('number');
    expect(res.body.operators).toHaveProperty('boolean');
  });

  it('return_items.reason_id field is present', async () => {
    const res = await request(app).get('/api/condition-fields');
    const reasonField = res.body.fields.find((f: { value: string }) => f.value === 'return_items.reason_id');
    expect(reasonField).toBeDefined();
    expect(reasonField.label).toBe('Reason');
  });
});

describe('POST /api/conditions/evaluate', () => {
  function makeBody(cart: typeof cart1, logic: 'AND' | 'OR', ...conditions: object[]) {
    return { conditions: { logic, conditions }, cart };
  }

  it('returns 400 when conditions is missing', async () => {
    const res = await request(app).post('/api/conditions/evaluate').send({ cart: cart1 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when cart is missing', async () => {
    const res = await request(app).post('/api/conditions/evaluate').send({
      conditions: { logic: 'AND', conditions: [] },
    });
    expect(res.status).toBe(400);
  });

  it('billing.amount GT 500 → true for cart-1 ($554.19)', async () => {
    const res = await request(app).post('/api/conditions/evaluate').send(
      makeBody(cart1, 'AND', { field: 'billing.amount', operator: 'GT', value: 500 })
    );
    expect(res.status).toBe(200);
    expect(res.body.match).toBe(true);
  });

  it('billing.amount GT 500 → false for cart-2 ($25.99)', async () => {
    const res = await request(app).post('/api/conditions/evaluate').send(
      makeBody(cart2, 'AND', { field: 'billing.amount', operator: 'GT', value: 500 })
    );
    expect(res.body.match).toBe(false);
  });

  it('order_items.is_final_sale IS true → true for cart-3', async () => {
    const res = await request(app).post('/api/conditions/evaluate').send(
      makeBody(cart3, 'AND', { field: 'order_items.is_final_sale', operator: 'IS', value: true })
    );
    expect(res.body.match).toBe(true);
  });

  it('return_items.reason_id IS ripped → true for cart-2', async () => {
    const res = await request(app).post('/api/conditions/evaluate').send(
      makeBody(cart2, 'AND', { field: 'return_items.reason_id', operator: 'IS', value: 'ripped' })
    );
    expect(res.body.match).toBe(true);
  });

  it('return_items.reason_id IS ripped → false for cart-1', async () => {
    const res = await request(app).post('/api/conditions/evaluate').send(
      makeBody(cart1, 'AND', { field: 'return_items.reason_id', operator: 'IS', value: 'ripped' })
    );
    expect(res.body.match).toBe(false);
  });

  it('AND group: country IS US AND is_final_sale IS true → true for cart-3', async () => {
    const res = await request(app).post('/api/conditions/evaluate').send(
      makeBody(cart3, 'AND',
        { field: 'customer.address.country', operator: 'IS', value: 'US' },
        { field: 'order_items.is_final_sale', operator: 'IS', value: true },
      )
    );
    expect(res.body.match).toBe(true);
  });

  it('OR group: country IS US OR is_final_sale IS true → true for cart-1 (US but no final sale)', async () => {
    const res = await request(app).post('/api/conditions/evaluate').send(
      makeBody(cart1, 'OR',
        { field: 'customer.address.country', operator: 'IS', value: 'US' },
        { field: 'order_items.is_final_sale', operator: 'IS', value: true },
      )
    );
    expect(res.body.match).toBe(true);
  });
});
