// ---- Order Payload ----

export interface OrderPayload {
  id: string;
  description: string;
  order_info: {
    order_number: string;
    order_date: string;
    order_items: OrderItem[];
    shipments: Shipment[];
    billing: {
      amount: number;
      tax_rate: number;
      tax_amount: number;
      shipping_handling: number;
    };
    customer: {
      first_name: string;
      last_name: string;
      email: string;
      address: {
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    };
    currency_code: string;
  };
}

export interface OrderItem {
  item_id: string;
  sku: string;
  name: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_percent: number;
  is_final_sale: boolean;
  fulfillment_status: string;
  is_gift: boolean;
  is_backordered: boolean;
  color: string;
  size: string;
}

export interface Shipment {
  carrier: string;
  ship_method: string;
  ship_date: string;
  tracking_number: string;
  shipped_to: {
    first_name: string;
    last_name: string;
    email: string;
    address: {
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
}

// ---- Condition Evaluation ----

export interface Condition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

export interface ConditionGroup {
  logic: 'AND' | 'OR';
  conditions: Array<Condition | ConditionGroup>;
}

export interface EvaluateRequest {
  conditions: ConditionGroup;
  order: OrderPayload;
}

export interface EvaluateResponse {
  match: boolean;
}

// ---- Reason Tree ----

export interface ReasonNode {
  id: string;
  label: string;
  children?: ReasonNode[];
}

// ---- Condition Fields ----

export type FieldType = 'string' | 'number' | 'boolean';

export interface ConditionField {
  value: string;
  label: string;
  type: FieldType;
  enumValues?: string[];
}

export interface Operator {
  value: string;
  label: string;
}

export interface ConditionFieldsResponse {
  fields: ConditionField[];
  operators: Record<FieldType, Operator[]>;
}
