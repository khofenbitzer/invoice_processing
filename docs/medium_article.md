# Secure Invoice Processing with Local Vision LLMs: From PDFs to Excel in Minutes

Invoices are “structured” only in the human sense. In practice, they arrive as PDFs with inconsistent layouts, nested tables, stamps, logos, and formatting quirks that make traditional automation brittle.

This article walks through a local-first invoice extraction app that turns unstructured invoice PDFs into clean, analyzable spreadsheet data—powered by a **local vision-capable LLM**.

---

## The use case: unstructured invoices → structured spreadsheets

AP/finance teams often need the same outcome:

- Upload invoices (one or many)
- Extract key header fields (vendor, invoice number, dates, totals, currency, etc.)
- Extract repeating “array” data (line items)
- Review results quickly
- Export to **Excel or CSV**

The challenge is that invoices vary wildly. Templates change. Vendors embed tables, addresses, and totals in different regions. PDFs can be text-based, image-based, rotated, or multi-page.

A **vision LLM** can “see” the invoice page like a human would and produce structured JSON consistently—without maintaining vendor-specific parsers.

![Extracted invoices table with expandable line items](https://github.com/khofenbitzer/invoice_processing/blob/main/src/assets/extracted_invoice_information.png?raw=true)

---

## Why a vision LLM (and why local)

### Application flow (high level)

1. User drags & drops one or more invoice PDFs.
2. Each PDF is converted into page images (PNG).
3. The PNGs are sent to a **local vision LLM**.
4. The model returns structured data (header fields + optional arrays like line items).
5. The app renders a review table and enables export to Excel/CSV.

This “PDF → PNG → Vision LLM” pipeline is intentionally simple and robust.

### Advantage #1: Better accuracy than PDF → OCR → LLM

A common baseline approach is:

> PDF → OCR → plain text → LLM

That pipeline introduces multiple failure modes:

- OCR drops table structure (columns/rows get flattened)
- OCR struggles with small fonts, noisy scans, stamps, or skew
- Important cues are visual (where a number appears, which row it belongs to, header alignment)

With **vision**, the model can infer structure from the page layout (tables, headers, column boundaries, grouping), often yielding **more accurate line items and totals** than “OCR then reason over text”.

### Advantage #2: Local inference = data stays inside your network

Invoices contain sensitive information (vendors, bank details, amounts, addresses, internal references). Running inference locally means:

- No invoice content leaves the company
- Fewer compliance concerns (data residency, retention, vendor audits)
- Safer experimentation with prompts and extraction schemas

---

## What the app does internally (and the features that matter)

### 1) Configurable extraction schema (scalars + arrays)

Different workflows require different data. The app treats extraction as a schema problem:

- **Scalar fields**: single values like `vendor_name`, `invoice_number`, `invoice_date`, `total_amount`
- **Array fields**: repeating rows like `line_items[]` with sub-fields such as `description`, `quantity`, `unit_price`, `amount`

This makes the extractor adaptable: you can add, remove, or rename fields without rewriting code.

![Configurable scalar and array (line item) field extraction](https://github.com/khofenbitzer/invoice_processing/blob/main/src/assets/filed_config.png?raw=true)

---

### 2) Configurable LLM connection (example: LM Studio + Qwen3-VL-8B)

The app is designed to point at a configurable, OpenAI-compatible endpoint. In the example setup:

- **LM Studio** hosts the model locally
- Model: **`qwen/qwen3-vl-8b`** (vision)
- Quantization: **4-bit or 8-bit** depending on the machine and desired speed/quality tradeoff

You configure:

- Base URL (local endpoint)
- Model name
- Optional API key (if your provider requires it)

![LLM connection settings (base URL, model, API key)](https://github.com/khofenbitzer/invoice_processing/blob/main/src/assets/LLM%20Config.png?raw=true)

---

### 3) Drag-and-drop PDFs (single or batch)

User experience matters for operational tools. The workflow is intentionally frictionless:

- Drag one PDF for a quick test
- Drag many PDFs to process a batch
- The app routes each document through the same pipeline and assembles results into a unified table

You can immediately scan status and extracted fields, and expand each invoice to inspect line items.

![Batch processing and table review experience](https://github.com/khofenbitzer/invoice_processing/blob/main/src/assets/extracted_invoice_information.png?raw=true)

---

### 4) Export to Excel or CSV (with a sensible workbook structure)

Exports are useful only if they match how teams analyze data.

This app exports:

- **Excel (.xlsx)**
  - An overview sheet containing the “main invoice” scalar fields (one row per invoice)
  - Additional sheets for each extracted array (e.g., a **Line Items** sheet), linked back to the invoice via an identifier
- **CSV**
  - A flat representation suitable for quick loading into other tools

![Export controls (Excel/CSV)](https://github.com/khofenbitzer/invoice_processing/blob/main/src/assets/excel_export.png?raw=true)

And here’s what the resulting spreadsheet data looks like in practice:

![Extracted invoice data in a spreadsheet](https://github.com/khofenbitzer/invoice_processing/blob/main/src/assets/excel_data_extract.png?raw=true)

---

## Implementation notes (what makes the pipeline reliable)

- **PDF to PNG** keeps the model input consistent. Regardless of whether the PDF is text-based, scanned, rotated, or mixed, the model receives images.
- **Schema-driven prompts** reduce ambiguity. The model is guided to return exactly the fields you configured.
- **Review-first UI** makes errors visible quickly—critical for finance workflows.
- **Local inference** offers strong privacy controls while still delivering modern extraction quality.

---

## Closing thoughts

Invoice automation is a perfect fit for vision-capable local LLMs: documents are visually structured, formats vary, and the data is sensitive.

By converting PDFs to images and using a local vision model, you get a practical blend of **accuracy**, **flexibility**, and **security**—and a workflow that ends where finance teams need it most: a clean Excel workbook.
