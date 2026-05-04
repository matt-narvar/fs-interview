import type { ReasonNode } from '../types';

export function getLeafIds(node: ReasonNode): string[] {
  if (!node.children || node.children.length === 0) return [node.id];
  return node.children.flatMap(getLeafIds);
}

export function getAllLeafIdsUnder(nodes: ReasonNode[], parentId: string): string[] {
  for (const node of nodes) {
    if (node.id === parentId) return getLeafIds(node);
    if (node.children) {
      const found = getAllLeafIdsUnder(node.children, parentId);
      if (found.length > 0) return found;
    }
  }
  return [];
}

export function getIndeterminateIds(nodes: ReasonNode[], checkedLeafIds: Set<string>): Set<string> {
  const indeterminate = new Set<string>();
  collectIndeterminate(nodes, checkedLeafIds, indeterminate);
  return indeterminate;
}

function collectIndeterminate(
  nodes: ReasonNode[],
  checkedLeafIds: Set<string>,
  result: Set<string>,
): void {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) continue;
    collectIndeterminate(node.children, checkedLeafIds, result);
    const leaves = getLeafIds(node);
    const checkedCount = leaves.filter((id) => checkedLeafIds.has(id)).length;
    if (checkedCount > 0 && checkedCount < leaves.length) {
      result.add(node.id);
    }
  }
}
