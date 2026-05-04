import { Router } from 'express';
import { ConditionFieldsResponse } from '../types.js';

export const fieldsRouter = Router();

const response: ConditionFieldsResponse = {
  fields: [
    { value: 'customer.email',            label: 'Customer Email',  type: 'string'  },
    { value: 'billing.amount',            label: 'Order Total',     type: 'number'  },
    { value: 'order_items.unit_price',    label: 'Item Price',      type: 'number'  },
    { value: 'shipments.carrier',         label: 'Carrier',         type: 'string'  },
    { value: 'customer.address.country',  label: 'Country',         type: 'string'  },
    { value: 'order_items.is_final_sale', label: 'Is Final Sale',   type: 'boolean' },
    { value: 'order_items.is_gift',       label: 'Is Gift',         type: 'boolean' },
    { value: 'order_items.color',         label: 'Item Color',      type: 'string'  },
    { value: 'return_items.reason_id',    label: 'Reason',          type: 'string'  },
  ],
  operators: {
    string: [
      { value: 'IS',          label: 'is'          },
      { value: 'IS_NOT',      label: 'is not'      },
      { value: 'CONTAINS',    label: 'contains'    },
      { value: 'STARTS_WITH', label: 'starts with' },
      { value: 'ENDS_WITH',   label: 'ends with'   },
    ],
    number: [
      { value: 'IS',     label: 'is'  },
      { value: 'IS_NOT', label: 'is not' },
      { value: 'GT',     label: '>'   },
      { value: 'GTE',    label: '>='  },
      { value: 'LT',     label: '<'   },
      { value: 'LTE',    label: '<='  },
    ],
    boolean: [
      { value: 'IS',     label: 'is'     },
      { value: 'IS_NOT', label: 'is not' },
    ],
  },
};

fieldsRouter.get('/', (req, res) => {
  res.json(response);
});
