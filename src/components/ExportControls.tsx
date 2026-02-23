import type { InvoiceRecord, FieldConfig } from '../types';
import { exportToExcel, exportToCsv } from '../services/exportService';

interface ExportControlsProps {
  invoices: InvoiceRecord[];
  fieldConfigs: FieldConfig[];
}

export function ExportControls({ invoices, fieldConfigs }: ExportControlsProps) {
  const completedCount = invoices.filter((inv) => inv.status === 'completed').length;

  if (completedCount === 0) return null;

  return (
    <div className="export-controls">
      <span className="export-label">{completedCount} invoice(s) ready to export</span>
      <button
        className="btn btn-primary"
        onClick={() => exportToExcel(invoices, fieldConfigs)}
      >
        Export Excel
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => exportToCsv(invoices, fieldConfigs)}
      >
        Export CSV
      </button>
    </div>
  );
}
