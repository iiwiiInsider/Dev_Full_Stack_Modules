import PDFDocument from 'pdfkit';
import { format } from '../util/format.js';

export function generateRentalPdf(data) {
  // Slightly smaller margins to reduce empty whitespace
  const doc = new PDFDocument({ margin: 42, size: 'A4' });
  const filename = `rental-listing-${Date.now()}.pdf`;

  header(doc, data.agency);
  titleBlock(doc, 'Rental Listing Brochure');
  heroRent(doc, data.property, data.rental);
  // Place property highlights + rental terms side-by-side to use space efficiently
  detailsSection(doc, data.property, data.rental);
  featureList(doc, data.features || []);
  gallerySection(doc, data.images?.hero, data.images?.gallery || []);
  termsSection(doc, data.rental || {});
  agentSection(doc, data.agent, data.agency);
  footerNotes(doc, data);

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
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#555')
    .text(agency.tagline || 'Professional Letting Services', { align: 'right' });

  doc.moveDown(0.3);
  doc.strokeColor('#16a34a').lineWidth(1.5).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.4);
}

function titleBlock(doc, title) {
  doc
    .fontSize(22)
    .fillColor('#16a34a')
    .font('Helvetica-Bold')
    .text(title, { align: 'center' })
    .moveDown(0.3);
}

function heroRent(doc, property = {}, rental = {}) {
  const boxHeight = 64;
  const fullWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startY = doc.y;
  doc.roundedRect(doc.page.margins.left, startY, fullWidth, boxHeight, 12)
    .fillOpacity(0.07).fill('#16a34a').fillOpacity(1);
  doc.save();
  doc.font('Helvetica-Bold').fillColor('#166534').fontSize(20)
    .text(property.address || 'Property Address', doc.page.margins.left + 16, startY + 12, { width: fullWidth - 32, continued: false });
  doc.font('Helvetica').fontSize(10).fillColor('#333')
    .text(`${property.type || ''}${property.type ? ' | ' : ''}${property.bedrooms || 0} Bed · ${property.bathrooms || 0} Bath${property.buildingSize ? ' · ' + property.buildingSize + ' m²' : ''}`, doc.page.margins.left + 16, startY + 38, { width: fullWidth/2, continued: false });
  const rentStr = rental.monthlyRent ? `${format.currency(rental.monthlyRent)} / month` : '';
  const depositStr = rental.deposit ? `Deposit ${format.currency(rental.deposit)}` : '';
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#166534')
    .text(rentStr, doc.page.margins.left + fullWidth/2, startY + 20, { width: fullWidth/2 - 16, align: 'right' });
  if (depositStr) {
    doc.font('Helvetica').fontSize(9).fillColor('#14532d')
      .text(depositStr, doc.page.margins.left + fullWidth/2, startY + 40, { width: fullWidth/2 - 16, align: 'right' });
  }
  doc.restore();
  doc.moveDown(0.8);
}

function sectionHeading(doc, text) {
  doc.moveDown(0.4)
    .fontSize(12)
    .fillColor('#16a34a')
    .font('Helvetica-Bold')
    .text(text.toUpperCase())
    .fillColor('#222')
    .fontSize(10)
    .moveDown(0.1);
  doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.25);
}

function detailsSection(doc, property = {}, rental = {}) {
  // Two side-by-side panels: Property Highlights (left) and Rental Terms (right)
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = 16;
  const colWidth = (usableWidth - gap) / 2;
  // Ensure a little clearance from any preceding rules/heading borders
  const topY = doc.y + 8;

  // Left panel: Property Highlights
  let x = doc.page.margins.left;
  let y = topY;
  const leftStartY = y;
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#166534').text('PROPERTY HIGHLIGHTS', x, y);
  y = doc.y + 6;
  doc.y = y;
  const highlights = {
    'Type': property.type,
    'Bedrooms': property.bedrooms,
    'Bathrooms': property.bathrooms,
    'Building Size': property.buildingSize ? property.buildingSize + ' m²' : undefined,
    'Land Size': property.landSize ? property.landSize + ' m²' : undefined,
    'Parking': property.parking,
    'Unit': property.unit,
    'Address': property.address
  };
  keyValueGrid(doc, highlights, { x, y, width: colWidth, columns: 1, lineHeight: 20 });
  const leftBottomY = doc.y;

  // Right panel: Rental Terms
  x = doc.page.margins.left + colWidth + gap;
  y = topY;
  const rightStartY = y;
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#166534').text('RENTAL TERMS', x, y);
  y = doc.y + 6;
  doc.y = y;
  const terms = {
    'Monthly Rent': rental.monthlyRent ? format.currency(rental.monthlyRent) : undefined,
    'Deposit': rental.deposit ? format.currency(rental.deposit) : undefined,
    'Lease Term': rental.leaseTerm ? `${rental.leaseTerm} months` : undefined,
    'Available From': rental.availableFrom ? format.date(rental.availableFrom) : undefined,
    'Utilities': rental.utilities,
    'Included': rental.included,
    'Application Fee': rental.applicationFee ? format.currency(rental.applicationFee) : undefined,
    'Pets': rental.petsAllowed !== undefined && rental.petsAllowed !== '' ? ((rental.petsAllowed === true || rental.petsAllowed === 'true') ? 'Allowed' : 'Not allowed') : undefined,
    'Pets Policy': rental.petsPolicy,
    'Smoking Policy': rental.smokingPolicy
  };
  keyValueGrid(doc, terms, { x, y, width: colWidth, columns: 1, lineHeight: 20 });
  const rightBottomY = doc.y;

  // Draw subtle panel borders around each column area
  const pad = 8;
  doc.save().strokeColor('#cbd5e1').lineWidth(1)
    .roundedRect((doc.page.margins.left) - pad/2, leftStartY - pad/2, colWidth + pad, (leftBottomY - leftStartY) + pad, 8).stroke()
    .roundedRect((doc.page.margins.left + colWidth + gap) - pad/2, rightStartY - pad/2, colWidth + pad, (rightBottomY - rightStartY) + pad, 8).stroke()
    .restore();

  // Move cursor below the taller panel
  doc.y = Math.max(leftBottomY, rightBottomY) + 8;

  // Optional description under panels uses full width but compact spacing
  if (property.description) {
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(10).fillColor('#333').text(property.description, { align: 'justify' });
  }
}

function featureList(doc, features = []) {
  if (!features.length) return;
  sectionHeading(doc, 'Key Features');
  doc.fontSize(10).fillColor('#333');
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cols = 3;
  const gap = 16;
  const colWidth = (usableWidth - gap * (cols - 1)) / cols;
  let x = doc.page.margins.left;
  let y = doc.y;
  let rowHeights = 0;
  features.forEach((f, idx) => {
    doc.text('• ' + f, x, y, { width: colWidth });
    rowHeights = Math.max(rowHeights, 16);
    if ((idx + 1) % cols === 0) {
      x = doc.page.margins.left;
      y += rowHeights;
      rowHeights = 0;
    } else {
      x += colWidth + gap;
    }
  });
  doc.y = y + rowHeights + 6;
}

function termsSection(doc, rental = {}) {
  // Compact additional terms section (if notes present)
  if (!rental?.notes) return;
  sectionHeading(doc, 'Additional Notes');
  doc.font('Helvetica').fontSize(9).fillColor('#444').text(rental.notes, { align: 'justify' });
}

function gallerySection(doc, hero, gallery = []) {
  if (!hero && !gallery.length) return;
  if (!hasSpace(doc, hero ? 200 : 140)) doc.addPage();
  sectionHeading(doc, 'Gallery');

  if (hero) {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const maxHeight = 150;
    ensureSpace(doc, maxHeight + 10);
    try {
      const buffer = dataUrlToBuffer(hero);
      const heroTop = doc.y;
      const bgPad = 8;
      doc.save();
      doc.roundedRect(doc.page.margins.left - bgPad/2, heroTop - bgPad/2, pageWidth + bgPad, maxHeight + bgPad, 12)
        .fillOpacity(1).fill('#FFFFFF');
      doc.roundedRect(doc.page.margins.left - bgPad/2, heroTop - bgPad/2, pageWidth + bgPad, maxHeight + bgPad, 12)
        .strokeColor('#cbd5e1').lineWidth(1).stroke();
      doc.restore();
      const inset = 4;
      doc.image(buffer, doc.page.margins.left + inset, heroTop + inset, { width: pageWidth - inset*2, fit: [pageWidth - inset*2, maxHeight - inset*2] });
      doc.y = heroTop + maxHeight + bgPad + 10;
    } catch (e) {
      doc.fontSize(9).fillColor('#b91c1c').text('Failed to load hero image.', { align: 'center' });
      doc.moveDown(0.4);
    }
  }

  if (!gallery.length) { doc.moveDown(0.4); return; }

  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const cols = 3;
  const gap = 6;
  const cellWidth = (usableWidth - gap * (cols - 1)) / cols;
  let x = doc.page.margins.left;
  let y = doc.y;
  let rowHeight = 0;
  gallery.slice(0, 12).forEach((img, i) => {
    try {
      const buffer = dataUrlToBuffer(img);
      if (y + 112 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      doc.image(buffer, x, y, { width: cellWidth, fit: [cellWidth, 100] });
      rowHeight = Math.max(rowHeight, 100);
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
  doc.moveDown(0.2);
}

function agentSection(doc, agent = {}, agency = {}) {
  sectionHeading(doc, 'Your Contact');
  const grid = {
    'Agent Name': agent.name,
    'Email': agent.email,
    'Phone': agent.phone,
    'Agency': agency.name,
    'Agency Reg #': agency.registration,
    'Agency Address': agency.address,
  };
  keyValueGrid(doc, grid, { lineHeight: 20 });
}

function footerNotes(doc, data) {
  doc.moveDown(0.6);
  doc.fontSize(8).fillColor('#666').text('All information deemed reliable but not guaranteed. Tenants should verify details independently. Terms and availability subject to change without notice.', { align: 'center' });
  if (data.disclaimer) {
    doc.moveDown(0.2).fontSize(7).fillColor('#888').text(data.disclaimer, { align: 'center' });
  }
}

function keyValueGrid(doc, obj, opts = {}) {
  const entries = Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '' && v !== null);
  if (!entries.length) return;
  const {
    x = doc.page.margins.left,
    y = doc.y,
    width = (doc.page.width - doc.page.margins.left - doc.page.margins.right),
    columns = 2,
    gap = 16,
    lineHeight = 22
  } = opts;

  const colWidth = (width - gap * (columns - 1)) / columns;
  let col = 0;
  let row = 0;
  let curY = y;
  entries.forEach(([k, v], idx) => {
    const colX = x + col * (colWidth + gap);
    const rowY = y + row * lineHeight;
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000').text(k + ':', colX, rowY, { width: colWidth });
    doc.font('Helvetica').fontSize(9).fillColor('#222').text(String(v), { width: colWidth });
    col += 1;
    if (col >= columns) {
      col = 0;
      row += 1;
      curY = y + row * lineHeight;
    }
  });
  // Advance y just below the last row
  if (col !== 0) row += 1;
  doc.y = y + row * lineHeight + 4;
}

function dataUrlToBuffer(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) throw new Error('Not a data URL');
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
}

function hasSpace(doc, needed) {
  return doc.y + needed < (doc.page.height - doc.page.margins.bottom);
}
function ensureSpace(doc, needed) {
  if (!hasSpace(doc, needed)) doc.addPage();
}
