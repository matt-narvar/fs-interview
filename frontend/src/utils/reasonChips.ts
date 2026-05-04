import type { ReasonNode } from '../types';
import { getLeafIds } from './treeHelpers';

export interface ChipLabel {
  label: string;
}

export function buildChipSummary(nodes: ReasonNode[], selectedLeafIds: string[]): ChipLabel[] {
  const selectedSet = new Set(selectedLeafIds);
  const chips: ChipLabel[] = [];
  collectChips(nodes, selectedSet, [], chips);
  return chips;
}

function collectChips(
  nodes: ReasonNode[],
  selected: Set<string>,
  path: string[],
  chips: ChipLabel[],
): void {
  for (const node of nodes) {
    const leaves = getLeafIds(node);
    const selectedLeaves = leaves.filter((id) => selected.has(id));

    if (selectedLeaves.length === 0) continue;

    const nodePath = [...path, node.label];

    if (selectedLeaves.length === leaves.length) {
      chips.push({ label: nodePath.join(' > ') + ' > All' });
      continue;
    }

    if (!node.children || node.children.length === 0) {
      chips.push({ label: nodePath.join(' > ') });
      continue;
    }

    // Check if all selected leaves are direct leaf children (no deeper nesting needed)
    const directLeafChildren = node.children.filter(
      (c) => !c.children || c.children.length === 0,
    );
    const selectedDirectLeaves = directLeafChildren.filter((c) => selected.has(c.id));
    const nonLeafChildren = node.children.filter((c) => c.children && c.children.length > 0);

    if (nonLeafChildren.length === 0 && selectedDirectLeaves.length > 0) {
      // All children are leaves — collapse into one chip: "Parent > All" or "Parent > A, B"
      const names = selectedDirectLeaves.map((c) => c.label).join(', ');
      chips.push({ label: nodePath.join(' > ') + ' > ' + names });
      continue;
    }

    // Mixed: recurse into children
    collectChips(node.children, selected, nodePath, chips);
  }
}
