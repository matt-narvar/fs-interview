import { useState } from 'react';
import type { ConditionField, ConditionGroup, Condition, Operator, ReasonNode, ReturnCart } from '../types';
import { ConditionRow } from './ConditionRow';
import { EvaluationResult } from './EvaluationResult';
import { evaluateConditions } from '../api';
import styles from './ConditionBuilder.module.css';

interface ConditionRowState {
  id: string;
  field: string;
  operator: string;
  value: string | number | boolean;
  reasonIds: string[];
}

interface Props {
  fields: ConditionField[];
  operators: Record<string, Operator[]>;
  reasons: ReasonNode[];
  carts: ReturnCart[];
}

let nextId = 1;

function makeRow(fields: ConditionField[], operators: Record<string, Operator[]>): ConditionRowState {
  const firstField = fields[0];
  const firstOp = firstField ? (operators[firstField.type]?.[0]?.value ?? '') : '';
  return { id: `c${nextId++}`, field: firstField?.value ?? '', operator: firstOp, value: '', reasonIds: [] };
}

function buildPayload(rows: ConditionRowState[], logic: 'AND' | 'OR', fields: ConditionField[]): ConditionGroup {
  const items = rows.map(row => {
    const fieldDef = fields.find(f => f.value === row.field);

    if (fieldDef?.type === 'reason') {
      const ids = row.reasonIds;
      if (ids.length === 0) return { field: row.field, operator: 'EQ', value: '' } as Condition;
      if (ids.length === 1) return { field: row.field, operator: 'EQ', value: ids[0] } as Condition;
      return {
        logic: 'OR',
        conditions: ids.map(id => ({ field: row.field, operator: 'EQ', value: id } as Condition)),
      } as ConditionGroup;
    }

    return { field: row.field, operator: row.operator, value: row.value } as Condition;
  });

  return { logic, conditions: items };
}

export const ConditionBuilder = ({ fields, operators, reasons, carts }: Props) => {
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<ConditionRowState[]>([makeRow(fields, operators)]);
  const [selectedCartId, setSelectedCartId] = useState(carts[0]?.id ?? '');
  const [result, setResult] = useState<boolean | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCondition = () => setConditions(prev => [...prev, makeRow(fields, operators)]);

  const removeCondition = (id: string) =>
    setConditions(prev => prev.filter(c => c.id !== id));

  const updateCondition = (id: string, patch: Partial<ConditionRowState>) =>
    setConditions(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));

  const handleEvaluate = async () => {
    const cart = carts.find(c => c.id === selectedCartId);
    if (!cart) return;

    setEvaluating(true);
    setError(null);
    setResult(null);

    try {
      const payload = buildPayload(conditions, logic, fields);
      const res = await evaluateConditions({ conditions: payload, cart });
      setResult(res.match);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className={styles.builder}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Match</span>
        <div className={styles.logicToggle}>
          {(['AND', 'OR'] as const).map(l => (
            <button
              key={l}
              className={logic === l ? styles.logicActive : styles.logicBtn}
              onClick={() => setLogic(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <span className={styles.headerLabel}>of the following conditions:</span>
      </div>

      <div className={styles.conditionList}>
        {conditions.map((cond, idx) => (
          <ConditionRow
            key={cond.id}
            fields={fields}
            operators={operators}
            reasons={reasons}
            condition={cond}
            showLogicBadge={idx > 0}
            logic={logic}
            onChange={patch => updateCondition(cond.id, patch)}
            onRemove={() => removeCondition(cond.id)}
          />
        ))}
      </div>

      <button className={styles.addBtn} onClick={addCondition}>
        + Add condition
      </button>

      <div className={styles.footer}>
        <div className={styles.cartSelect}>
          <label className={styles.cartLabel}>Test with cart:</label>
          <select
            className={styles.cartDropdown}
            value={selectedCartId}
            onChange={e => setSelectedCartId(e.target.value)}
          >
            {carts.map(c => (
              <option key={c.id} value={c.id}>{c.description}</option>
            ))}
          </select>
        </div>

        <button className={styles.evalBtn} onClick={handleEvaluate} disabled={evaluating}>
          {evaluating ? 'Evaluating…' : 'Evaluate'}
        </button>
      </div>

      {(result !== null || error) && (
        <EvaluationResult match={result} error={error} />
      )}
    </div>
  );
};
