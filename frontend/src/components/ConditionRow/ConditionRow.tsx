import type { ConditionDraft, ConditionField, FieldType, Operator, ReasonNode } from '../../types';
import { Select } from '../Select/Select';
import { ReasonPicker } from '../ReasonPicker/ReasonPicker';
import styles from './ConditionRow.module.css';

const ARRAY_FIELDS = new Set([
  'order_items.unit_price',
  'order_items.is_final_sale',
  'order_items.is_gift',
  'order_items.color',
  'shipments.carrier',
  'return_items.reason_id',
]);

const REASON_OPERATORS = [
  { value: 'IS', label: 'is' },
  { value: 'IS_NOT', label: 'is not' },
];

const BOOLEAN_OPTIONS = [
  { value: 'true', label: 'true' },
  { value: 'false', label: 'false' },
];

const QUANTIFIER_OPTIONS = [
  { value: 'any', label: 'any item' },
  { value: 'all', label: 'all items' },
];

interface ConditionRowProps {
  condition: ConditionDraft;
  fields: ConditionField[];
  operators: Record<FieldType, Operator[]>;
  reasons: ReasonNode[];
  onChange: (updated: ConditionDraft) => void;
  onRemove: () => void;
}

export function ConditionRow({
  condition,
  fields,
  operators,
  reasons,
  onChange,
  onRemove,
}: ConditionRowProps) {
  const selectedField = fields.find((f) => f.value === condition.field);
  const isReasonField = condition.field === 'return_items.reason_id';
  const isArrayField = ARRAY_FIELDS.has(condition.field);

  const availableOperators = isReasonField
    ? REASON_OPERATORS
    : selectedField
      ? operators[selectedField.type]
      : [];

  function handleFieldChange(newField: string) {
    const newFieldDef = fields.find((f) => f.value === newField);
    const newOps = newField === 'return_items.reason_id'
      ? REASON_OPERATORS
      : newFieldDef
        ? operators[newFieldDef.type]
        : [];
    onChange({
      ...condition,
      field: newField,
      operator: newOps[0]?.value ?? '',
      value: '',
      selectedReasonIds: [],
      quantifier: undefined,
    });
  }

  function handleOperatorChange(operator: string) {
    onChange({ ...condition, operator });
  }

  function handleValueChange(value: string) {
    onChange({ ...condition, value });
  }

  function handleReasonChange(ids: string[]) {
    onChange({ ...condition, selectedReasonIds: ids });
  }

  function handleQuantifierChange(q: string) {
    onChange({ ...condition, quantifier: q as 'any' | 'all' });
  }

  return (
    <div className={styles.row}>
      <div className={styles.fields}>
        <Select
          value={condition.field}
          onChange={handleFieldChange}
          options={fields.map((f) => ({ value: f.value, label: f.label }))}
          placeholder="Select field…"
          aria-label="Field"
          className={styles.fieldSelect}
        />

        <Select
          value={condition.operator}
          onChange={handleOperatorChange}
          options={availableOperators}
          disabled={!condition.field}
          aria-label="Operator"
          className={styles.operatorSelect}
        />

        {isArrayField && !isReasonField && (
          <Select
            value={condition.quantifier ?? 'any'}
            onChange={handleQuantifierChange}
            options={QUANTIFIER_OPTIONS}
            aria-label="Quantifier"
            className={styles.quantifierSelect}
          />
        )}

        <div className={styles.valueCell}>
          {isReasonField ? (
            <ReasonPicker
              reasons={reasons}
              selectedLeafIds={condition.selectedReasonIds}
              onChange={handleReasonChange}
            />
          ) : selectedField?.type === 'boolean' ? (
            <Select
              value={condition.value}
              onChange={handleValueChange}
              options={BOOLEAN_OPTIONS}
              placeholder="Select…"
              aria-label="Value"
            />
          ) : selectedField?.type === 'number' ? (
            <input
              type="number"
              className={styles.textInput}
              value={condition.value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Value…"
              aria-label="Value"
            />
          ) : (
            <input
              type="text"
              className={styles.textInput}
              value={condition.value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Value…"
              aria-label="Value"
              disabled={!condition.field}
            />
          )}
        </div>
      </div>

      <button
        type="button"
        className={styles.removeBtn}
        onClick={onRemove}
        aria-label="Remove condition"
      >
        ×
      </button>
    </div>
  );
}
