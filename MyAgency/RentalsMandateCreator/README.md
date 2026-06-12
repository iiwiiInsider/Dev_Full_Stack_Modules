# Rentals Mandate Creator

Generate professional PDF mandates for property rentals. This mirrors the Sales Mandate Creator but with rental-specific fields and terms.

## Features
- Web form to capture property, landlord, agency/agent, rental and mandate details
- PDF output with branding, sections, and signature boxes
- REST endpoint: POST /api/rental-mandate
- Example script to generate a sample PDF offline

## Getting started

1. Install deps
```bash
npm install
```

2. Start the web app
```bash
npm run start
```
Open http://localhost:3001 and submit the form to download a PDF.

3. Generate a sample via script
```bash
npm run sample
```
Check the created test-output-*.pdf file in the project root.

## Data contract

POST /api/rental-mandate expects JSON like:

```
{
  property: { address, type, bedrooms?, bathrooms?, furnished?, parking?, buildingSize?, description? },
  landlord: { name, idNumber?, email?, phone?, address? },
  agent: { name, license?, email?, phone? },
  agency: { name, registration?, address?, tagline? },
  rental: { monthlyRent, deposit?, leaseTermMonths?, availableFrom?, utilitiesIncluded?, petsAllowed?, maxOccupants? },
  terms: { startDate?, endDate?, exclusivity?, commissionRate?, minimumCommission?, placementFee?, managementFeeRate?, marketingPlan?, specialConditions? }
}
```

Required fields: property.address, property.type, landlord.name, agent.name, agency.name, rental.monthlyRent
