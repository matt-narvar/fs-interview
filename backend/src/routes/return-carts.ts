import { Router } from 'express';
import { sampleReturnCarts } from '../data/return-carts.js';

export const returnCartsRouter = Router();

returnCartsRouter.get('/', (_req, res) => {
  res.json(sampleReturnCarts);
});
