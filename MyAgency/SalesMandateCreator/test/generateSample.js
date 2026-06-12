import { generateMandatePdf } from '../src/pdf/generateMandate.js';
import fs from 'fs';

const sample = {
  property: { address:'123 Main St, Springfield', type:'House', bedrooms:3, bathrooms:2, landSize:750, buildingSize:180, askingPrice:350000, description:'Charming family home with updated kitchen, spacious garden, and close proximity to schools and parks.' },
  seller: { name:'John Doe', idNumber:'A1234567', email:'john@example.com', phone:'+1 555 123 4567', address:'123 Main St, Springfield' },
  agent: { name:'Jane Agent', license:'LIC-998877', email:'jane@agency.com', phone:'+1 555 987 6543' },
  agency: { name:'BlueSky Realty', registration:'REG-556677', address:'45 Commerce Rd, Springfield', tagline:'Elevating Property Transactions' },
  terms: { startDate:'2025-10-08', endDate:'2026-01-08', exclusivity:'Exclusive', commissionRate:5, minimumCommission:5000, marketingPlan:'Online listings, professional photography, targeted social media ads, weekend open houses.', specialConditions:'Seller to provide compliance certificates before transfer.' }
};

const { stream, filename } = generateMandatePdf(sample);
const outPath = `./test-output-${filename}`;
stream.pipe(fs.createWriteStream(outPath));
stream.on('end', () => console.log('Generated', outPath));
