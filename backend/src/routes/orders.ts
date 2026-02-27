import { Router } from 'express';
import { sampleOrders } from '../data/orders.js';

export const ordersRouter = Router();

ordersRouter.get('/', (_req, res) => {
  res.json(sampleOrders);
});
