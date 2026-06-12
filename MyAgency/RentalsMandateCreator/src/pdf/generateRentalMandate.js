import PDFDocument from 'pdfkit';
import { format } from '../util/format.js';

export function generateRentalMandatePdf(data) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const filename = `rental-mandate-${Date.now()}.pdf`;

  header(doc, data.agency);
  titleBlock(doc, 'Property Rental Mandate');

  propertySection(doc, data.property);
  landlordSection(doc, data.landlord);
  agentSection(doc, data.agent, data.agency);
  rentalTermsSection(doc, data.rental || {}, data.terms || {});
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
    .text(agency.tagline || 'Professional Letting Services', { align: 'right' });

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
  if (available < requiredHeight) doc.addPage();
}

function propertySection(doc, property = {}) {
  sectionHeading(doc, 'Property Details');
  keyValueGrid(doc, {
    'Address': property.address,
    'Type': property.type,
    'Bedrooms': property.bedrooms,
    'Bathrooms': property.bathrooms,
    'Furnished': property.furnished ? (property.furnished === true || String(property.furnished).toLowerCase() === 'true' ? 'Yes' : 'No') : undefined,
    'Parking': property.parking,
    'Land Size': property.landSize ? property.landSize + ' m²' : undefined,
    'Building Size': property.buildingSize ? property.buildingSize + ' m²' : undefined,
  });
  if (property.description) {
    doc.moveDown(0.3).font('Helvetica').fontSize(10).fillColor('#333').text(property.description, { align: 'justify' });
  }
}

function landlordSection(doc, landlord = {}) {
  sectionHeading(doc, 'Landlord');
  keyValueGrid(doc, {
    'Name': landlord.name,
    'ID / Passport': landlord.idNumber,
    'Email': landlord.email,
    'Phone': landlord.phone,
    'Address': landlord.address,
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

function rentalTermsSection(doc, rental = {}, terms = {}) {
  sectionHeading(doc, 'Rental & Mandate Terms');
  const lines = [];
  // Rental specifics
  if (rental.monthlyRent) lines.push(`Monthly Rent: ${format.currency(rental.monthlyRent, 'ZAR', 'en-ZA')}`);
  if (rental.deposit) lines.push(`Deposit: ${format.currency(rental.deposit, 'ZAR', 'en-ZA')}`);
  if (rental.leaseTermMonths) lines.push(`Lease Term: ${rental.leaseTermMonths} month(s)`);
  if (rental.availableFrom) lines.push(`Available From: ${format.date(rental.availableFrom)}`);
  if (rental.utilitiesIncluded) lines.push(`Utilities Included: ${rental.utilitiesIncluded}`);
  if (rental.petsAllowed) lines.push(`Pets Allowed: ${rental.petsAllowed}`);
  if (rental.maxOccupants) lines.push(`Max Occupants: ${rental.maxOccupants}`);

  // Mandate specifics
  if (terms.startDate || terms.endDate) lines.push(`Mandate Period: ${format.date(terms.startDate)} - ${format.date(terms.endDate)}`);
  if (terms.exclusivity) lines.push(`Exclusivity: ${terms.exclusivity}`);
  if (terms.commissionRate) lines.push(`Commission: ${terms.commissionRate}% of total contract value or first month's rent (as agreed)`);
  if (terms.minimumCommission) lines.push(`Minimum Commission: ${format.currency(terms.minimumCommission, 'ZAR', 'en-ZA')}`);
  if (terms.placementFee) lines.push(`Placement Fee: ${format.currency(terms.placementFee, 'ZAR', 'en-ZA')}`);
  if (terms.managementFeeRate) lines.push(`Management Fee: ${terms.managementFeeRate}% of monthly rent`);
  if (terms.marketingPlan) lines.push(`Marketing Plan: ${terms.marketingPlan}`);
  if (terms.specialConditions) lines.push(`Special Conditions: ${terms.specialConditions}`);
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

  // Landlord box
  signatureBox(doc, leftX, yStart, colWidth, boxHeight, 'Landlord', data.landlord?.name);
  // Agent box
  signatureBox(doc, rightX, yStart, colWidth, boxHeight, 'Agent', data.agent?.name);

  doc.y = yStart + boxHeight + 16;
  doc.moveDown(0.5);
  doc.fontSize(8).fillColor('#777').text('This mandate authorizes the agent/agency to market and place tenants for the property under the terms specified above.');
}

function signatureBox(doc, x, y, w, h, role, name) {
  doc.roundedRect(x, y, w, h, 8).strokeColor('#0A6EB4').lineWidth(1).stroke();

  const padX = 12;
  const padTop = 8;
  doc
    .fillColor('#0A6EB4')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(role.toUpperCase(), x + padX, y + padTop, { width: w - padX * 2, align: 'left' });

  const lineYStart = y + 30;
  const lineGap = 24;
  const labelColor = '#555';
  const labelWidth = 72;

  doc.font('Helvetica').fontSize(9).fillColor(labelColor).text('Name:', x + padX, lineYStart, { width: labelWidth });
  drawLineWithText(doc, x + padX + labelWidth, lineYStart + 10, w - padX * 2 - labelWidth, name || '');

  const sigY = lineYStart + lineGap;
  doc.fillColor(labelColor).text('Signature:', x + padX, sigY, { width: labelWidth });
  drawLineWithText(doc, x + padX + labelWidth, sigY + 10, w - padX * 2 - labelWidth, '');

  const dateY = sigY + lineGap;
  doc.fillColor(labelColor).text('Date:', x + padX, dateY, { width: labelWidth });
  drawLineWithText(doc, x + padX + labelWidth, dateY + 10, (w - padX * 2 - labelWidth) / 2 - 8, '');

  doc.fillColor(labelColor).text('Place:', x + padX + labelWidth + (w - padX * 2 - labelWidth) / 2 + 8, dateY, { width: labelWidth });
  drawLineWithText(doc, x + padX + labelWidth + (w - padX * 2 - labelWidth) / 2 + 8 + labelWidth, dateY + 10, (w - padX * 2 - labelWidth) / 2 - labelWidth - 8, '');
}

function drawLineWithText(doc, x, y, width, text) {
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
