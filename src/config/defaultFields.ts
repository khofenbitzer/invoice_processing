import type { FieldConfig, ApiConfig } from '../types';

export const defaultFieldConfigs: FieldConfig[] = [
  {
    id: 'vendor_name',
    label: 'Vendor Name',
    type: 'scalar',
    dataType: 'string',
    description: 'The name of the company or person that issued the invoice',
  },
  {
    id: 'vendor_address',
    label: 'Vendor Address',
    type: 'scalar',
    dataType: 'string',
    description: 'Full address of the vendor',
  },
  {
    id: 'invoice_number',
    label: 'Invoice Number',
    type: 'scalar',
    dataType: 'string',
    description: 'The unique invoice number or ID',
  },
  {
    id: 'invoice_date',
    label: 'Invoice Date',
    type: 'scalar',
    dataType: 'date',
    description: 'The date the invoice was issued',
  },
  {
    id: 'due_date',
    label: 'Due Date',
    type: 'scalar',
    dataType: 'date',
    description: 'The payment due date',
  },
  {
    id: 'total_amount',
    label: 'Total Amount',
    type: 'scalar',
    dataType: 'number',
    description: 'The total amount due on the invoice',
  },
  {
    id: 'currency',
    label: 'Currency',
    type: 'scalar',
    dataType: 'string',
    description: 'The currency code (e.g., USD, EUR)',
  },
  {
    id: 'line_items',
    label: 'Line Items',
    type: 'array',
    description: 'Individual line items or products/services listed on the invoice',
    subFields: [
      { id: 'description', label: 'Description', dataType: 'string' },
      { id: 'quantity', label: 'Quantity', dataType: 'number' },
      { id: 'unit_price', label: 'Unit Price', dataType: 'number' },
      { id: 'amount', label: 'Amount', dataType: 'number' },
    ],
  },
];

export const defaultApiConfig: ApiConfig = {
  baseUrl: '/api/v1',
  model: 'qwen/qwen3-vl-8b',
  maxTokens: 4096,
  temperature: 0.1,
};
