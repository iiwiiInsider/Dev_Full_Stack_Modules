# Rental Listing Creator

Generate a polished single or multi-page PDF brochure tailored for rental listings. Intended for sharing with prospective tenants.

## Features
- Property section (address, type, beds/baths, sizes, description)
- Rental terms section (monthly rent, deposit, lease term, availability, utilities, pets, smoking, notes)
- Feature tags (amenities/highlights)
- Agent & agency contact block
- Optional disclaimer text
- Images: hero + gallery (up to 12) resized and embedded
- Clean green-themed layout using pdfkit

## Tech Stack
- Node.js + Express backend
- pdfkit for PDF generation
- Vanilla HTML/CSS/JS frontend

## Scripts
- `npm start` – start server on port 3002
- `npm run dev` – start with nodemon
- `npm run sample` – generate a sample rental PDF in `/test`

## API
POST /api/rental
Request JSON structure example:
```json
{
  "property": {
    "address": "12 Greenway Gardens, Rosebank",
    "type": "Apartment",
    "unit": "5B",
    "bedrooms": 2,
    "bathrooms": 2,
    "buildingSize": 78,
    "parking": "1 Covered Bay",
    "description": "Modern apartment..."
  },
  "rental": {
    "monthlyRent": 14500,
    "deposit": 14500,
    "leaseTerm": 12,
    "availableFrom": "2025-11-01",
    "utilities": "Water included, electricity prepaid",
    "included": "Fridge, washing machine",
    "applicationFee": 300,
    "petsAllowed": false,
    "petsPolicy": "No pets allowed",
    "smokingPolicy": "No smoking inside the unit",
    "notes": "Applicants subject to credit checks"
  },
  "features": ["Balcony", "Fibre-Ready", "24/7 Security"],
  "agent": { "name": "Kyle", "email": "kyle@example.com", "phone": "+27 82 000 0000" },
  "agency": { "name": "MyAgency Rentals", "registration": "REG-123456", "address": "123 Business Rd", "tagline": "Exceptional Letting Experience" },
  "images": { "hero": "data:image/jpeg;base64,...", "gallery": ["data:image/jpeg;base64,..."] },
  "disclaimer": "Figures are approximate."
}
```

Response: application/pdf (download)

## Development
1. Install deps: `npm install`
2. Run dev server: `npm run dev`
3. Visit: http://localhost:3002/

## Sample Generation
`npm run sample` creates a `test-output-rental-listing-<timestamp>.pdf` inside `/test`.

## Notes / Future Ideas
- Multi-language support
- QR code to online listing page
- Optional watermark/branding image upload
