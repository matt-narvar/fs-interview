import { useState } from 'react';
import type { ConditionDraft, ConditionGroupDraft, ConditionField, ReturnCart } from '../../types';
import { Select } from '../Select/Select';
import { toWireFormat } from '../../utils/toWireFormat';
import styles from './EvaluatePanel.module.css';

interface EvaluatePanelProps {
  group: ConditionGroupDraft;
  carts: ReturnCart[];
  fields: ConditionField[];
}

type Result = 'matched' | 'no-match' | 'error' | null;

export function EvaluatePanel({ group, carts, fields }: EvaluatePanelProps) {
  const [selectedCartId, setSelectedCartId] = useState(carts[0]?.id ?? '');
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  const cartOptions = carts.map((c) => ({ value: c.id, label: c.description }));
  const selectedCart = carts.find((c) => c.id === selectedCartId);

  async function handleEvaluate() {
    if (!selectedCart) return;
    setLoading(true);
    setResult(null);
    try {
      const conditions = toWireFormat(group, fields);
      const res = await fetch('/api/conditions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions, cart: selectedCart }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as { match: boolean };
      setResult(data.match ? 'matched' : 'no-match');
    } catch {
      setResult('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.heading}>Evaluate</h2>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="cart-picker">
          Test against cart
        </label>
        <Select
          value={selectedCartId}
          onChange={setSelectedCartId}
          options={cartOptions}
          aria-label="Select cart"
          className={styles.cartSelect}
        />
      </div>

      <button
        type="button"
        className={styles.evalBtn}
        onClick={handleEvaluate}
        disabled={loading || !selectedCartId}
      >
        {loading ? 'Evaluating…' : 'Evaluate'}
      </button>

      {result === 'matched' && (
        <div className={`${styles.result} ${styles.matched}`} role="status">
          ✓ Matched
        </div>
      )}
      {result === 'no-match' && (
        <div className={`${styles.result} ${styles.noMatch}`} role="status">
          ✗ No match
        </div>
      )}
      {result === 'error' && (
        <div className={`${styles.result} ${styles.error}`} role="status">
          Error evaluating — is the backend running?
        </div>
      )}
    </div>
  );
}
