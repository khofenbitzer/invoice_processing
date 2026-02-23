import { useState } from 'react';
import type { InvoiceRecord, FieldConfig, ScalarFieldConfig, ArrayFieldConfig } from '../types';

interface InvoiceTableProps {
  invoices: InvoiceRecord[];
  fieldConfigs: FieldConfig[];
  onRemove: (id: string) => void;
}

export function InvoiceTable({ invoices, fieldConfigs, onRemove }: InvoiceTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, string | null>>({});

  const scalarFields = fieldConfigs.filter((f) => f.type === 'scalar') as ScalarFieldConfig[];
  const arrayFields = fieldConfigs.filter((f) => f.type === 'array') as ArrayFieldConfig[];
  const completedOrError = invoices.filter((inv) => inv.status !== 'processing');

  if (completedOrError.length === 0) return null;

  const toggleExpand = (invoiceId: string, arrayFieldId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [invoiceId]: prev[invoiceId] === arrayFieldId ? null : arrayFieldId,
    }));
  };

  return (
    <div className="invoice-table-container">
      <h3>Extracted Invoices</h3>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>File</th>
            <th>Status</th>
            {scalarFields.map((f) => (
              <th key={f.id}>{f.label}</th>
            ))}
            {arrayFields.map((f) => (
              <th key={f.id}>{f.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {completedOrError.map((inv) => (
            <>
              <tr key={inv.id} className={`status-${inv.status}`}>
                <td className="file-name">{inv.fileName}</td>
                <td>
                  <span className={`status-badge ${inv.status}`}>{inv.status}</span>
                </td>
                {scalarFields.map((f) => (
                  <td key={f.id}>
                    {inv.status === 'error' ? '—' : (inv.scalarData[f.id] ?? '—')}
                  </td>
                ))}
                {arrayFields.map((f) => {
                  const count = inv.arrayData[f.id]?.length ?? 0;
                  return (
                    <td key={f.id}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleExpand(inv.id, f.id)}
                        disabled={inv.status === 'error' || count === 0}
                      >
                        {count} items {expandedRows[inv.id] === f.id ? '▲' : '▼'}
                      </button>
                    </td>
                  );
                })}
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => onRemove(inv.id)}>
                    Remove
                  </button>
                </td>
              </tr>
              {/* Expanded sub-table */}
              {expandedRows[inv.id] && inv.status === 'completed' && (
                <tr key={`${inv.id}-expand`} className="expanded-row">
                  <td colSpan={scalarFields.length + arrayFields.length + 3}>
                    {(() => {
                      const af = arrayFields.find((f) => f.id === expandedRows[inv.id]);
                      if (!af) return null;
                      const rows = inv.arrayData[af.id] || [];
                      return (
                        <div className="sub-table-container">
                          <h4>{af.label}</h4>
                          <table className="sub-table">
                            <thead>
                              <tr>
                                {af.subFields.map((sf) => (
                                  <th key={sf.id}>{sf.label}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, ri) => (
                                <tr key={ri}>
                                  {af.subFields.map((sf) => (
                                    <td key={sf.id}>{row[sf.id] ?? '—'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              )}
              {/* Error message */}
              {inv.status === 'error' && inv.errorMessage && (
                <tr key={`${inv.id}-error`} className="error-row">
                  <td colSpan={scalarFields.length + arrayFields.length + 3}>
                    <div className="error-message">{inv.errorMessage}</div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
