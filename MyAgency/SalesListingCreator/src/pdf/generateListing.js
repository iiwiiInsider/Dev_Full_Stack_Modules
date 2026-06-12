import PDFDocument from 'pdfkit';
import { format } from '../util/format.js';

export function generateListingPdf(data) {
  const doc = new PDFDocument({ margin: 54, size: 'A4' }); // slightly larger margin for improved whitespace
  const filename = `listing-${Date.now()}.pdf`;

  header(doc, data.agency);
  titleBlock(doc, 'Property Listing Brochure');
  heroPrice(doc, data.property);
  propertyHighlights(doc, data.property);
  featureList(doc, data.features || []);
  gallerySection(doc, data.images?.hero, data.images?.gallery || []);
  neighborhoodSection(doc, data.neighborhood || {});
  agentSection(doc, data.agent, data.agency);
  footerNotes(doc, data);

  doc.end();
  return { stream: doc, filename };
}

function header(doc, agency = {}) {
  doc
    .fillColor('#222')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(agency.name || 'Agency Name', { align: 'left' });

  doc.moveUp()
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#555')
    .text(agency.tagline || 'Professional Real Estate Services', { align: 'right' });

  doc.moveDown(0.5);
  doc.strokeColor('#0A6EB4').lineWidth(2).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown();
}

function titleBlock(doc, title) {
  doc
    .fontSize(24)
    .fillColor('#0A6EB4')
    .font('Helvetica-Bold')
    .text(title, { align: 'center' })
    .moveDown(0.5);
}

function heroPrice(doc, property = {}) {
  const boxHeight = 72;
  const fullWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startY = doc.y;
  doc.roundedRect(doc.page.margins.left, startY, fullWidth, boxHeight, 12)
    .fillOpacity(0.07).fill('#0A6EB4').fillOpacity(1);
  doc.save();
  doc.font('Helvetica-Bold').fillColor('#0A6EB4').fontSize(24)
    .text(property.address || 'Property Address', doc.page.margins.left + 16, startY + 14, { width: fullWidth - 32, continued: false });
  doc.font('Helvetica').fontSize(11).fillColor('#333')
    .text(`${property.type || ''}${property.type ? ' | ' : ''}${property.bedrooms || 0} Bed · ${property.bathrooms || 0} Bath${property.buildingSize ? ' · ' + property.buildingSize + ' m²' : ''}`, doc.page.margins.left + 16, startY + 44, { width: fullWidth/2, continued: false });
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#0A6EB4')
    .text(property.askingPrice ? format.currency(property.askingPrice) : '', doc.page.margins.left + fullWidth/2, startY + 30, { width: fullWidth/2 - 16, align: 'right' });
  doc.restore();
  doc.moveDown(1.2);
}


function sectionHeading(doc, text) {
  doc.moveDown(0.8)
    .fontSize(14)
    .fillColor('#0A6EB4')
    .font('Helvetica-Bold')
    .text(text.toUpperCase())
    .fillColor('#222')
    .fontSize(10)
    .moveDown(0.15);
  doc.strokeColor('#ccc').lineWidth(1).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.3);
}

function propertyHighlights(doc, property = {}) {
  sectionHeading(doc, 'Highlights');
  const grid = {
    'Address': property.address,
    'Type': property.type,
    'Bedrooms': property.bedrooms,
    'Bathrooms': property.bathrooms,
    'Land Size': property.landSize ? property.landSize + ' m²' : undefined,
    'Building Size': property.buildingSize ? property.buildingSize + ' m²' : undefined,
    'Asking Price': property.askingPrice ? format.currency(property.askingPrice) : undefined,
    'Year Built': property.yearBuilt,
    'Parking': property.parking,
    'HOA Fees': property.hoaFees ? format.currency(property.hoaFees) : undefined
  };
  keyValueGrid(doc, grid);
  if (property.description) {
    doc.moveDown(0.3).font('Helvetica').fontSize(10).fillColor('#333').text(property.description, { align: 'justify' });
  }
  doc.moveDown(0.4);
}

function featureList(doc, features = []) {
  if (!features.length) return;
  sectionHeading(doc, 'Key Features');
  doc.fontSize(10).fillColor('#333');
  const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 2 - 10;
  let leftCol = true;
  let startY = doc.y;
  features.forEach((f, idx) => {
    const x = doc.page.margins.left + (leftCol ? 0 : colWidth + 20);
    const y = startY + (Math.floor(idx / 2) * 18);
    doc.text('• ' + f, x, y, { width: colWidth });
    leftCol = !leftCol;
  });
  doc.y = startY + (Math.ceil(features.length / 2) * 18);
  doc.moveDown(0.4);
}

function neighborhoodSection(doc, area = {}) {
  if (!area || (!area.schools && !area.amenities && !area.transport && !area.description)) return;
  sectionHeading(doc, 'Neighborhood');
  const grid = {
    'Schools': area.schools,
    'Transport': area.transport,
    'Amenities': area.amenities,
    'Parks': area.parks,
  };
  keyValueGrid(doc, grid);
  if (area.description) {
    doc.font('Helvetica').fontSize(10).fillColor('#333').text(area.description, { align: 'justify' });
  }
}

function gallerySection(doc, hero, gallery = []) {
  if (!hero && !gallery.length) return; // nothing to show
  // Ensure space or new page for heading + hero (if present)
  if (!hasSpace(doc, hero ? 220 : 160)) doc.addPage();
  sectionHeading(doc, 'Gallery');

  // Hero image full width first
  if (hero) {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const maxHeight = 170;
    ensureSpace(doc, maxHeight + 10);
    try {
      const buffer = dataUrlToBuffer(hero);
      const heroTop = doc.y;
      const bgPad = 6; // padding around hero
      // Draw white background panel with subtle shadow effect (using stroke)
      doc.save();
      doc.roundedRect(doc.page.margins.left - bgPad/2, heroTop - bgPad/2, pageWidth + bgPad, maxHeight + bgPad, 12)
        .fillOpacity(1).fill('#FFFFFF');
      doc.roundedRect(doc.page.margins.left - bgPad/2, heroTop - bgPad/2, pageWidth + bgPad, maxHeight + bgPad, 12)
        .strokeColor('#e2e8f0').lineWidth(1).stroke();
      doc.restore();
      // Place image inside panel with a slight inset for visual breathing room
      const inset = 4;
      doc.image(buffer, doc.page.margins.left + inset, heroTop + inset, { width: pageWidth - inset*2, fit: [pageWidth - inset*2, maxHeight - inset*2] });
      // Manually advance y below hero block
      doc.y = heroTop + maxHeight + bgPad + 10; // extra 10 for separation from grid
    } catch (e) {
      doc.fontSize(9).fillColor('#b91c1c').text('Failed to load hero image.', { align: 'center' });
      doc.moveDown(0.4);
    }
  }

  if (!gallery.length) { doc.moveDown(0.4); return; }

  // Remaining gallery grid
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cols = 3;
  const gap = 8;
  const cellWidth = (usableWidth - gap * (cols - 1)) / cols;
  let x = doc.page.margins.left;
  let y = doc.y;
  let rowHeight = 0;
  gallery.slice(0, 12).forEach((img, i) => {
    try {
      const buffer = dataUrlToBuffer(img);
      if (y + 120 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      doc.image(buffer, x, y, { width: cellWidth, fit: [cellWidth, 110] });
      rowHeight = Math.max(rowHeight, 110);
    } catch (e) {
      doc.rect(x, y, cellWidth, 110).stroke('#ddd');
      doc.fontSize(8).fillColor('#999').text('Image error', x + 4, y + 4, { width: cellWidth - 8, align: 'center' });
    }
    if ((i + 1) % cols === 0) {
      x = doc.page.margins.left;
      y += rowHeight + gap;
      rowHeight = 0;
    } else {
      x += cellWidth + gap;
    }
  });
  doc.y = y + rowHeight + 8;
  doc.moveDown(0.4);
}

function agentSection(doc, agent = {}, agency = {}) {
  sectionHeading(doc, 'Your Contact');
  const grid = {
    'Agent Name': agent.name,
    'License #': agent.license,
    'Email': agent.email,
    'Phone': agent.phone,
    'Agency': agency.name,
    'Agency Reg #': agency.registration,
    'Agency Address': agency.address,
  };
  keyValueGrid(doc, grid);
}

function footerNotes(doc, data) {
  doc.moveDown(1.2);
  doc.fontSize(8).fillColor('#666').text('All information deemed reliable but not guaranteed. Buyers should conduct their own due diligence. Pricing and availability subject to change.', { align: 'center' });
  if (data.disclaimer) {
    doc.moveDown(0.3).fontSize(7).fillColor('#888').text(data.disclaimer, { align: 'center' });
  }
}

function keyValueGrid(doc, obj) {
  const entries = Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '' && v !== null);
  const colCount = 2;
  const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / colCount - 10;
  let col = 0;
  let startY = doc.y;
  const lineHeight = 28;

  entries.forEach(([k, v]) => {
    const x = doc.page.margins.left + col * (colWidth + 20);
    const y = startY + Math.floor(col / (colCount)) * lineHeight;
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000').text(k + ':', x, y, { width: colWidth });
    doc.font('Helvetica').fontSize(9).fillColor('#222').text(String(v), { width: colWidth });
    col = (col + 1) % colCount;
    if (col === 0) {
      startY += lineHeight;
      doc.y = startY;
    }
  });
  doc.moveDown();
}

function dataUrlToBuffer(dataUrl) {
  if (!dataUrl.startsWith('data:')) throw new Error('Not a data URL');
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
}

// Layout helpers
function hasSpace(doc, needed) {
  return doc.y + needed < (doc.page.height - doc.page.margins.bottom);
}
function ensureSpace(doc, needed) {
  if (!hasSpace(doc, needed)) doc.addPage();
}
