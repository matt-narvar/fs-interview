import type {
  ConditionDraft,
  ConditionGroupDraft,
  ConditionField,
  Condition,
  ConditionGroup,
  FieldType,
} from '../types';

export function toWireFormat(
  group: ConditionGroupDraft,
  fields: ConditionField[],
): ConditionGroup {
  const conditions: Array<Condition | ConditionGroup> = [];

  for (const node of group.conditions) {
    if ('logic' in node) {
      conditions.push(toWireFormat(node as ConditionGroupDraft, fields));
    } else {
      const draft = node as ConditionDraft;
      const expanded = expandCondition(draft, fields);
      if (expanded) conditions.push(expanded);
    }
  }

  return { logic: group.logic, conditions };
}

function expandCondition(
  draft: ConditionDraft,
  fields: ConditionField[],
): Condition | ConditionGroup | null {
  if (!draft.field || !draft.operator) return null;

  if (draft.field === 'return_items.reason_id') {
    const ids = draft.selectedReasonIds;
    if (ids.length === 0) return null;
    const value = ids.length === 1 ? ids[0] : ids;
    return { field: draft.field, operator: draft.operator, value };
  }

  const fieldDef = fields.find((f) => f.value === draft.field);
  const value = coerceValue(draft.value, fieldDef?.type ?? 'string');
  const condition: Condition = { field: draft.field, operator: draft.operator, value };
  if (draft.quantifier) (condition as Record<string, unknown>).quantifier = draft.quantifier;
  return condition;
}

function coerceValue(value: string, type: FieldType): string | number | boolean {
  if (type === 'number') return parseFloat(value) || 0;
  if (type === 'boolean') return value === 'true';
  return value;
}
