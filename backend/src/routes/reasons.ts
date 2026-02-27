import { Router } from 'express';

export const reasonsRouter = Router();

// TODO: GET / - Return a hierarchical reason tree
// The tree should be at least 3 levels deep with multiple branches.
// See screenshots/nested-reasons-all.png for the expected data shape.
//
// Example structure:
//   Fit
//     Too large
//       Collar, Sleeves, Waist
//     Too small
//       Collar, Sleeves, Waist
//   Item damaged
//     Wrinkled, Ripped, Thread lose
//       Each with severity sub-reasons

reasonsRouter.get('/', (req, res) => {
  // Implement: return the reason tree
  res.status(501).json({ error: 'Not implemented' });
});
