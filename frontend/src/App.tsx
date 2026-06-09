import { useState, useEffect } from 'react';
import styles from './App.module.css';
import { ConditionBuilder } from './components/ConditionBuilder';
import { fetchConditionFields, fetchReasons, fetchReturnCarts } from './api';
import type { ConditionField, Operator, ReasonNode, ReturnCart } from './types';

export const App = () => {
  const [fields, setFields] = useState<ConditionField[]>([]);
  const [operators, setOperators] = useState<Record<string, Operator[]>>({});
  const [reasons, setReasons] = useState<ReasonNode[]>([]);
  const [carts, setCarts] = useState<ReturnCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchConditionFields(), fetchReasons(), fetchReturnCarts()])
      .then(([fieldsResp, reasonsData, cartsData]) => {
        setFields(fieldsResp.fields);
        setOperators(fieldsResp.operators as Record<string, Operator[]>);
        setReasons(reasonsData);
        setCarts(cartsData);
      })
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.app}>
        <p className={styles.status}>Loading…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.app}>
        <p className={styles.error}>Error: {loadError}</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Condition Editor</h1>
      <ConditionBuilder
        fields={fields}
        operators={operators}
        reasons={reasons}
        carts={carts}
      />
    </div>
  );
};
