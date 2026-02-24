import { useInvoiceStore } from './hooks/useInvoiceStore';
import { usePdfProcessor } from './hooks/usePdfProcessor';
import { PdfUploader } from './components/PdfUploader';
import { FieldConfigEditor } from './components/FieldConfigEditor';
import { ApiConfigEditor } from './components/ApiConfigEditor';
import { ProcessingStatus } from './components/ProcessingStatus';
import { InvoiceTable } from './components/InvoiceTable';
import { ExportControls } from './components/ExportControls';
import './App.css';

function App() {
  const { state, dispatch } = useInvoiceStore();
  const { processFile } = usePdfProcessor(state.fieldConfigs, state.apiConfig, dispatch);

  const isProcessing = state.invoices.some((inv) => inv.status === 'processing');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Invoice Processor</h1>
        <p className="app-subtitle">
          Upload invoice PDFs, extract structured data with AI, and export to spreadsheets
        </p>
      </header>

      <main className="app-main">
        <section className="config-section">
          <div className="config-buttons">
            <FieldConfigEditor
              fieldConfigs={state.fieldConfigs}
              onSave={(configs) => dispatch({ type: 'SET_FIELD_CONFIGS', payload: configs })}
            />
            <ApiConfigEditor
              apiConfig={state.apiConfig}
              onSave={(config) => dispatch({ type: 'SET_API_CONFIG', payload: config })}
            />
          </div>
        </section>

        <section className="upload-section">
          <PdfUploader onFileSelected={processFile} isProcessing={isProcessing} />
        </section>

        <ProcessingStatus invoices={state.invoices} />

        <section className="results-section">
          <InvoiceTable
            invoices={state.invoices}
            fieldConfigs={state.fieldConfigs}
            onRemove={(id) => dispatch({ type: 'REMOVE_INVOICE', payload: id })}
            onClearAll={() => dispatch({ type: 'CLEAR_ALL_INVOICES' })}
          />
        </section>

        <section className="export-section">
          <ExportControls invoices={state.invoices} fieldConfigs={state.fieldConfigs} />
        </section>
      </main>
    </div>
  );
}

export default App;
