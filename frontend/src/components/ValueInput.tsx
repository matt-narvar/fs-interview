import type { ConditionField, ReasonNode } from '../types';
import { ReasonSelector } from './ReasonSelector';
import styles from './ValueInput.module.css';

interface Props {
  field: ConditionField | undefined;
  value: string | number | boolean;
  reasonIds: string[];
  reasons: ReasonNode[];
  onChange: (value: string | number | boolean) => void;
  onReasonChange: (ids: string[]) => void;
}

export const ValueInput = ({ field, value, reasonIds, reasons, onChange, onReasonChange }: Props) => {
  if (!field) return <input className={styles.input} disabled placeholder="Select a field" />;

  if (field.type === 'reason') {
    return (
      <ReasonSelector
        reasons={reasons}
        selectedIds={reasonIds}
        onChange={onReasonChange}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <select
        className={styles.input}
        value={String(value)}
        onChange={e => onChange(e.target.value === 'true')}
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        className={styles.input}
        value={typeof value === 'number' ? value : ''}
        onChange={e => onChange(Number(e.target.value))}
        placeholder="Value"
      />
    );
  }

  return (
    <input
      type="text"
      className={styles.input}
      value={typeof value === 'string' ? value : ''}
      onChange={e => onChange(e.target.value)}
      placeholder="Value"
    />
  );
};
