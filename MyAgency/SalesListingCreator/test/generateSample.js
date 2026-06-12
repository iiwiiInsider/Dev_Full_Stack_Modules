import { generateListingPdf } from '../src/pdf/generateListing.js';
import fs from 'fs';

const sample = {
  property: {
    address:'456 Oak Avenue, Lakeside', type:'Lake House', yearBuilt:1998, bedrooms:4, bathrooms:3,
    landSize:1200, buildingSize:260, askingPrice:795000, parking:'Double garage',
    description:'Stunning lakeside retreat with expansive deck, floor-to-ceiling windows, and private dock. Perfect for entertaining and year-round living.',
    hoaFees: 250
  },
  features: ['Private Dock','Panoramic Lake Views','Renovated Chef Kitchen','Smart Home System','Solar Panels','Heated Floors'],
  neighborhood: { schools:'Lakeside Elementary (2km), Ridge High (5km)', transport:'15 min to highway, local bus stop 300m', amenities:'Marina, cafes, organic grocery, weekend farmers market', parks:'Lakeside Trail, Eagle Point Reserve', description:'Quiet upscale community focused on outdoor living and water recreation.' },
  agent: { name:'Olivia Waters', license:'LIC-12345', email:'olivia@blueskyrealty.com', phone:'+1 555 456 7890' },
  agency: { name:'BlueSky Realty', registration:'REG-556677', address:'45 Commerce Rd, Springfield', tagline:'Elevating Property Transactions' },
  images: {
    hero: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAP0lEQVR4Ae3RAQ0AAAgDoOZf2h8MB2cOmKBNmiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkm4FbgADN9NH2wAAAABJRU5ErkJggg==', // tiny placeholder
    gallery: []
  },
  disclaimer: 'Measurements and figures are approximate and subject to independent verification.'
};

const { stream, filename } = generateListingPdf(sample);
const outPath = `./test-output-${filename}`;
stream.pipe(fs.createWriteStream(outPath));
stream.on('end', () => console.log('Generated', outPath));
