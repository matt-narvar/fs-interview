import { useState, useEffect } from 'react';
import type { ConditionFieldsResponse } from '../types';

interface Result {
  data: ConditionFieldsResponse | null;
  loading: boolean;
  error: string | null;
}

export function useConditionFields(): Result {
  const [state, setState] = useState<Result>({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/condition-fields', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<ConditionFieldsResponse>;
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState({ data: null, loading: false, error: String(err.message) });
      });
    return () => controller.abort();
  }, []);

  return state;
}
