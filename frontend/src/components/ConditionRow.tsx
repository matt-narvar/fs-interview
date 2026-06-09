import type { ConditionField, Operator, ReasonNode } from '../types';
import { ValueInput } from './ValueInput';
import styles from './ConditionRow.module.css';

interface ConditionRowState {
  field: string;
  operator: string;
  value: string | number | boolean;
  reasonIds: string[];
}

interface Props {
  fields: ConditionField[];
  operators: Record<string, Operator[]>;
  reasons: ReasonNode[];
  condition: ConditionRowState;
  showLogicBadge: boolean;
  logic: 'AND' | 'OR';
  onChange: (patch: Partial<ConditionRowState>) => void;
  onRemove: () => void;
}

export const ConditionRow = ({
  fields,
  operators,
  reasons,
  condition,
  showLogicBadge,
  logic,
  onChange,
  onRemove,
}: Props) => {
  const selectedField = fields.find(f => f.value === condition.field);
  const availableOps: Operator[] = selectedField ? (operators[selectedField.type] ?? []) : [];

  const handleFieldChange = (newField: string) => {
    const fieldDef = fields.find(f => f.value === newField);
    const ops = fieldDef ? (operators[fieldDef.type] ?? []) : [];
    onChange({ field: newField, operator: ops[0]?.value ?? '', value: '', reasonIds: [] });
  };

  return (
    <div className={styles.wrapper}>
      {showLogicBadge && (
        <span className={styles.logicBadge}>{logic}</span>
      )}
      <div className={styles.row}>
        <select
          className={styles.select}
          value={condition.field}
          onChange={e => handleFieldChange(e.target.value)}
        >
          {fields.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={condition.operator}
          onChange={e => onChange({ operator: e.target.value })}
        >
          {availableOps.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>

        <ValueInput
          field={selectedField}
          value={condition.value}
          reasonIds={condition.reasonIds}
          reasons={reasons}
          onChange={value => onChange({ value })}
          onReasonChange={reasonIds => onChange({ reasonIds })}
        />

        <button className={styles.removeBtn} onClick={onRemove} title="Remove condition">
          ×
        </button>
      </div>
    </div>
  );
};
