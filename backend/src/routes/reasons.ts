import { Router } from 'express';
import { ReasonNode } from '../types.js';

export const reasonsRouter = Router();

const reasons: ReasonNode[] = [
  {
    id: 'fit',
    label: 'Fit',
    children: [
      {
        id: 'too-large',
        label: 'Too large',
        children: [
          { id: 'too-large-collar', label: 'Collar' },
          { id: 'too-large-sleeves', label: 'Sleeves' },
          { id: 'too-large-waist', label: 'Waist' },
        ],
      },
      {
        id: 'too-small',
        label: 'Too small',
        children: [
          { id: 'too-small-collar', label: 'Collar' },
          { id: 'too-small-sleeves', label: 'Sleeves' },
          { id: 'too-small-waist', label: 'Waist' },
        ],
      },
      {
        id: 'too-short',
        label: 'Too short',
        children: [
          { id: 'too-short-collar', label: 'Collar' },
          { id: 'too-short-sleeves', label: 'Sleeves' },
          { id: 'too-short-waist', label: 'Waist' },
        ],
      },
    ],
  },
  {
    id: 'item-damaged',
    label: 'Item damaged',
    children: [
      {
        id: 'wrinkled',
        label: 'Wrinkled',
        children: [
          { id: 'wrinkled-severely', label: 'Severely' },
          { id: 'wrinkled-easily-noticeable', label: 'Easily noticeable' },
          { id: 'wrinkled-somewhat-noticeable', label: 'Somewhat noticeable' },
        ],
      },
      {
        id: 'ripped',
        label: 'Ripped',
        children: [
          { id: 'ripped-severely', label: 'Severely' },
          { id: 'ripped-easily-noticeable', label: 'Easily noticeable' },
          { id: 'ripped-somewhat-noticeable', label: 'Somewhat noticeable' },
        ],
      },
      {
        id: 'thread-loose',
        label: 'Thread loose',
        children: [
          { id: 'thread-loose-severely', label: 'Severely' },
          { id: 'thread-loose-easily-noticeable', label: 'Easily noticeable' },
          { id: 'thread-loose-somewhat-noticeable', label: 'Somewhat noticeable' },
        ],
      },
    ],
  },
];

reasonsRouter.get('/', (_req, res) => {
  try {
    res.json(reasons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load reason tree' });
  }
});
