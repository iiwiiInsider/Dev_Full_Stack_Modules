import PDFDocument from 'pdfkit';
import { format } from '../util/format.js';

export function generateMandatePdf(data) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const filename = `mandate-${Date.now()}.pdf`;

  // Branding / Header
  header(doc, data.agency);
  titleBlock(doc, 'Property Sale Mandate');

  propertySection(doc, data.property);
  sellerSection(doc, data.seller);
  agentSection(doc, data.agent, data.agency);
  termsSection(doc, data.terms || {});
  signatureSection(doc, data);

  doc.end();
  return { stream: doc, filename };
}

function header(doc, agency = {}) {
  doc
    .fillColor('#222')
    .fontSize(18)
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
    .fontSize(22)
    .fillColor('#0A6EB4')
    .font('Helvetica-Bold')
    .text(title, { align: 'center' })
    .moveDown(0.5);
}

function sectionHeading(doc, text) {
  doc
    .moveDown(0.6)
    .fontSize(13)
    .fillColor('#0A6EB4')
    .font('Helvetica-Bold')
    .text(text.toUpperCase())
    .fillColor('#222')
    .fontSize(10)
    .moveDown(0.1);
  doc.strokeColor('#ccc').lineWidth(1).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.3);
}

function ensureSpace(doc, requiredHeight) {
  const available = doc.page.height - doc.y - doc.page.margins.bottom;
  if (available < requiredHeight) {
    doc.addPage();
  }
}

function propertySection(doc, property = {}) {
  sectionHeading(doc, 'Property Details');
  keyValueGrid(doc, {
    'Address': property.address,
    'Type': property.type,
    'Bedrooms': property.bedrooms,
    'Bathrooms': property.bathrooms,
    'Land Size': property.landSize ? property.landSize + ' m²' : undefined,
    'Building Size': property.buildingSize ? property.buildingSize + ' m²' : undefined,
    'Asking Price': property.askingPrice ? format.currency(property.askingPrice, 'ZAR', 'en-ZA') : undefined,
  });
  if (property.description) {
    doc.moveDown(0.3).font('Helvetica').fontSize(10).fillColor('#333').text(property.description, { align: 'justify' });
  }
}

function sellerSection(doc, seller = {}) {
  sectionHeading(doc, 'Seller');
  keyValueGrid(doc, {
    'Name': seller.name,
    'ID / Passport': seller.idNumber,
    'Email': seller.email,
    'Phone': seller.phone,
    'Address': seller.address,
  });
}

function agentSection(doc, agent = {}, agency = {}) {
  sectionHeading(doc, 'Agent / Agency');
  keyValueGrid(doc, {
    'Agent Name': agent.name,
    'License #': agent.license,
    'Email': agent.email,
    'Phone': agent.phone,
    'Agency': agency.name,
    'Agency Reg #': agency.registration,
    'Agency Address': agency.address,
  });
}

function termsSection(doc, terms = {}) {
  sectionHeading(doc, 'Mandate Terms');
  const lines = [];
  if (terms.startDate || terms.endDate) lines.push(`Mandate Period: ${format.date(terms.startDate)} - ${format.date(terms.endDate)}`);
  if (terms.exclusivity) lines.push(`Exclusivity: ${terms.exclusivity}`);
  if (terms.commissionRate) lines.push(`Commission: ${terms.commissionRate}% of final selling price`);
  if (terms.minimumCommission) lines.push(`Minimum Commission: ${format.currency(terms.minimumCommission, 'ZAR', 'en-ZA')}`);
  if (terms.specialConditions) lines.push(`Special Conditions: ${terms.specialConditions}`);
  if (terms.marketingPlan) lines.push(`Marketing Plan: ${terms.marketingPlan}`);
  if (!lines.length) lines.push('No specific terms provided.');
  doc.fontSize(10).fillColor('#333');
  lines.forEach(l => doc.text('• ' + l, { align: 'left', continued: false }));
}

function signatureSection(doc, data) {
  sectionHeading(doc, 'Signatures');

  const totalWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = 24;
  const colWidth = (totalWidth - gap) / 2;
  const boxHeight = 120;

  ensureSpace(doc, boxHeight + 40);

  const yStart = doc.y + 12;
  const leftX = doc.page.margins.left;
  const rightX = leftX + colWidth + gap;

  doc.font('Helvetica').fontSize(10).fillColor('#000');

  // Seller box
  signatureBox(doc, leftX, yStart, colWidth, boxHeight, 'Seller', data.seller?.name);
  // Agent box
  signatureBox(doc, rightX, yStart, colWidth, boxHeight, 'Agent', data.agent?.name);

  // Move cursor below the boxes neatly
  doc.y = yStart + boxHeight + 16;
  doc.moveDown(0.5);
  doc.fontSize(8).fillColor('#777').text('This mandate authorizes the agent/agency to market and negotiate the sale of the property under the terms specified above.');
}

function signatureBox(doc, x, y, w, h, role, name) {
  // Box border
  doc.roundedRect(x, y, w, h, 8).strokeColor('#0A6EB4').lineWidth(1).stroke();

  // Title bar
  const padX = 12;
  const padTop = 8;
  doc
    .fillColor('#0A6EB4')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(role.toUpperCase(), x + padX, y + padTop, { width: w - padX * 2, align: 'left' });

  // Content lines
  const lineYStart = y + 30;
  const lineGap = 24;
  const labelColor = '#555';
  const valueColor = '#222';
  const labelWidth = 72; // space for labels like "Name:" "Signature:"

  // Printed Name
  doc.font('Helvetica').fontSize(9).fillColor(labelColor).text('Name:', x + padX, lineYStart, { width: labelWidth });
  drawLineWithText(doc, x + padX + labelWidth, lineYStart + 10, w - padX * 2 - labelWidth, name || '');

  // Signature line
  const sigY = lineYStart + lineGap;
  doc.fillColor(labelColor).text('Signature:', x + padX, sigY, { width: labelWidth });
  drawLineWithText(doc, x + padX + labelWidth, sigY + 10, w - padX * 2 - labelWidth, '');

  // Date line
  const dateY = sigY + lineGap;
  doc.fillColor(labelColor).text('Date:', x + padX, dateY, { width: labelWidth });
  drawLineWithText(doc, x + padX + labelWidth, dateY + 10, (w - padX * 2 - labelWidth) / 2 - 8, '');

  // Place line (optional, keeps symmetry)
  doc.fillColor(labelColor).text('Place:', x + padX + labelWidth + (w - padX * 2 - labelWidth) / 2 + 8, dateY, { width: labelWidth });
  drawLineWithText(doc, x + padX + labelWidth + (w - padX * 2 - labelWidth) / 2 + 8 + labelWidth, dateY + 10, (w - padX * 2 - labelWidth) / 2 - labelWidth - 8, '');
}

function drawLineWithText(doc, x, y, width, text) {
  // Draw a thin line and overlay faint text if provided
  const lineY = y + 2;
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(x, lineY).lineTo(x + width, lineY).stroke();
  if (text) {
    doc.fillColor('#222').font('Helvetica').fontSize(9).text(text, x + 2, y - 8, { width: width - 4, height: 12, ellipsis: true });
  }
}

function keyValueGrid(doc, obj) {
  const entries = Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '' && v !== null);
  const colCount = 2;
  const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / colCount - 10;
  let col = 0;
  let startY = doc.y;
  const lineHeight = 28;

  entries.forEach(([k, v], i) => {
    const x = doc.page.margins.left + col * (colWidth + 20);
    const y = startY + Math.floor(col / (colCount)) * lineHeight; // ensure rows line up
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000').text(k + ':', x, y, { width: colWidth });
    doc.font('Helvetica').fontSize(9).fillColor('#222').text(String(v), { width: colWidth });
    col = (col + 1) % colCount;
    if (col === 0) {
      startY += lineHeight;
      doc.y = startY; // adjust doc y so next sections don't overlap
    }
  });
  doc.moveDown();
}
