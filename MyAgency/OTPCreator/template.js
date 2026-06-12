// Functions to generate HTML and plain text sections for the Offer To Purchase

export function buildOfferData(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.contingencies = collectContingencies();
  return data;
}

function collectContingencies() {
  const rows = [...document.querySelectorAll('.cont-row')];
  return rows.map(r => ({
    type: r.dataset.type,
    days: r.dataset.days || '',
    notes: r.dataset.notes || ''
  }));
}

export function offerHtml(data) {
  const money = v => v ? Number(v).toLocaleString(undefined,{style:'currency',currency:'ZAR'}) : '';
  const esc = (s='') => String(s).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const section = (title, body) => `\n<h2>${title}</h2>\n${body}`;

  let contingenciesHtml = data.contingencies.length ? `<ol>` + data.contingencies.map(c => `<li><strong>${esc(c.type)}</strong>${c.days?` (${esc(c.days)} days)`:''}${c.notes?`: ${esc(c.notes)}`:''}</li>`).join('') + `</ol>` : '<p>None.</p>';

  return `
  <h1>Offer To Purchase</h1>
  <p class="meta">Created on ${new Date().toLocaleString()}</p>
  ${section('Property', `<p><strong>Address:</strong> ${esc(data.propertyAddress)}<br>${data.legalDescription?`<strong>Legal:</strong> ${esc(data.legalDescription)}<br>`:''}${data.parcelId?`<strong>Parcel ID:</strong> ${esc(data.parcelId)}`:''}</p>`)}
  ${section('Parties', `<p><strong>Buyer(s):</strong> ${esc(data.buyers)}<br><strong>Seller(s):</strong> ${esc(data.sellers)}${data.buyerBroker?`<br><strong>Buyer Broker:</strong> ${esc(data.buyerBroker)}`:''}${data.sellerBroker?`<br><strong>Seller Broker:</strong> ${esc(data.sellerBroker)}`:''}</p>`)}
  ${section('Price & Funding', `<p><strong>Purchase Price:</strong> ${money(data.purchasePrice)}<br><strong>Earnest Money:</strong> ${money(data.earnestMoney)}${data.earnestHolder?` held by ${esc(data.earnestHolder)}`:''}<br><strong>Financing Type:</strong> ${esc(data.financingType)}${data.financingDetails?`<br><strong>Details:</strong> ${esc(data.financingDetails)}`:''}</p>`)}
  ${section('Dates', `<p><strong>Offer Date:</strong> ${esc(data.offerDate)}<br><strong>Acceptance Deadline:</strong> ${esc(data.acceptanceDeadline)}<br><strong>Closing Date:</strong> ${esc(data.closingDate)}${data.possessionDate?`<br><strong>Possession:</strong> ${esc(data.possessionDate)}`:''}</p>`)}
  ${section('Items', `<p><strong>Included:</strong> ${esc(data.included||'None specified')}<br><strong>Excluded:</strong> ${esc(data.excluded||'None specified')}</p>`)}
  ${section('Contingencies', contingenciesHtml)}
  ${section('Additional Terms', `<p>${esc(data.additionalTerms||'None.')}</p>`)}
  ${section('Signatures', `<p>${esc(data.buyerSignatureLines||'Buyer: __________________ Date: ________')}<br>${esc(data.sellerSignatureLines||'Seller: __________________ Date: ________')}</p>`)}
  <p class="meta">Draft document. Not legal advice.</p>
  `;
}

export function offerPlainText(data) {
  const money = v => v ? Number(v).toLocaleString(undefined,{style:'currency',currency:'ZAR'}) : '';
  const lines = [];
  lines.push('OFFER TO PURCHASE');
  lines.push('Created: ' + new Date().toLocaleString());
  lines.push('\nPROPERTY');
  lines.push(' Address: ' + data.propertyAddress);
  if (data.legalDescription) lines.push(' Legal: ' + oneLine(data.legalDescription));
  if (data.parcelId) lines.push(' Parcel ID: ' + data.parcelId);
  lines.push('\nPARTIES');
  lines.push(' Buyers: ' + oneLine(data.buyers));
  lines.push(' Sellers: ' + oneLine(data.sellers));
  if (data.buyerBroker) lines.push(' Buyer Broker: ' + data.buyerBroker);
  if (data.sellerBroker) lines.push(' Seller Broker: ' + data.sellerBroker);
  lines.push('\nPRICE & FUNDING');
  lines.push(' Purchase Price: ' + money(data.purchasePrice));
  lines.push(' Earnest Money: ' + money(data.earnestMoney) + (data.earnestHolder?(' held by '+data.earnestHolder):''));
  lines.push(' Financing Type: ' + data.financingType);
  if (data.financingDetails) lines.push(' Financing Details: ' + oneLine(data.financingDetails));
  lines.push('\nDATES');
  lines.push(' Offer Date: ' + data.offerDate);
  lines.push(' Acceptance Deadline: ' + data.acceptanceDeadline);
  lines.push(' Closing Date: ' + data.closingDate);
  if (data.possessionDate) lines.push(' Possession Date: ' + data.possessionDate);
  lines.push('\nITEMS');
  lines.push(' Included: ' + (data.included || 'None specified'));
  lines.push(' Excluded: ' + (data.excluded || 'None specified'));
  lines.push('\nCONTINGENCIES');
  if (data.contingencies.length) {
    data.contingencies.forEach((c,i)=>{
      lines.push(` ${i+1}. ${c.type}${c.days?` (${c.days} days)`:''}${c.notes?`: ${oneLine(c.notes)}`:''}`);
    });
  } else lines.push(' None.');
  lines.push('\nADDITIONAL TERMS');
  lines.push(' ' + (oneLine(data.additionalTerms) || 'None.'));
  lines.push('\nSIGNATURES');
  lines.push(' ' + (oneLine(data.buyerSignatureLines)||'Buyer: __________________ Date: ________'));
  lines.push(' ' + (oneLine(data.sellerSignatureLines)||'Seller: __________________ Date: ________'));
  lines.push('\n--- Draft document. Not legal advice. ---');
  return lines.join('\n');
}

function oneLine(s='') { return s.replace(/\s+/g,' ').trim(); }
