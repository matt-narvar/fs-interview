import { Router } from 'express';
import { EvaluateRequest } from '../types.js';
import { evaluateGroup } from '../lib/evaluator.js';

export const evaluateRouter = Router();

evaluateRouter.post('/', (req, res) => {
  const { conditions, cart } = req.body as EvaluateRequest;

  if (!conditions || !cart) {
    res.status(400).json({ error: 'Missing required fields: conditions, cart' });
    return;
  }

  res.json({ match: evaluateGroup(cart, conditions) });
});
