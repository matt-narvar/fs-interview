import { useState, useRef, useEffect } from 'react';
import type { ReasonNode } from '../../types';
import { CheckboxTree } from '../CheckboxTree/CheckboxTree';
import { Chip } from '../Chip/Chip';
import { buildChipSummary } from '../../utils/reasonChips';
import styles from './ReasonPicker.module.css';

interface ReasonPickerProps {
  reasons: ReasonNode[];
  selectedLeafIds: string[];
  onChange: (ids: string[]) => void;
}

export function ReasonPicker({ reasons, selectedLeafIds, onChange }: ReasonPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const chips = buildChipSummary(reasons, selectedLeafIds);
  const checked = new Set(selectedLeafIds);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {chips.length === 0 ? (
          <span className={styles.placeholder}>Select reasons…</span>
        ) : (
          <span className={styles.chips}>
            {chips.map((chip) => (
              <Chip key={chip.label} label={chip.label} />
            ))}
          </span>
        )}
        <span className={styles.caret} aria-hidden>▾</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="dialog" aria-label="Reason selector">
          <CheckboxTree
            nodes={reasons}
            checked={checked}
            onChange={(next) => onChange(Array.from(next))}
          />
        </div>
      )}
    </div>
  );
}
