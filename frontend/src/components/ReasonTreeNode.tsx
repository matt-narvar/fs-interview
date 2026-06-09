import { useRef, useEffect } from 'react';
import type { ReasonNode } from '../types';
import type { CheckState } from './ReasonSelector';
import styles from './ReasonSelector.module.css';

interface Props {
  node: ReasonNode;
  states: Record<string, CheckState>;
  depth: number;
  onToggle: (node: ReasonNode) => void;
}

export const ReasonTreeNode = ({ node, states, depth, onToggle }: Props) => {
  const checkRef = useRef<HTMLInputElement>(null);
  const state = states[node.id] ?? 'unchecked';

  useEffect(() => {
    if (checkRef.current) {
      checkRef.current.indeterminate = state === 'indeterminate';
    }
  }, [state]);

  return (
    <div>
      <label className={styles.treeNode} style={{ paddingLeft: `${8 + depth * 16}px` }}>
        <input
          ref={checkRef}
          type="checkbox"
          className={styles.checkbox}
          checked={state === 'checked'}
          onChange={() => onToggle(node)}
        />
        <span className={styles.nodeLabel}>{node.label}</span>
      </label>

      {node.children?.map(child => (
        <ReasonTreeNode
          key={child.id}
          node={child}
          states={states}
          depth={depth + 1}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};
