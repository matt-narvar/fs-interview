import { describe, it, expect } from 'vitest';
import { getLeafIds, getAllLeafIdsUnder, getIndeterminateIds } from '../utils/treeHelpers';
import type { ReasonNode } from '../types';

const tree: ReasonNode[] = [
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
        ],
      },
      { id: 'too-small', label: 'Too small' },
    ],
  },
  {
    id: 'item-damaged',
    label: 'Item damaged',
    children: [{ id: 'ripped', label: 'Ripped' }],
  },
];

describe('getLeafIds', () => {
  it('returns [id] for a leaf node', () => {
    expect(getLeafIds({ id: 'too-large-collar', label: 'Collar' })).toEqual(['too-large-collar']);
  });

  it('returns all descendant leaf IDs for a branch', () => {
    expect(getLeafIds(tree[0])).toEqual(['too-large-collar', 'too-large-sleeves', 'too-small']);
  });

  it('returns all leaf IDs from a deep branch', () => {
    expect(getLeafIds(tree[0].children![0])).toEqual(['too-large-collar', 'too-large-sleeves']);
  });
});

describe('getAllLeafIdsUnder', () => {
  it('finds leaf IDs under a parent id', () => {
    expect(getAllLeafIdsUnder(tree, 'too-large')).toEqual([
      'too-large-collar',
      'too-large-sleeves',
    ]);
  });

  it('returns the id itself when the node is a leaf', () => {
    expect(getAllLeafIdsUnder(tree, 'too-small')).toEqual(['too-small']);
  });

  it('returns empty array when id not found', () => {
    expect(getAllLeafIdsUnder(tree, 'nonexistent')).toEqual([]);
  });
});

describe('getIndeterminateIds', () => {
  it('returns empty set when nothing is checked', () => {
    expect(getIndeterminateIds(tree, new Set())).toEqual(new Set());
  });

  it('returns empty set when all leaves are checked (fully checked, not indeterminate)', () => {
    const allLeaves = new Set(['too-large-collar', 'too-large-sleeves', 'too-small', 'ripped']);
    expect(getIndeterminateIds(tree, allLeaves)).toEqual(new Set());
  });

  it('marks direct parent as indeterminate when one leaf is checked', () => {
    const checked = new Set(['too-large-collar']);
    const result = getIndeterminateIds(tree, checked);
    expect(result.has('too-large')).toBe(true);
  });

  it('marks grandparent as indeterminate when one leaf is checked', () => {
    const checked = new Set(['too-large-collar']);
    const result = getIndeterminateIds(tree, checked);
    expect(result.has('fit')).toBe(true);
  });

  it('does not mark sibling nodes as indeterminate', () => {
    const checked = new Set(['too-large-collar']);
    const result = getIndeterminateIds(tree, checked);
    expect(result.has('item-damaged')).toBe(false);
  });

  it('marks parent indeterminate when all children of one branch are checked but sibling branch unchecked', () => {
    const checked = new Set(['too-large-collar', 'too-large-sleeves']); // too-small unchecked
    const result = getIndeterminateIds(tree, checked);
    expect(result.has('fit')).toBe(true);
    expect(result.has('too-large')).toBe(false); // all of too-large's leaves are checked
  });
});
