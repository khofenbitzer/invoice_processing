import * as XLSX from 'xlsx';
import type { InvoiceRecord, FieldConfig, ScalarFieldConfig, ArrayFieldConfig } from '../types';

export function exportToExcel(invoices: InvoiceRecord[], fieldConfigs: FieldConfig[]) {
  const wb = XLSX.utils.book_new();
  const completed = invoices.filter((inv) => inv.status === 'completed');

  // Sheet 1: Main invoice table (scalar fields)
  const scalarFields = fieldConfigs.filter((f) => f.type === 'scalar') as ScalarFieldConfig[];
  const mainRows = completed.map((inv) => {
    const row: Record<string, unknown> = {
      invoice_id: inv.id,
      file_name: inv.fileName,
      processed_at: inv.processedAt,
    };
    for (const field of scalarFields) {
      row[field.label] = inv.scalarData[field.id] ?? '';
    }
    return row;
  });

  const wsMain = XLSX.utils.json_to_sheet(mainRows);
  XLSX.utils.book_append_sheet(wb, wsMain, 'Invoices');

  // One sheet per array field
  const arrayFields = fieldConfigs.filter((f) => f.type === 'array') as ArrayFieldConfig[];
  for (const arrayField of arrayFields) {
    const arrayRows: Record<string, unknown>[] = [];
    for (const inv of completed) {
      const items = inv.arrayData[arrayField.id] || [];
      for (const item of items) {
        const row: Record<string, unknown> = {
          invoice_id: inv.id,
          file_name: inv.fileName,
        };
        for (const sub of arrayField.subFields) {
          row[sub.label] = item[sub.id] ?? '';
        }
        arrayRows.push(row);
      }
    }
    const wsArray = XLSX.utils.json_to_sheet(arrayRows);
    XLSX.utils.book_append_sheet(wb, wsArray, arrayField.label.substring(0, 31));
  }

  XLSX.writeFile(wb, 'invoice_export.xlsx');
}

export function exportToCsv(invoices: InvoiceRecord[], fieldConfigs: FieldConfig[]) {
  const completed = invoices.filter((inv) => inv.status === 'completed');

  // Main invoice CSV
  const scalarFields = fieldConfigs.filter((f) => f.type === 'scalar') as ScalarFieldConfig[];
  const mainRows = completed.map((inv) => {
    const row: Record<string, unknown> = {
      invoice_id: inv.id,
      file_name: inv.fileName,
      processed_at: inv.processedAt,
    };
    for (const field of scalarFields) {
      row[field.label] = inv.scalarData[field.id] ?? '';
    }
    return row;
  });

  const wbMain = XLSX.utils.book_new();
  const wsMain = XLSX.utils.json_to_sheet(mainRows);
  XLSX.utils.book_append_sheet(wbMain, wsMain, 'Invoices');
  XLSX.writeFile(wbMain, 'invoices.csv', { bookType: 'csv' });

  // One CSV per array field
  const arrayFields = fieldConfigs.filter((f) => f.type === 'array') as ArrayFieldConfig[];
  for (const arrayField of arrayFields) {
    const arrayRows: Record<string, unknown>[] = [];
    for (const inv of completed) {
      const items = inv.arrayData[arrayField.id] || [];
      for (const item of items) {
        const row: Record<string, unknown> = {
          invoice_id: inv.id,
          file_name: inv.fileName,
        };
        for (const sub of arrayField.subFields) {
          row[sub.label] = item[sub.id] ?? '';
        }
        arrayRows.push(row);
      }
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(arrayRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const safeName = arrayField.id.replace(/[^a-z0-9_]/gi, '_');
    XLSX.writeFile(wb, `${safeName}.csv`, { bookType: 'csv' });
  }
}
