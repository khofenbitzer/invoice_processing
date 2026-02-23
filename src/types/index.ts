export interface SubFieldConfig {
  id: string;
  label: string;
  dataType: 'string' | 'number' | 'date';
}

export interface ScalarFieldConfig {
  id: string;
  label: string;
  type: 'scalar';
  dataType: 'string' | 'number' | 'date';
  description?: string;
}

export interface ArrayFieldConfig {
  id: string;
  label: string;
  type: 'array';
  description?: string;
  subFields: SubFieldConfig[];
}

export type FieldConfig = ScalarFieldConfig | ArrayFieldConfig;

export interface ArrayRow {
  [subFieldId: string]: string | number | null;
}

export interface InvoiceRecord {
  id: string;
  fileName: string;
  fileHash: string;
  processedAt: string;
  scalarData: Record<string, string | number | null>;
  arrayData: Record<string, ArrayRow[]>;
  rawResponse: string;
  pageCount: number;
  status: 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ApiConfig {
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AppState {
  fieldConfigs: FieldConfig[];
  invoices: InvoiceRecord[];
  apiConfig: ApiConfig;
}

export interface PdfPageImage {
  pageNumber: number;
  base64: string;
  width: number;
  height: number;
}
