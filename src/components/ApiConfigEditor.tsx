import { useState } from 'react';
import type { ApiConfig } from '../types';

interface ApiConfigEditorProps {
  apiConfig: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

export function ApiConfigEditor({ apiConfig, onSave }: ApiConfigEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ApiConfig>(apiConfig);

  const handleSave = () => {
    onSave(config);
    setIsOpen(false);
  };

  return (
    <div className="api-config-editor">
      <button className="btn btn-secondary" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Hide' : 'Configure'} LLM Settings
      </button>

      {isOpen && (
        <div className="config-panel">
          <h3>LLM Settings</h3>
          <div className="api-config-fields">
            <label className="api-config-field">
              <span className="api-config-label">Base URL</span>
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="e.g. http://10.0.0.144:1234/v1"
                className="input-md"
              />
            </label>
            <label className="api-config-field">
              <span className="api-config-label">Model</span>
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="e.g. qwen/qwen3-vl-8b"
                className="input-md"
              />
            </label>
            <label className="api-config-field">
              <span className="api-config-label">API Key</span>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value || undefined })}
                placeholder="Optional — for OpenAI, Anthropic, etc."
                className="input-md"
              />
            </label>
          </div>
          <div className="config-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
