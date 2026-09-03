import { ReturnCart } from '../types.js';
import { sampleOrders } from './orders.js';

export const sampleReturnCarts: ReturnCart[] = [
  {
    id: 'cart-1',
    description: 'High-value US order — returning sweatshirt for fit (too large, collar)',
    order_info: sampleOrders[0].order_info,
    return_items: [
      {
        item_id: 'item-1',
        reason_id: 'too-large-collar',
        quantity: 1,
      },
    ],
  },

  {
    id: 'cart-2',
    description: 'International gift order — returning sunglasses for damage (ripped)',
    order_info: sampleOrders[1].order_info,
    return_items: [
      {
        item_id: 'item-4',
        reason_id: 'ripped',
        quantity: 1,
      },
    ],
  },

  {
    id: 'cart-3',
    description: 'Final-sale order — returning crossbody bag for fit (too small)',
    order_info: sampleOrders[2].order_info,
    return_items: [
      {
        item_id: 'item-6',
        reason_id: 'too-small',
        quantity: 1,
      },
    ],
  },

  {
    id: 'cart-4',
    description: 'Bulk order — returning beanies for damage (thread loose)',
    order_info: sampleOrders[3].order_info,
    return_items: [
      {
        item_id: 'item-11',
        reason_id: 'thread-loose',
        quantity: 5,
      },
    ],
  },

  {
    id: 'cart-5',
    description: 'Mixed order — returning wool scarf for fit (too short, waist)',
    order_info: sampleOrders[2].order_info,
    return_items: [
      {
        item_id: 'item-8',
        reason_id: 'too-short-waist',
        quantity: 1,
      },
    ],
  },
];
