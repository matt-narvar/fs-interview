import type { ReasonNode, ConditionFieldsResponse, ReturnCart, EvaluateRequest, EvaluateResponse } from './types';

export async function fetchReasons(): Promise<ReasonNode[]> {
  const res = await fetch('/api/reasons');
  return res.json();
}

export async function fetchConditionFields(): Promise<ConditionFieldsResponse> {
  const res = await fetch('/api/condition-fields');
  return res.json();
}

export async function fetchReturnCarts(): Promise<ReturnCart[]> {
  const res = await fetch('/api/return-carts');
  return res.json();
}

export async function evaluateConditions(request: EvaluateRequest): Promise<EvaluateResponse> {
  const res = await fetch('/api/conditions/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return res.json();
}
