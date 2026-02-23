import { useState } from 'react';
import type { FieldConfig, ScalarFieldConfig, ArrayFieldConfig, SubFieldConfig } from '../types';

interface FieldConfigEditorProps {
  fieldConfigs: FieldConfig[];
  onSave: (configs: FieldConfig[]) => void;
}

export function FieldConfigEditor({ fieldConfigs, onSave }: FieldConfigEditorProps) {
  const [configs, setConfigs] = useState<FieldConfig[]>(fieldConfigs);
  const [isOpen, setIsOpen] = useState(false);

  const addScalarField = () => {
    const id = `field_${Date.now()}`;
    const newField: ScalarFieldConfig = {
      id,
      label: '',
      type: 'scalar',
      dataType: 'string',
    };
    setConfigs([...configs, newField]);
  };

  const addArrayField = () => {
    const id = `array_${Date.now()}`;
    const newField: ArrayFieldConfig = {
      id,
      label: '',
      type: 'array',
      subFields: [{ id: 'col_1', label: '', dataType: 'string' }],
    };
    setConfigs([...configs, newField]);
  };

  const updateField = (index: number, updates: Partial<FieldConfig>) => {
    const updated = [...configs];
    updated[index] = { ...updated[index], ...updates } as FieldConfig;
    setConfigs(updated);
  };

  const removeField = (index: number) => {
    setConfigs(configs.filter((_, i) => i !== index));
  };

  const addSubField = (fieldIndex: number) => {
    const field = configs[fieldIndex] as ArrayFieldConfig;
    const subId = `sub_${Date.now()}`;
    const updated = [...configs];
    updated[fieldIndex] = {
      ...field,
      subFields: [...field.subFields, { id: subId, label: '', dataType: 'string' }],
    };
    setConfigs(updated);
  };

  const updateSubField = (
    fieldIndex: number,
    subIndex: number,
    updates: Partial<SubFieldConfig>
  ) => {
    const field = configs[fieldIndex] as ArrayFieldConfig;
    const subFields = [...field.subFields];
    subFields[subIndex] = { ...subFields[subIndex], ...updates };
    const updated = [...configs];
    updated[fieldIndex] = { ...field, subFields };
    setConfigs(updated);
  };

  const removeSubField = (fieldIndex: number, subIndex: number) => {
    const field = configs[fieldIndex] as ArrayFieldConfig;
    const updated = [...configs];
    updated[fieldIndex] = {
      ...field,
      subFields: field.subFields.filter((_, i) => i !== subIndex),
    };
    setConfigs(updated);
  };

  const handleSave = () => {
    // Auto-generate IDs from labels if empty
    const finalized = configs.map((c) => ({
      ...c,
      id: c.id.startsWith('field_') || c.id.startsWith('array_')
        ? c.label.toLowerCase().replace(/\s+/g, '_') || c.id
        : c.id,
      ...(c.type === 'array'
        ? {
            subFields: (c as ArrayFieldConfig).subFields.map((s) => ({
              ...s,
              id: s.id.startsWith('sub_')
                ? s.label.toLowerCase().replace(/\s+/g, '_') || s.id
                : s.id,
            })),
          }
        : {}),
    })) as FieldConfig[];
    onSave(finalized);
    setIsOpen(false);
  };

  return (
    <div className="field-config-editor">
      <button className="btn btn-secondary" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Hide' : 'Configure'} Extraction Fields
      </button>

      {isOpen && (
        <div className="config-panel">
          <h3>Extraction Fields</h3>
          {configs.map((field, index) => (
            <div key={index} className={`config-field ${field.type}`}>
              <div className="field-header">
                <span className="field-type-badge">{field.type}</span>
                <input
                  type="text"
                  placeholder="Field ID"
                  value={field.id}
                  onChange={(e) => updateField(index, { id: e.target.value })}
                  className="input-sm"
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  className="input-sm"
                />
                {field.type === 'scalar' && (
                  <select
                    value={field.dataType}
                    onChange={(e) =>
                      updateField(index, {
                        dataType: e.target.value as 'string' | 'number' | 'date',
                      })
                    }
                    className="select-sm"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                )}
                <input
                  type="text"
                  placeholder="Description (helps the model)"
                  value={field.description || ''}
                  onChange={(e) => updateField(index, { description: e.target.value })}
                  className="input-md"
                />
                <button className="btn btn-danger btn-sm" onClick={() => removeField(index)}>
                  &times;
                </button>
              </div>

              {field.type === 'array' && (
                <div className="sub-fields">
                  <div className="sub-fields-label">Sub-fields:</div>
                  {(field as ArrayFieldConfig).subFields.map((sub, si) => (
                    <div key={si} className="sub-field-row">
                      <input
                        type="text"
                        placeholder="Sub-field ID"
                        value={sub.id}
                        onChange={(e) => updateSubField(index, si, { id: e.target.value })}
                        className="input-sm"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={sub.label}
                        onChange={(e) => updateSubField(index, si, { label: e.target.value })}
                        className="input-sm"
                      />
                      <select
                        value={sub.dataType}
                        onChange={(e) =>
                          updateSubField(index, si, {
                            dataType: e.target.value as 'string' | 'number' | 'date',
                          })
                        }
                        className="select-sm"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeSubField(index, si)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => addSubField(index)}
                  >
                    + Sub-field
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="config-actions">
            <button className="btn btn-ghost" onClick={addScalarField}>
              + Scalar Field
            </button>
            <button className="btn btn-ghost" onClick={addArrayField}>
              + Array Field
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
