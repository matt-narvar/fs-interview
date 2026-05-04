import { ReasonNode } from '../types.js';

export const reasonTree: ReasonNode[] = [
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
      { id: 'too-small', label: 'Too small' },
      { id: 'too-short', label: 'Too short' },
    ],
  },
  {
    id: 'item-damaged',
    label: 'Item damaged',
    children: [
      { id: 'wrinkled', label: 'Wrinkled' },
      { id: 'ripped', label: 'Ripped' },
      { id: 'thread-loose', label: 'Thread loose' },
    ],
  },
];
