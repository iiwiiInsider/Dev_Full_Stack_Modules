# Mandate Creator

Generate professional property sale mandate PDFs from a clean web form.

## Features
- Modern responsive form UI (vanilla HTML/CSS/JS)
- REST endpoint to generate PDF (`POST /api/mandate`)
- Nicely formatted PDF: branding header, sections, grids, signature boxes
- Currency + date formatting helpers
- Sample generator script for quick testing

## Quick Start

1. Install dependencies:
```bash
npm install
```
2. Start server:
```bash
npm start
```
3. Open in browser:
```
http://localhost:3000
```
4. Fill in required fields and click "Generate PDF Mandate". A PDF will download.

## API
`POST /api/mandate`
Body (JSON): nested objects for `property`, `seller`, `agent`, `agency`, `terms`.
Required minimal fields:
```json
{
  "property": { "address": "...", "type": "..." },
  "seller": { "name": "..." },
  "agent": { "name": "..." },
  "agency": { "name": "..." }
}
```
Returns: PDF (application/pdf) as attachment.

## Testing PDF Generation Without UI
```bash
npm run sample
```
This writes a sample PDF to the project directory (test-output-*).

## Customization
- Edit styling: `public/index.html`
- Adjust PDF layout / add clauses: `src/pdf/generateMandate.js`
- Add branding (logo): Extend `header()` to embed image using `doc.image()`.

## Notes / Disclaimers
This template is not legal advice. Jurisdiction-specific mandatory clauses may be required. Have a licensed professional review before use in production.

## License
MIT
