import { describe, it, expect } from 'vitest';
import { buildChipSummary } from '../utils/reasonChips';
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
    children: [
      { id: 'ripped', label: 'Ripped' },
      { id: 'thread-loose', label: 'Thread loose' },
    ],
  },
];

describe('buildChipSummary', () => {
  it('returns empty array for empty selection', () => {
    expect(buildChipSummary(tree, [])).toEqual([]);
  });

  it('shows "X > All" when all leaves under a root are selected', () => {
    const allFitLeaves = ['too-large-collar', 'too-large-sleeves', 'too-small'];
    const chips = buildChipSummary(tree, allFitLeaves);
    expect(chips).toEqual([{ label: 'Fit > All' }]);
  });

  it('shows single leaf path when one leaf selected', () => {
    const chips = buildChipSummary(tree, ['too-large-collar']);
    expect(chips).toEqual([{ label: 'Fit > Too large > Collar' }]);
  });

  it('shows "All" when all sibling leaves under a parent are selected', () => {
    // collar + sleeves = all children of too-large → "Too large > All"
    const chips = buildChipSummary(tree, ['too-large-collar', 'too-large-sleeves']);
    expect(chips).toEqual([{ label: 'Fit > Too large > All' }]);
  });

  it('collapses partial sibling leaves into names when only some selected', () => {
    // only collar, not sleeves → list by name
    const chips = buildChipSummary(tree, ['too-large-collar']);
    expect(chips).toEqual([{ label: 'Fit > Too large > Collar' }]);
  });

  it('shows "All" for a fully-selected branch alongside a partial sibling', () => {
    // too-large all selected, too-small not selected
    const chips = buildChipSummary(tree, ['too-large-collar', 'too-large-sleeves']);
    expect(chips[0].label).toContain('Too large');
  });

  it('produces two chips for selections across different root nodes', () => {
    const chips = buildChipSummary(tree, ['too-large-collar', 'ripped']);
    expect(chips).toHaveLength(2);
    const labels = chips.map((c) => c.label);
    expect(labels.some((l) => l.includes('Fit'))).toBe(true);
    expect(labels.some((l) => l.includes('Item damaged'))).toBe(true);
  });

  it('shows "All" for fully selected sub-tree', () => {
    const allLeaves = ['too-large-collar', 'too-large-sleeves', 'too-small', 'ripped', 'thread-loose'];
    const chips = buildChipSummary(tree, allLeaves);
    expect(chips).toEqual([{ label: 'Fit > All' }, { label: 'Item damaged > All' }]);
  });
});
