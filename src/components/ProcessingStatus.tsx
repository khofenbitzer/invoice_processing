import type { InvoiceRecord } from '../types';

interface ProcessingStatusProps {
  invoices: InvoiceRecord[];
}

export function ProcessingStatus({ invoices }: ProcessingStatusProps) {
  const processing = invoices.filter((inv) => inv.status === 'processing');

  if (processing.length === 0) return null;

  return (
    <div className="processing-status">
      {processing.map((inv) => (
        <div key={inv.id} className="processing-item">
          <div className="spinner" />
          <span>Processing {inv.fileName}...</span>
        </div>
      ))}
    </div>
  );
}
