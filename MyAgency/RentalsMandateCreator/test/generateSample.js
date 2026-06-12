import { generateRentalMandatePdf } from '../src/pdf/generateRentalMandate.js';
import fs from 'fs';

const sample = {
  property: {
    address:'12 Beach Rd, Cape Town', type:'Apartment', bedrooms:2, bathrooms:1, furnished:true,
    parking:'1 Secure Bay', buildingSize:75, description:'Sunny, modern apartment with sea views, close to shops and MyCiTi bus.'
  },
  landlord: { name:'Acme Properties Pty Ltd', idNumber:'', email:'landlord@acme.co.za', phone:'+27 82 555 0000', address:'1 High St, Cape Town' },
  agent: { name:'Thandi Letting', license:'EAAB-12345', email:'thandi@blueskyrealty.co.za', phone:'+27 21 555 1234' },
  agency: { name:'BlueSky Realty', registration:'REG-556677', address:'45 Commerce Rd, Cape Town', tagline:'Elevating Rental Experiences' },
  rental: { monthlyRent: 18500, deposit: 27750, leaseTermMonths:12, availableFrom:'2025-11-01', utilitiesIncluded:'Water; fibre-ready (tenant account). Electricity prepaid.', petsAllowed:'By arrangement', maxOccupants:3 },
  terms: { startDate:'2025-10-09', endDate:'2026-01-09', exclusivity:'Exclusive', commissionRate:8, minimumCommission:3500, placementFee:4500, managementFeeRate:10, marketingPlan:'Online portals, professional photos, tenant screening and credit checks.', specialConditions:'No smoking inside the unit.' }
};

const { stream, filename } = generateRentalMandatePdf(sample);
const outPath = `./test-output-${filename}`;
stream.pipe(fs.createWriteStream(outPath));
stream.on('end', () => console.log('Generated', outPath));
