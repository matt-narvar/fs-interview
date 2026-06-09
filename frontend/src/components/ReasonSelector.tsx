import { useState, useEffect, useRef } from 'react';
import type { ReasonNode } from '../types';
import { ReasonTreeNode } from './ReasonTreeNode';
import styles from './ReasonSelector.module.css';

export type CheckState = 'checked' | 'unchecked' | 'indeterminate';

interface Props {
  reasons: ReasonNode[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function setSubtree(node: ReasonNode, set: Set<string>, checked: boolean): void {
  if (checked) set.add(node.id);
  else set.delete(node.id);
  for (const child of node.children ?? []) {
    setSubtree(child, set, checked);
  }
}

function computeStates(reasons: ReasonNode[], checked: Set<string>): Record<string, CheckState> {
  const states: Record<string, CheckState> = {};

  function visit(node: ReasonNode): CheckState {
    if (!node.children || node.children.length === 0) {
      const state: CheckState = checked.has(node.id) ? 'checked' : 'unchecked';
      states[node.id] = state;
      return state;
    }
    const childStates = node.children.map(visit);
    const allChecked = childStates.every(s => s === 'checked');
    const noneChecked = childStates.every(s => s === 'unchecked');
    const state: CheckState = allChecked ? 'checked' : noneChecked ? 'unchecked' : 'indeterminate';
    states[node.id] = state;
    return state;
  }

  for (const root of reasons) visit(root);
  return states;
}

function generateChips(reasons: ReasonNode[], states: Record<string, CheckState>): string[] {
  const chips: string[] = [];

  function visit(nodes: ReasonNode[], path: string): void {
    const checkedLeaves: string[] = [];

    for (const node of nodes) {
      const state = states[node.id];
      if (state === 'unchecked') continue;

      const nodePath = path ? `${path} > ${node.label}` : node.label;

      if (!node.children || node.children.length === 0) {
        checkedLeaves.push(node.label);
      } else if (state === 'checked') {
        chips.push(`${nodePath} > All`);
      } else {
        visit(node.children, nodePath);
      }
    }

    if (checkedLeaves.length > 0) {
      chips.push(path ? `${path} > ${checkedLeaves.join(', ')}` : checkedLeaves.join(', '));
    }
  }

  visit(reasons, '');
  return chips;
}

export const ReasonSelector = ({ reasons, selectedIds, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(() => new Set(selectedIds));
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external selectedIds → local state
  useEffect(() => {
    setChecked(new Set(selectedIds));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.join(',')]);

  // Close on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const states = computeStates(reasons, checked);

  const toggle = (node: ReasonNode) => {
    const next = new Set(checked);
    const currentState = states[node.id];
    // Indeterminate or unchecked → check; checked → uncheck
    setSubtree(node, next, currentState !== 'checked');
    setChecked(next);
    onChange(Array.from(next));
  };

  const chips = generateChips(reasons, states);

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className={styles.chipArea}>
          {chips.length > 0
            ? chips.map((chip, i) => <span key={i} className={styles.chip}>{chip}</span>)
            : <span className={styles.placeholder}>Select reasons…</span>
          }
        </span>
        <span className={styles.arrow}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {reasons.map(node => (
            <ReasonTreeNode
              key={node.id}
              node={node}
              states={states}
              depth={0}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
