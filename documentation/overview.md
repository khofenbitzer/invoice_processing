# Invoice Processing Application Overview

## Purpose

The application streamlines extraction of structured data from uploaded invoice PDFs by combining a configurable field schema with AI-powered vision models. Users can tailor extraction targets, process documents in bulk, review parsed results, and export clean datasets without leaving the browser.

## Core Capabilities

- **Configurable field definitions** – Business users tailor scalar and tabular invoice fields through an in-app editor sourced from [`src/components/FieldConfigEditor.tsx`](src/components/FieldConfigEditor.tsx).
- **PDF ingestion with duplicate detection** – Upload interactions via [`src/components/PdfUploader.tsx`](src/components/PdfUploader.tsx) hash file contents to prevent reprocessing identical invoices.
- **AI extraction pipeline** – [`src/hooks/usePdfProcessor.ts`](src/hooks/usePdfProcessor.ts) orchestrates PDF rendering, prompt creation, LLM calls, and response parsing.
- **Stateful invoice tracking** – A reducer-powered store in [`src/hooks/useInvoiceStore.ts`](src/hooks/useInvoiceStore.ts) persists field configs, API settings, and per-invoice statuses to `localStorage`.
- **Review and export** – [`src/components/InvoiceTable.tsx`](src/components/InvoiceTable.tsx) surfaces parsed results, while [`src/components/ExportControls.tsx`](src/components/ExportControls.tsx) supports CSV/XLSX exports.

## End-to-End Flow

1. **Configure fields** – Users adjust scalar and line-item targets plus AI parameters (model, temperature, max tokens).
2. **Upload PDFs** – Files are converted into page images (via [`src/services/pdfService.ts`](src/services/pdfService.ts)) and hashed for idempotency.
3. **Prompt & invoke model** – [`src/services/promptBuilder.ts`](src/services/promptBuilder.ts) builds JSON instructions that, along with page images, are sent to the configured vision endpoint through [`src/services/visionApiService.ts`](src/services/visionApiService.ts).
4. **Parse & store** – [`src/utils/parseModelResponse.ts`](src/utils/parseModelResponse.ts) validates AI output, mapping it back into scalar and tabular datasets saved on each invoice record.
5. **Review & export** – Operators inspect results, resolve any errors, and export aggregated data for downstream accounting or ERP ingestion.

## Technology Stack

- **Frontend:** React 18 + TypeScript, styled via [`src/App.css`](src/App.css) and related CSS modules.
- **Build tooling:** Vite for dev server/HMR and optimized production builds.
- **Client storage:** Browser `localStorage` for persisting configuration and processing history.
- **AI integration:** Pluggable HTTP interface expecting an OpenAI-compatible `/chat/completions` endpoint, enabling rapid swaps between providers.

## Operational Considerations

- Store API credentials in environment variables or secure secret managers; the repo intentionally omits concrete keys.
- Enforce per-tenant rate limiting at the configured AI service to avoid throttling during multi-invoice batches.
- Schedule periodic exports or integrations to make sure processed data lands in source-of-truth systems.
