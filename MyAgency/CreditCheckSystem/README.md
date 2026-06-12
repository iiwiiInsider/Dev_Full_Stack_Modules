# Tenant Credit Check (Client‑Only)

A simple, client‑side web app to collect applicant info, compute a screening score (0‑100), and generate a printable/downloadable report for landlords.

Important: This is NOT a consumer credit report and is not a replacement for background checks or credit bureau pulls. It’s a supplemental screening tool based on applicant‑provided data.

## Quick start

1. Open `index.html` in a browser.
2. Fill out the form and click “Generate score & report”.
3. Click “Download / Print PDF” to save the report.

No server or internet connection required. All data stays in the browser.

### Optional: Run a local server

If you prefer to serve the files locally (useful for testing), a tiny Node server is included:

```bash
node server.js
```

Then open http://localhost:3000

### Currency

All monetary values are displayed in South African Rand (ZAR) using locale `en-ZA`.

## Scoring overview

Maximum 100 points across components:

- Income‑to‑Rent ratio (0‑35): 4× or more ≈ 35 pts, 3× ≈ 28 pts, below 1.5× ≈ 0 pt
- Debt‑to‑Income incl. rent (0‑20): ≤25% ≈ 20 pts, 33% ≈ 16, 40% ≈ 12, 50% ≈ 6, above ≈ 0
- Employment stability (0‑15): 24+ mo = 15, 12 mo = 12, 6 mo = 8, student = 6, unemployed = 0
- Housing history (0‑10): 36+ mo = 10, 24 = 8, 12 = 6, 6 = 4, else 2
- On‑time payments (0‑10): 0 late = 10, 1 = 7, 2 = 4, 3+ = 0
- Negative events (−15 max): eviction −10, bankruptcy −5
- References (0‑10): 0 = 0, 1 = 3, 2 = 6, 3+ = 10

Grades:

- A (≥85) Strong
- B (≥70) Good
- C (≥55) Fair
- D (≥40) Risky
- F (<40) High Risk

## Legal/Compliance

- This tool is for informational screening only and is not a consumer report under the Fair Credit Reporting Act (FCRA).
- Do not use as the sole factor for housing decisions; verify income/employment, run background/credit checks where permitted, and follow fair housing and privacy laws.
- Obtain applicant consent before processing data.

## Notes

- All logic is in `app.js`. Styling in `styles.css`. No external dependencies.
- You can customize scoring thresholds and weights in `computeScore()`.