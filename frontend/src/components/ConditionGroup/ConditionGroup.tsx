import type {
  ConditionDraft,
  ConditionGroupDraft,
  ConditionField,
  FieldType,
  Operator,
  ReasonNode,
} from '../../types';
import { ConditionRow } from '../ConditionRow/ConditionRow';
import { Select } from '../Select/Select';
import styles from './ConditionGroup.module.css';

function emptyCondition(): ConditionDraft {
  return {
    id: crypto.randomUUID(),
    field: '',
    operator: '',
    value: '',
    selectedReasonIds: [],
  };
}

interface ConditionGroupProps {
  group: ConditionGroupDraft;
  fields: ConditionField[];
  operators: Record<FieldType, Operator[]>;
  reasons: ReasonNode[];
  onChange: (updated: ConditionGroupDraft) => void;
  depth?: number;
}

export function ConditionGroup({
  group,
  fields,
  operators,
  reasons,
  onChange,
  depth = 0,
}: ConditionGroupProps) {
  const logicOptions = [
    { value: 'AND', label: 'AND — all conditions must match' },
    { value: 'OR', label: 'OR — any condition must match' },
  ];

  function updateLogic(logic: string) {
    onChange({ ...group, logic: logic as 'AND' | 'OR' });
  }

  function updateCondition(index: number, updated: ConditionDraft | ConditionGroupDraft) {
    const conditions = group.conditions.map((c, i) => (i === index ? updated : c));
    onChange({ ...group, conditions });
  }

  function removeCondition(index: number) {
    const conditions = group.conditions.filter((_, i) => i !== index);
    onChange({ ...group, conditions });
  }

  function addCondition() {
    onChange({ ...group, conditions: [...group.conditions, emptyCondition()] });
  }

  return (
    <div className={`${styles.group} ${depth > 0 ? styles.nested : ''}`}>
      {group.conditions.length > 1 && (
        <div className={styles.logicRow}>
          <Select
            value={group.logic}
            onChange={updateLogic}
            options={logicOptions}
            aria-label="Logic operator"
            className={styles.logicSelect}
          />
        </div>
      )}

      <div className={styles.conditions}>
        {group.conditions.map((node, index) => {
          if ('logic' in node) {
            return (
              <ConditionGroup
                key={(node as ConditionGroupDraft).id}
                group={node as ConditionGroupDraft}
                fields={fields}
                operators={operators}
                reasons={reasons}
                onChange={(updated) => updateCondition(index, updated)}
                depth={depth + 1}
              />
            );
          }
          return (
            <ConditionRow
              key={(node as ConditionDraft).id}
              condition={node as ConditionDraft}
              fields={fields}
              operators={operators}
              reasons={reasons}
              onChange={(updated) => updateCondition(index, updated)}
              onRemove={() => removeCondition(index)}
            />
          );
        })}
      </div>

      <button type="button" className={styles.addBtn} onClick={addCondition}>
        + Add condition
      </button>
    </div>
  );
}
