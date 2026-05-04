import { useState } from 'react';
import type { ConditionGroupDraft, ConditionDraft } from './types';
import { useConditionFields } from './hooks/useConditionFields';
import { useReasons } from './hooks/useReasons';
import { useReturnCarts } from './hooks/useReturnCarts';
import { ConditionGroup } from './components/ConditionGroup/ConditionGroup';
import { EvaluatePanel } from './components/EvaluatePanel/EvaluatePanel';
import styles from './App.module.css';

function emptyCondition(): ConditionDraft {
  return {
    id: crypto.randomUUID(),
    field: '',
    operator: '',
    value: '',
    selectedReasonIds: [],
  };
}

function initialGroup(): ConditionGroupDraft {
  return {
    id: crypto.randomUUID(),
    logic: 'AND',
    conditions: [emptyCondition()],
  };
}

export const App = () => {
  const [group, setGroup] = useState<ConditionGroupDraft>(initialGroup);
  const { data: fieldsData, loading: fieldsLoading, error: fieldsError } = useConditionFields();
  const { data: reasons, loading: reasonsLoading } = useReasons();
  const { data: carts, loading: cartsLoading } = useReturnCarts();

  const loading = fieldsLoading || reasonsLoading || cartsLoading;

  if (loading) {
    return (
      <div className={styles.app}>
        <p className={styles.status}>Loading…</p>
      </div>
    );
  }

  if (fieldsError || !fieldsData) {
    return (
      <div className={styles.app}>
        <p className={styles.status}>
          Could not load condition fields. Is the backend running on port 3001?
        </p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Condition Editor</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Conditions</h2>
        <ConditionGroup
          group={group}
          fields={fieldsData.fields}
          operators={fieldsData.operators}
          reasons={reasons ?? []}
          onChange={setGroup}
        />
      </section>

      {carts && carts.length > 0 && (
        <EvaluatePanel group={group} carts={carts} fields={fieldsData.fields} />
      )}
    </div>
  );
};
