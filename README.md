# Invoice Processing Workbench

Modern React + Vite application for extracting structured data from invoice PDFs using local or hosted multimodal LLMs. When running local models, no invoice data leaves your company network or devices.

**Privacy & Local Storage**
- All configuration and field schemas are saved locally (browser `localStorage`).
- When using a local LLM runtime (LM Studio or Ollama), no data is sent outside the computer running the app.

Tested locally with `qwen/qwen3-vl-8b` in 4-bit and 8-bit quantization on an Apple Silicon M4 Max. Apple Silicon M1–M4 systems with at least 16 GB RAM should be able to run the model.

---

## 1. Install Prerequisites

### Local LLM Runtime

- **LM Studio** (recommended for desktop GPU users)
  - Download from [https://lmstudio.ai](https://lmstudio.ai) and install.
  - After launch, open the *Models* catalog and download a vision-capable model such as `qwen/qwen3-vl-8b` (higher accuracy) or `qwen/qwen3-vl-3b` (lighter footprint).
  - Start an inference server from the LM Studio UI. Later you will copy the Base URL from the system tray menu → **Copy LLM Base URL**.

- **Ollama** (CLI-first runtime)
  - Install from [https://ollama.com](https://ollama.com).
  - Pull a model that supports image inputs, for example:
    ```bash
    ollama pull qwen/qwen3-vl-8b
    # or
    ollama pull qwen/qwen3-vl-3b
    ```
  - Start the model with `ollama run qwen/qwen3-vl-8b` when you plan to process invoices.

> **Optional Cloud API** – If you have an OpenAI-compatible subscription, you can use `https://api.openai.com/v1` with a valid API key instead of (or in addition to) local runtimes.

### Node.js Tooling

Ensure you have Node.js 18+ with npm installed. Verify via `node -v` and `npm -v`.

---

## 2. Install the Application

```bash
git clone <repo-url> invoice_processing
cd invoice_processing
npm install
```

This pulls all React dependencies plus PDF/AI helper libraries defined in [`package.json`](package.json).

---

## 3. Run the Application

```bash
npm run dev
```

Vite prints a local dev URL (default `http://localhost:5173`). Open it in your browser to access the UI.

For production builds use `npm run build && npm run preview`.

---

## 4. Docker Deployment

Build and run the production container with the provided script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Customize the image name, tag, or port via environment variables:

```bash
IMAGE_NAME=invoice-processing IMAGE_TAG=prod PORT=8080 ./scripts/deploy.sh
```

The container serves the static build on `http://localhost:8080` by default.

**LM Studio base URL in Docker**
- If LM Studio runs on the same host machine, keep using the host's LAN IP (for example `http://10.0.0.144:1234/v1`) from your browser, because the app runs in your browser and calls LM Studio directly.
- If you ever run the UI inside a containerized browser, use `http://host.docker.internal:1234/v1` (macOS/Windows) to reach the host LM Studio.

---

## 5. User Guide

### LLM Settings

Navigate to the **LLM / API Settings** panel (within the Field Config editor sidebar) to configure:

| Setting | Description |
| --- | --- |
| **Base URL** | - *Local LM Studio*: right-click the system tray icon → **Copy LLM Base URL**, paste into the app.<br/>- *Ollama*: use `http://localhost:11434/v1` when running the OpenAI-compatible server.<br/>- *OpenAI Cloud*: `https://api.openai.com/v1`. |
| **API Key** | Optional for local models (LM Studio and Ollama ignore it). Required for OpenAI or any hosted service implementing API key auth. |
| **Model** | Enter the exact model slug you downloaded or subscribed to (e.g., `qwen/qwen3-vl-8b`). |
| **Max Tokens / Temperature** | Tune generation size and determinism for your extraction use case. |

> **Tip:** When targeting local inference, leave the API Key field blank. The app still dispatches the same JSON payloads but relies solely on the local server.

### Setting Up Extraction Fields

1. Open **Field Configurations** in the left column.
2. Define **Scalar Fields** for single values (e.g., `invoice_number`, `vendor_name`, `due_date`). Each field supports:
   - Human-readable label.
   - Expected data type (text, number, currency, date).
   - Optional hints to guide the LLM.
3. Define **Tabular Fields** for repeating line items. Specify column names (e.g., `description`, `quantity`, `unit_price`, `tax_rate`).
4. Save the configuration. It is persisted to `localStorage` so future sessions reuse your schema.
5. Upload PDFs via **Upload Invoices**. The application:
   - Converts each PDF page to an image.
   - Builds a JSON-only extraction prompt from your field schema.
   - Sends the prompt + images to the configured LLM endpoint.
   - Parses the response back into scalar/table data for review and export (CSV/XLSX).

### Optional API Usage

- If you own an OpenAI API key:
  1. Set Base URL to `https://api.openai.com/v1`.
  2. Paste the key into the API Key field.
  3. Choose a model such as `gpt-4o-mini` or any vision-capable chat/completions model.
- For other providers (e.g., Groq, Together, Azure OpenAI) supply their OpenAI-compatible Base URL and credentials.

---

## Troubleshooting

- **Connection errors** – Verify the Base URL is reachable. For LM Studio ensure the server is running; for Ollama start the model before uploading PDFs.
- **Model not found** – Double-check the model slug in LM Studio/Ollama matches the value in the app.
- **Slow parsing** – Reduce image resolution in `pdfService` or switch to a smaller model (`qwen3-vl-3b`).

---

## Contributing

1. Fork + clone
2. Create a feature branch
3. Commit with conventional messages
4. Submit a PR

Please include screenshots demonstrating new UI behaviors where applicable.
