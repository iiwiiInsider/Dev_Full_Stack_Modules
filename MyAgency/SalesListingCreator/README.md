# Listing Creator

Generate a polished single-page (or multi-page if content overflows) PDF brochure for a property listing. Intended for sharing with prospective buyers.

## Features
- Input property details, pricing, sizes, and description
- Add dynamic feature tags (key selling points)
- Neighborhood / area overview section
- Agent & agency contact block
- Custom disclaimer text
- Image support: hero image + gallery (up to 12) automatically resized & compressed
- Improved whitespace and layout spacing
- Clean, brand-colored layout using pdfkit

## Tech Stack
- Node.js + Express backend
- pdfkit for PDF generation
- Vanilla HTML/CSS/JS frontend (served statically)

## Scripts
- `npm start` – start server on port 3001
- `npm run dev` – start with nodemon
- `npm run sample` – generate a sample listing PDF in `/test`

## API
POST /api/listing
Request JSON structure example:
```json
{
  "property": {
    "address": "123 Main St, City",
    "type": "House",
    "bedrooms": 3,
    "bathrooms": 2,
    "landSize": 750,
    "buildingSize": 180,
    "askingPrice": 350000,
    "yearBuilt": 2001,
    "parking": "2 Car Garage",
    "description": "Charming updated home..."
  },
  "features": ["Pool", "Solar", "Home Office"],
  "neighborhood": {
    "schools": "Primary School (1km)...",
    "transport": "Bus line 5 mins...",
    "amenities": "Shops, cafes...",
    "parks": "Central Park nearby",
    "description": "Family-friendly area..."
  },
  "agent": { "name": "Jane Agent", "license": "LIC-123", "email": "jane@example.com", "phone": "+1 555 123 4567" },
  "agency": { "name": "BlueSky Realty", "registration": "REG-556677", "address": "45 Commerce Rd", "tagline": "Elevating Property Transactions" },
  "images": { "hero": "data:image/jpeg;base64,...", "gallery": ["data:image/jpeg;base64,..."] },
  "disclaimer": "Information deemed reliable but not guaranteed."
}
```

Response: application/pdf (download)

## Development
1. Install deps: `npm install`
2. Run dev server: `npm run dev`
3. Visit: http://localhost:3001/

## Sample Generation
`npm run sample` creates a `test-output-listing-<timestamp>.pdf` inside `/test`.

## Notes / Future Ideas
- Image uploads (hero photo & gallery)
- Multi-language support
- Dark theme PDF option
- QR code linking to online listing
