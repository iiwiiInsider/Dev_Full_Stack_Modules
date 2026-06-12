# Offer To Purchase (OTP) Creator

A lightweight, client‑side web tool that lets a user input property sale details and instantly generate a draft Offer To Purchase as a downloadable PDF or on‑screen HTML preview. Draft is intended for preliminary negotiation only (NOT legal advice).

## Features

- Structured form sections: Property, Parties, Price & Funding, Dates, Items, Contingencies, Additional Terms, Signatures.
- Dynamic Contingencies list (add/remove with type, timeframe, notes).
- Save draft to / load draft from browser localStorage.
- Generate PDF (plain text layout for reliability) via jsPDF.
- Currency formatted in South African Rand (ZAR).
- HTML preview in a modal dialog, with print option.
- Responsive, dark UI using modern CSS (no external framework needed).
- Accessible form labels and keyboard support (native elements, focus outlines).

## Getting Started

1. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).
2. Fill out required fields (marked with *).
3. Add any contingencies.
4. Click "Preview" to review, or "Generate PDF" to download the draft.
5. Use "Save Draft" / "Load Draft" to persist form data locally.

No build step or server required; everything runs client‑side.

## File Overview

- `index.html` – Main page and form markup.
- `style.css` – Styling (dark theme, responsive grid).
- `template.js` – Functions to transform form data into HTML & plain text representations.
- `script.js` – UI behavior: event handlers, PDF generation, draft storage, contingency management.
- `README.md` – This documentation.

## Extending

- Add validation: Implement custom checks before PDF generation.
- Add e‑signature: Integrate a signature pad library (e.g., perfect‑freehand + canvas) and embed images in PDF.
- Multi-page legal boilerplate: Append standardized jurisdiction clauses in `offerHtml` / `offerPlainText`.
- Server persistence: POST JSON to a backend to store & version offers (ensure security & privacy compliance).

## Disclaimer

This tool does not constitute legal advice and produces a draft only. Users should consult a licensed real estate professional or attorney for binding contracts.
