import { Router } from 'express';
import { reasonTree } from '../data/reasons.js';

export const reasonsRouter = Router();

reasonsRouter.get('/', (req, res) => {
  res.json(reasonTree);
});
