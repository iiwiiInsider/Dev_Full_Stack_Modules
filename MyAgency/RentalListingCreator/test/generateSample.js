import { generateRentalPdf } from '../src/pdf/generateRental.js';
import fs from 'fs';

const sample = {
  property: {
    address:'12 Greenway Gardens, Rosebank', type:'Apartment', unit:'Unit 5B', bedrooms:2, bathrooms:2,
    landSize:0, buildingSize:78, parking:'1 Covered Bay',
    description:'Modern apartment with open-plan living, balcony with city views, and 24/7 security. Walking distance to shops and transport.'
  },
  rental: {
    monthlyRent: 14500,
    deposit: 14500,
    leaseTerm: 12,
    availableFrom: new Date().toISOString().slice(0,10),
    utilities: 'Water included, electricity prepaid',
    included: 'Fridge, washing machine, blinds',
    applicationFee: 300,
    petsAllowed: false,
    petsPolicy: 'No pets allowed',
    smokingPolicy: 'No smoking inside the unit',
    notes: 'Applicants subject to credit and reference checks.'
  },
  features: ['Balcony with View','Fibre-Ready','24/7 Security','Access Control','Gym in Complex','On-site Laundry'],
  agent: { name:'Kyle Blackburn', email:'kyle@example.com', phone:'+27 82 000 0000' },
  agency: { name:'MyAgency Rentals', registration:'REG-123456', address:'123 Business Rd, City', tagline:'Exceptional Letting Experience' },
  images: {
    hero: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAP0lEQVR4Ae3RAQ0AAAgDoOZf2h8MB2cOmKBNmiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkm4FbgADN9NH2wAAAABJRU5ErkJggg==',
    gallery: []
  },
  disclaimer: 'Measurements and figures are approximate and subject to independent verification.'
};

const { stream, filename } = generateRentalPdf(sample);
const outPath = `./test-output-${filename}`;
stream.pipe(fs.createWriteStream(outPath));
stream.on('end', () => console.log('Generated', outPath));
