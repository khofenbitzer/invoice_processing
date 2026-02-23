# Architecture

## Component Diagram

```mermaid
flowchart TD
    subgraph Browser
        UI[React UI Components]
        Store[useInvoiceStore Reducer]
        Processor[usePdfProcessor Hook]
    end

    subgraph Services
        PdfSvc[pdfService<br/>pdfToImages() + computeFileHash()]
        PromptSvc[promptBuilder<br/>buildExtractionPrompt()]
        VisionSvc[visionApiService<br/>extractInvoiceData()]
        ParserSvc[parseModelResponse]
    end

    subgraph External
        VisionAPI[(Vision LLM /chat/completions)]
    end

    UI -->|dispatch actions| Store
    UI -->|upload File| Processor
    Processor -->|arrayBuffer & hash| PdfSvc
    Processor -->|page images| PdfSvc
    Processor -->|field configs| PromptSvc
    Processor -->|prompt + images| VisionSvc
    VisionSvc -->|HTTP JSON| VisionAPI
    VisionAPI -->|LLM response| VisionSvc
    Processor -->|raw JSON| ParserSvc
    ParserSvc -->|scalar + array data| Processor
    Processor -->|COMPLETE_PROCESSING| Store
    Store -->|state snapshots| UI
```

## Data Flow Narrative

1. **User Interaction** – React components (e.g., [`src/components/PdfUploader.tsx`](src/components/PdfUploader.tsx)) trigger dispatches to [`src/hooks/useInvoiceStore.ts`](src/hooks/useInvoiceStore.ts) to track processing state.
2. **File Preparation** – [`src/services/pdfService.ts`](src/services/pdfService.ts) converts PDFs to base64 page images and computes a SHA-256 hash for deduplication.
3. **Prompt Construction** – [`src/services/promptBuilder.ts`](src/services/promptBuilder.ts) merges field configs with instructions ensuring JSON-only responses.
4. **Vision Model Invocation** – [`src/services/visionApiService.ts`](src/services/visionApiService.ts) posts the prompt and images to an OpenAI-compatible `/chat/completions` endpoint defined by `ApiConfig`.
5. **Response Parsing** – [`src/utils/parseModelResponse.ts`](src/utils/parseModelResponse.ts) validates the LLM response, mapping results into scalar and line-item datasets.
6. **State Persistence** – The reducer writes updated invoices and configs to `localStorage`, allowing refresh-safe history and export functionality through [`src/components/ExportControls.tsx`](src/components/ExportControls.tsx).

## Deployment Considerations

- The project builds with Vite into static assets deployable on any CDN or static host.
- API credentials and base URLs are supplied at runtime (e.g., via environment-specific config injection) to avoid bundling secrets.
- Browser-based processing means sensitive PDFs never leave the user’s machine except for the intentional call to the vision API endpoint.
