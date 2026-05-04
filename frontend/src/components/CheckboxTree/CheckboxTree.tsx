import { useRef, useEffect } from 'react';
import type { ReasonNode } from '../../types';
import { getLeafIds, getIndeterminateIds } from '../../utils/treeHelpers';
import styles from './CheckboxTree.module.css';

interface CheckboxTreeProps {
  nodes: ReasonNode[];
  checked: Set<string>;
  onChange: (checked: Set<string>) => void;
}

export function CheckboxTree({ nodes, checked, onChange }: CheckboxTreeProps) {
  const indeterminate = getIndeterminateIds(nodes, checked);
  return (
    <ul className={styles.list} role="tree">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          allNodes={nodes}
          checked={checked}
          indeterminate={indeterminate}
          onChange={onChange}
        />
      ))}
    </ul>
  );
}

interface TreeNodeProps {
  node: ReasonNode;
  allNodes: ReasonNode[];
  checked: Set<string>;
  indeterminate: Set<string>;
  onChange: (checked: Set<string>) => void;
}

function TreeNode({ node, allNodes, checked, indeterminate, onChange }: TreeNodeProps) {
  const isLeaf = !node.children || node.children.length === 0;
  const isChecked = isLeaf ? checked.has(node.id) : getLeafIds(node).every((id) => checked.has(id));
  const isIndeterminate = indeterminate.has(node.id);

  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  function handleChange() {
    const next = new Set(checked);
    const leaves = getLeafIds(node);

    if (isIndeterminate) {
      // indeterminate → check all descendants
      leaves.forEach((id) => next.add(id));
    } else if (isChecked) {
      // checked → uncheck all descendants
      leaves.forEach((id) => next.delete(id));
    } else {
      // unchecked → check all descendants
      leaves.forEach((id) => next.add(id));
    }
    onChange(next);
  }

  return (
    <li className={styles.item} role="treeitem">
      <label className={styles.label}>
        <input
          ref={ref}
          type="checkbox"
          className={styles.checkbox}
          checked={isChecked}
          onChange={handleChange}
          aria-label={node.label}
        />
        <span>{node.label}</span>
      </label>
      {node.children && node.children.length > 0 && (
        <ul className={styles.children} role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              allNodes={allNodes}
              checked={checked}
              indeterminate={indeterminate}
              onChange={onChange}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
