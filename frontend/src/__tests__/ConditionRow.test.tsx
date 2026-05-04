import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConditionRow } from '../components/ConditionRow/ConditionRow';
import type { ConditionDraft, ConditionField, FieldType, Operator, ReasonNode } from '../types';

const fields: ConditionField[] = [
  { value: 'customer.email', label: 'Customer Email', type: 'string' },
  { value: 'billing.amount', label: 'Order Total', type: 'number' },
  { value: 'order_items.is_final_sale', label: 'Is Final Sale', type: 'boolean' },
  { value: 'return_items.reason_id', label: 'Reason', type: 'string' },
];

const operators: Record<FieldType, Operator[]> = {
  string: [
    { value: 'IS', label: 'is' },
    { value: 'IS_NOT', label: 'is not' },
    { value: 'CONTAINS', label: 'contains' },
    { value: 'STARTS_WITH', label: 'starts with' },
    { value: 'ENDS_WITH', label: 'ends with' },
  ],
  number: [
    { value: 'IS', label: 'is' },
    { value: 'IS_NOT', label: 'is not' },
    { value: 'GT', label: '>' },
    { value: 'GTE', label: '>=' },
    { value: 'LT', label: '<' },
    { value: 'LTE', label: '<=' },
  ],
  boolean: [
    { value: 'IS', label: 'is' },
    { value: 'IS_NOT', label: 'is not' },
  ],
};

const reasons: ReasonNode[] = [
  { id: 'ripped', label: 'Ripped' },
];

function makeCondition(overrides: Partial<ConditionDraft> = {}): ConditionDraft {
  return {
    id: 'test-1',
    field: '',
    operator: '',
    value: '',
    selectedReasonIds: [],
    ...overrides,
  };
}

describe('ConditionRow', () => {
  it('renders field select, operator select, and value input', () => {
    render(
      <ConditionRow
        condition={makeCondition()}
        fields={fields}
        operators={operators}
        reasons={reasons}
        onChange={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Field' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Operator' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Value' })).toBeInTheDocument();
  });

  it('string field shows 5 operator options', async () => {
    render(
      <ConditionRow
        condition={makeCondition({ field: 'customer.email', operator: 'IS' })}
        fields={fields}
        operators={operators}
        reasons={reasons}
        onChange={() => {}}
        onRemove={() => {}}
      />,
    );
    const opSelect = screen.getByRole('combobox', { name: 'Operator' });
    expect(opSelect.querySelectorAll('option')).toHaveLength(5);
  });

  it('number field shows 6 operator options', () => {
    render(
      <ConditionRow
        condition={makeCondition({ field: 'billing.amount', operator: 'IS' })}
        fields={fields}
        operators={operators}
        reasons={reasons}
        onChange={() => {}}
        onRemove={() => {}}
      />,
    );
    const opSelect = screen.getByRole('combobox', { name: 'Operator' });
    expect(opSelect.querySelectorAll('option')).toHaveLength(6);
  });

  it('boolean field shows IS/IS_NOT operators and true/false value select', () => {
    render(
      <ConditionRow
        condition={makeCondition({ field: 'order_items.is_final_sale', operator: 'IS' })}
        fields={fields}
        operators={operators}
        reasons={reasons}
        onChange={() => {}}
        onRemove={() => {}}
      />,
    );
    const opSelect = screen.getByRole('combobox', { name: 'Operator' });
    expect(opSelect.querySelectorAll('option')).toHaveLength(2);
    const valueSelect = screen.getByRole('combobox', { name: 'Value' });
    expect(valueSelect).toBeInTheDocument();
    expect(valueSelect.querySelectorAll('option').length).toBeGreaterThanOrEqual(2);
  });

  it('reason field shows ReasonPicker instead of text input', () => {
    render(
      <ConditionRow
        condition={makeCondition({ field: 'return_items.reason_id', operator: 'IS' })}
        fields={fields}
        operators={operators}
        reasons={reasons}
        onChange={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(screen.queryByRole('textbox', { name: 'Value' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select reasons/i })).toBeInTheDocument();
  });

  it('reason field restricts operator dropdown to IS / IS_NOT only', () => {
    render(
      <ConditionRow
        condition={makeCondition({ field: 'return_items.reason_id', operator: 'IS' })}
        fields={fields}
        operators={operators}
        reasons={reasons}
        onChange={() => {}}
        onRemove={() => {}}
      />,
    );
    const opSelect = screen.getByRole('combobox', { name: 'Operator' });
    expect(opSelect.querySelectorAll('option')).toHaveLength(2);
  });

  it('onChange fires with updated field when field changes', async () => {
    const onChange = vi.fn();
    render(
      <ConditionRow
        condition={makeCondition()}
        fields={fields}
        operators={operators}
        reasons={reasons}
        onChange={onChange}
        onRemove={() => {}}
      />,
    );
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Field' }), 'billing.amount');
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ field: 'billing.amount' }),
    );
  });

  it('onRemove fires when remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(
      <ConditionRow
        condition={makeCondition()}
        fields={fields}
        operators={operators}
        reasons={reasons}
        onChange={() => {}}
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove condition' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
