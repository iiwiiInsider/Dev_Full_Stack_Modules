import { buildOfferData, offerHtml, offerPlainText } from './template.js';

const form = document.getElementById('otp-form');
const contingenciesList = document.getElementById('contingencies-list');
const addBtn = document.getElementById('add-contingency');
const typeSel = document.getElementById('contingency-type');
const daysInput = document.getElementById('contingency-days');
const notesInput = document.getElementById('contingency-notes');
const previewBtn = document.getElementById('preview-html');
const previewDialog = document.getElementById('preview-dialog');
const previewContent = document.getElementById('preview-content');
const closePreviewBtn = document.getElementById('close-preview');
const printPreviewBtn = document.getElementById('print-preview');
const saveDraftBtn = document.getElementById('save-draft');
const loadDraftBtn = document.getElementById('load-draft');

addBtn.addEventListener('click', () => {
  if (!typeSel.value) return;
  const row = document.createElement('div');
  row.className = 'cont-row';
  row.dataset.type = typeSel.value;
  row.dataset.days = daysInput.value;
  row.dataset.notes = notesInput.value;
  row.innerHTML = `<span class="type">${escapeHtml(typeSel.value)}</span>` +
    (daysInput.value?` <small>${daysInput.value} days</small>`:'') +
    (notesInput.value?` <small>${escapeHtml(notesInput.value)}</small>`:'') +
    ' <button type="button" aria-label="Remove">✕</button>';
  row.querySelector('button').addEventListener('click', ()=> row.remove());
  contingenciesList.appendChild(row);
  daysInput.value = '';
  notesInput.value = '';
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = buildOfferData(form);
  generatePdf(data);
});

previewBtn.addEventListener('click', () => {
  const data = buildOfferData(form);
  previewContent.innerHTML = offerHtml(data);
  previewDialog.showModal();
});

closePreviewBtn?.addEventListener('click', ()=> previewDialog.close());
printPreviewBtn?.addEventListener('click', ()=> window.print());

saveDraftBtn.addEventListener('click', () => {
  const data = buildOfferData(form);
  localStorage.setItem('otpDraft', JSON.stringify(data));
  flash('Draft saved');
});

loadDraftBtn.addEventListener('click', () => {
  const raw = localStorage.getItem('otpDraft');
  if (!raw) return flash('No draft found', true);
  try {
    const data = JSON.parse(raw);
    Object.entries(data).forEach(([k,v]) => {
      const field = form.elements[k];
      if (!field) return; // skip contingencies etc.
      if (field instanceof RadioNodeList) {
        if (field.length && field[0].type === 'textarea') field[0].value = v; // improbable
        else if (field.value !== undefined) field.value = v;
      } else if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT' || field.tagName === 'SELECT') {
        field.value = v;
      }
    });
    if (Array.isArray(data.contingencies)) {
      contingenciesList.innerHTML = '';
      data.contingencies.forEach(c => addContingencyFromData(c));
    }
    flash('Draft loaded');
  } catch (err) {
    console.error(err);
    flash('Failed to load draft', true);
  }
});

function addContingencyFromData(c) {
  const row = document.createElement('div');
  row.className = 'cont-row';
  row.dataset.type = c.type;
  row.dataset.days = c.days;
  row.dataset.notes = c.notes;
  row.innerHTML = `<span class="type">${escapeHtml(c.type)}</span>` +
    (c.days?` <small>${c.days} days</small>`:'') +
    (c.notes?` <small>${escapeHtml(c.notes)}</small>`:'') +
    ' <button type="button" aria-label="Remove">✕</button>';
  row.querySelector('button').addEventListener('click', ()=> row.remove());
  contingenciesList.appendChild(row);
}

function escapeHtml(str='') {
  return String(str).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

async function generatePdf(data) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    flash('PDF lib not loaded', true);
    return;
  }
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const text = offerPlainText(data);
  const lineHeight = 14;
  const left = 48;
  const topStart = 60;
  const maxWidth = 515; // letter page width 612 - margins
  const lines = wrapText(doc, text, maxWidth);
  let y = topStart;
  doc.setFont('Helvetica', '');
  doc.setFontSize(11);
  lines.forEach(line => {
    if (y > 760) { doc.addPage(); y = topStart; }
    doc.text(line, left, y);
    y += lineHeight;
  });
  const filename = `Offer-${(data.propertyAddress||'property').replace(/[^a-z0-9]+/gi,'_')}.pdf`;
  doc.save(filename);
  flash('PDF generated');
}

function wrapText(doc, text, maxWidth) {
  const paragraphs = text.split(/\n/);
  const wrapped = [];
  paragraphs.forEach(p => {
    if (p.trim() === '') { wrapped.push(''); return; }
    let line = '';
    p.split(/\s+/).forEach(word => {
      const test = line ? line + ' ' + word : word;
      if (doc.getTextWidth(test) > maxWidth) {
        if (line) wrapped.push(line);
        line = word;
      } else line = test;
    });
    if (line) wrapped.push(line);
  });
  return wrapped;
}

function flash(msg, isError=false) {
  const div = document.createElement('div');
  div.textContent = msg;
  div.style.cssText = `position:fixed;bottom:16px;right:16px;padding:10px 14px;border-radius:8px;font:500 .85rem 'Inter',sans-serif;background:${isError?'#b91c1c':'#2563eb'};color:#fff;box-shadow:0 4px 14px -2px rgba(0,0,0,.4);opacity:0;transform:translateY(6px);transition:.3s`;
  document.body.appendChild(div);
  requestAnimationFrame(()=>{div.style.opacity='1';div.style.transform='translateY(0)';});
  setTimeout(()=>{div.style.opacity='0';div.style.transform='translateY(6px)';div.addEventListener('transitionend',()=>div.remove(),{once:true});}, 2600);
}

