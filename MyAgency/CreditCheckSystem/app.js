// Simple client-side tenant screening score (informational only)

// Currency formatter for South African Rand (ZAR)
const currencyFmt = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 2,
});

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function gradeFor(score) {
  if (score >= 85) return { grade: 'A', cls: 'good', label: 'Strong' };
  if (score >= 70) return { grade: 'B', cls: 'good', label: 'Good' };
  if (score >= 55) return { grade: 'C', cls: 'ok', label: 'Fair' };
  if (score >= 40) return { grade: 'D', cls: 'poor', label: 'Risky' };
  return { grade: 'F', cls: 'poor', label: 'High Risk' };
}

// Scoring engine: returns { score, components: [{name, points, details}] }
function computeScore(values) {
  const components = [];

  // 1) Income-to-Rent ratio (weight up to 35 points)
  const income = Number(values.monthlyIncome || 0);
  const rent = Number(values.monthlyRent || 0);
  let itrPoints = 0; // income to rent
  if (income > 0 && rent > 0) {
    const ratio = income / rent; // e.g., 3.0 = 3x rent
    if (ratio >= 4) itrPoints = 35; // excellent
    else if (ratio >= 3.5) itrPoints = 32;
    else if (ratio >= 3) itrPoints = 28;
    else if (ratio >= 2.5) itrPoints = 22;
    else if (ratio >= 2) itrPoints = 15;
    else if (ratio >= 1.5) itrPoints = 8;
    else itrPoints = 0;
    components.push({ name: 'Income-to-Rent', points: itrPoints, details: `Income is ${(ratio).toFixed(2)}x rent` });
  } else {
    components.push({ name: 'Income-to-Rent', points: 0, details: 'Missing income or rent' });
  }

  // 2) Debt-to-Income including rent (weight up to 20 points)
  const debt = Number(values.monthlyDebt || 0);
  let dtiPoints = 0;
  if (income > 0 && rent > 0) {
    const totalObligation = rent + debt;
    const dti = totalObligation / income; // lower is better
    if (dti <= 0.25) dtiPoints = 20;
    else if (dti <= 0.33) dtiPoints = 16;
    else if (dti <= 0.4) dtiPoints = 12;
    else if (dti <= 0.5) dtiPoints = 6;
    else dtiPoints = 0;
    components.push({ name: 'Debt-to-Income', points: dtiPoints, details: `DTI ${(dti*100).toFixed(0)}% (includes rent)` });
  } else {
    components.push({ name: 'Debt-to-Income', points: 0, details: 'Missing income or rent' });
  }

  // 3) Employment stability (up to 15 points)
  const status = values.employmentStatus || 'employed';
  const monthsAtJob = Number(values.monthsAtJob || 0);
  let empPoints = 0;
  if (status === 'employed' || status === 'self-employed') {
    if (monthsAtJob >= 24) empPoints = 15;
    else if (monthsAtJob >= 12) empPoints = 12;
    else if (monthsAtJob >= 6) empPoints = 8;
    else empPoints = 4;
  } else if (status === 'student') {
    empPoints = 6; // lower but acceptable with other strengths
  } else {
    empPoints = 0;
  }
  components.push({ name: 'Employment stability', points: empPoints, details: `${status}, ${monthsAtJob} mo.` });

  // 4) Housing history (up to 10 points)
  const monthsAtResidence = Number(values.monthsAtResidence || 0);
  let housingPoints = 0;
  if (monthsAtResidence >= 36) housingPoints = 10;
  else if (monthsAtResidence >= 24) housingPoints = 8;
  else if (monthsAtResidence >= 12) housingPoints = 6;
  else if (monthsAtResidence >= 6) housingPoints = 4;
  else housingPoints = 2;
  components.push({ name: 'Housing history', points: housingPoints, details: `${monthsAtResidence} mo.` });

  // 5) Payment behavior (up to 10 points)
  const latePayments = Number(values.latePayments || 0);
  let payPoints = 10;
  if (latePayments >= 3) payPoints = 0;
  else if (latePayments === 2) payPoints = 4;
  else if (latePayments === 1) payPoints = 7;
  components.push({ name: 'On-time payments', points: payPoints, details: `${latePayments} late in 12 mo.` });

  // 6) Negative events (eviction/bankruptcy) (up to -15 combined)
  let negPoints = 0;
  const ev = !!values.eviction;
  const bk = !!values.bankruptcy;
  if (ev) negPoints -= 10;
  if (bk) negPoints -= 5;
  components.push({ name: 'Negative events', points: negPoints, details: `${ev ? 'Eviction' : 'No eviction'}; ${bk ? 'Bankruptcy' : 'No bankruptcy'}` });

  // 7) References (up to 10)
  const refs = Number(values.references || 0);
  const refPoints = clamp(refs, 0, 3) * 3 + (refs >= 3 ? 1 : 0); // 0->0,1->3,2->6,3+->10
  components.push({ name: 'References', points: refPoints, details: `${refs} provided` });

  const raw = components.reduce((a, c) => a + c.points, 0);
  const score = clamp(Math.round(raw), 0, 100);
  return { score, components };
}

function serializeForm(form) {
  const data = new FormData(form);
  const obj = Object.fromEntries(data.entries());
  // checkboxes not in FormData when unchecked; ensure booleans
  obj.eviction = form.eviction.checked;
  obj.bankruptcy = form.bankruptcy.checked;
  obj.consent = form.consent.checked;
  return obj;
}

function updateLiveScore() {
  const form = document.getElementById('credit-form');
  const values = serializeForm(form);
  const { score } = computeScore(values);
  const liveScore = document.getElementById('liveScore');
  const liveGrade = document.getElementById('liveGrade');
  const { grade, cls, label } = gradeFor(score);
  liveScore.textContent = Number.isFinite(score) ? String(score) : '—';
  liveGrade.textContent = Number.isFinite(score) ? `${grade} (${label})` : '';
  liveGrade.className = `badge ${cls}`;
}

function renderReport(values, result) {
  const meta = document.getElementById('reportMeta');
  const breakdown = document.getElementById('scoreBreakdown');
  const summary = document.getElementById('scoreSummary');

  const addressParts = [values.address, values.city, values.state, values.zip].filter(Boolean).join(', ');
  meta.innerHTML = `
    <div><strong>Applicant:</strong> ${values.fullName || '—'}</div>
    <div><strong>Email:</strong> ${values.email || '—'} | <strong>Phone:</strong> ${values.phone || '—'}</div>
    <div><strong>Address:</strong> ${addressParts || '—'}</div>
    <div><strong>Employment:</strong> ${values.employmentStatus || '—'} • ${values.employer || '—'} • ${values.monthsAtJob || 0} mo.</div>
    <div><strong>Financials:</strong> Income ${currencyFmt.format(Number(values.monthlyIncome||0))} • Rent ${currencyFmt.format(Number(values.monthlyRent||0))} • Debt ${currencyFmt.format(Number(values.monthlyDebt||0))}</div>
  `;

  const { grade, cls, label } = gradeFor(result.score);
  summary.innerHTML = `
    <div class="value">${result.score}</div>
    <div class="badge ${cls} grade">${grade} – ${label}</div>
  `;

  breakdown.innerHTML = '';
  result.components.forEach(c => {
    const div = document.createElement('div');
    div.className = 'score-item';
    div.innerHTML = `<h4>${c.name} <span class="badge">${c.points >= 0 ? '+' : ''}${c.points}</span></h4><p>${c.details}</p>`;
    breakdown.appendChild(div);
  });

  document.getElementById('reportSection').classList.remove('hidden');
}

function setup() {
  const form = document.getElementById('credit-form');
  const resetBtn = document.getElementById('resetBtn');
  const printBtn = document.getElementById('printBtn');

  // Live updates on key fields
  ['monthlyIncome','monthlyRent','monthlyDebt','employmentStatus','monthsAtJob','monthsAtResidence','latePayments','references','eviction','bankruptcy']
    .forEach(id => document.getElementById(id).addEventListener('input', updateLiveScore));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const requiredIds = ['fullName','email','phone','monthlyIncome','monthlyRent','consent'];
    let firstInvalid = null;
    for (const id of requiredIds) {
      const el = document.getElementById(id);
      if (!el.checkValidity || !el.checkValidity()) {
        if (!firstInvalid) firstInvalid = el;
        el.reportValidity && el.reportValidity();
      }
    }
    if (firstInvalid) return;

    const values = serializeForm(form);
    const result = computeScore(values);
    renderReport(values, result);
    updateLiveScore();
    // Scroll to report
    document.getElementById('reportSection').scrollIntoView({ behavior: 'smooth' });
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    updateLiveScore();
    document.getElementById('reportSection').classList.add('hidden');
  });

  printBtn.addEventListener('click', () => window.print());

  updateLiveScore();
}

document.addEventListener('DOMContentLoaded', setup);
