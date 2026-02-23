import { useReducer, useEffect } from 'react';
import type { AppState, FieldConfig, InvoiceRecord, ApiConfig, ArrayRow } from '../types';
import { defaultFieldConfigs, defaultApiConfig } from '../config/defaultFields';

const STORAGE_KEY = 'invoice-processor-state';

export type Action =
  | { type: 'SET_FIELD_CONFIGS'; payload: FieldConfig[] }
  | { type: 'SET_API_CONFIG'; payload: ApiConfig }
  | {
      type: 'START_PROCESSING';
      payload: { id: string; fileName: string; fileHash: string; pageCount: number };
    }
  | {
      type: 'COMPLETE_PROCESSING';
      payload: {
        id: string;
        scalarData: Record<string, string | number | null>;
        arrayData: Record<string, ArrayRow[]>;
        rawResponse: string;
      };
    }
  | { type: 'PROCESSING_ERROR'; payload: { id: string; errorMessage: string } }
  | { type: 'REMOVE_INVOICE'; payload: string };

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AppState;
      // Reset any invoices stuck in 'processing' state (from before the refresh)
      return {
        ...parsed,
        invoices: parsed.invoices.map((inv: InvoiceRecord) =>
          inv.status === 'processing'
            ? { ...inv, status: 'error' as const, errorMessage: 'Interrupted by page refresh' }
            : inv
        ),
      };
    }
  } catch {
    // Ignore parse errors, fall through to defaults
  }
  return {
    fieldConfigs: defaultFieldConfigs,
    invoices: [],
    apiConfig: defaultApiConfig,
  };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

function invoiceReducer(state: AppState, action: Action): AppState {
  let next: AppState;

  switch (action.type) {
    case 'SET_FIELD_CONFIGS':
      next = { ...state, fieldConfigs: action.payload };
      break;

    case 'SET_API_CONFIG':
      next = { ...state, apiConfig: action.payload };
      break;

    case 'START_PROCESSING': {
      const existingIndex = state.invoices.findIndex(
        (inv) => inv.fileHash === action.payload.fileHash
      );
      const newInvoice: InvoiceRecord = {
        ...action.payload,
        processedAt: new Date().toISOString(),
        scalarData: {},
        arrayData: {},
        rawResponse: '',
        status: 'processing',
      };
      if (existingIndex >= 0) {
        const updated = [...state.invoices];
        updated[existingIndex] = newInvoice;
        next = { ...state, invoices: updated };
      } else {
        next = { ...state, invoices: [...state.invoices, newInvoice] };
      }
      break;
    }

    case 'COMPLETE_PROCESSING':
      next = {
        ...state,
        invoices: state.invoices.map((inv) =>
          inv.id === action.payload.id
            ? {
                ...inv,
                scalarData: action.payload.scalarData,
                arrayData: action.payload.arrayData,
                rawResponse: action.payload.rawResponse,
                status: 'completed' as const,
              }
            : inv
        ),
      };
      break;

    case 'PROCESSING_ERROR':
      next = {
        ...state,
        invoices: state.invoices.map((inv) =>
          inv.id === action.payload.id
            ? { ...inv, status: 'error' as const, errorMessage: action.payload.errorMessage }
            : inv
        ),
      };
      break;

    case 'REMOVE_INVOICE':
      next = {
        ...state,
        invoices: state.invoices.filter((inv) => inv.id !== action.payload),
      };
      break;

    default:
      next = state;
  }

  // Persist after every state change
  saveState(next);
  return next;
}

export function useInvoiceStore() {
  const [state, dispatch] = useReducer(invoiceReducer, undefined, loadState);

  // Also save on first mount (in case loadState migrated anything)
  useEffect(() => {
    saveState(state);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { state, dispatch };
}
