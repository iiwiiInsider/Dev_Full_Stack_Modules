const APPS = [
  {
    id: 'sales-mandate',
    name: 'Sales Mandate Creator',
    defaultUrl: 'http://localhost:3000',
    health: '/health',
    description: 'Generate and download Sales Mandate PDF documents.',
    icon: '◇'
  },
  {
    id: 'sales-listing',
    name: 'Sales Listing Creator',
    defaultUrl: 'http://localhost:3001',
    health: '/health',
    description: 'Create property sales listing PDFs with images and details.',
    icon: '◇'
  },
  {
    id: 'rental-mandate',
    name: 'Rental Mandate Creator',
    defaultUrl: 'http://localhost:3003', // orchestrated to 3003 to avoid conflict
    health: '/health',
    description: 'Create rental mandate PDFs for landlords and agents.',
    icon: '◇'
  },
  {
    id: 'rental-listing',
    name: 'Rental Listing Creator',
    defaultUrl: 'http://localhost:3002',
    health: '/health',
    description: 'Generate rental listing PDFs, including rents and deposits.',
    icon: '◇'
  },
  {
    id: 'otp',
    name: 'Offer To Purchase Creator (OTP)',
    defaultUrl: '/otp/',
    description: 'Static OTP creator. Opens locally without a server.',
    icon: '◇',
    isStatic: true
  }
];

const $ = (s, r=document) => r.querySelector(s);
const el = (t, props={}) => Object.assign(document.createElement(t), props);

function getStoredUrl(id){
  return localStorage.getItem(`tk.url.${id}`) || null;
}
function setStoredUrl(id, url){
  localStorage.setItem(`tk.url.${id}` , url);
}

async function checkStatus(url, health){
  try {
    const res = await fetch(url.replace(/\/$/, '') + health, { method:'GET' });
    if(!res.ok) throw new Error('HTTP '+res.status);
    return { status: 'ok' };
  } catch (e) {
    return { status: 'down', error: e?.message || String(e) };
  }
}

function renderCards(){
  const wrap = $('#cards');
  wrap.innerHTML = '';
  APPS.forEach(app => {
    const url = app.isStatic ? app.defaultUrl : (getStoredUrl(app.id) || app.defaultUrl);
    const card = el('div', { className: 'card', id: `card-${app.id}` });

    const header = el('div', { className: 'row' });
    const titleBox = el('div');
    titleBox.appendChild(el('h3', { textContent: `${app.icon} ${app.name}` }));
    titleBox.appendChild(el('p', { className: 'muted', textContent: app.description }));

    const controls = el('div', { className: 'controls' });
  const edit = el('button', { className: 'icon-btn', title: 'Set custom URL', textContent: '✎' });
  const open = el('button', { className: 'icon-btn', title: 'Open', textContent: '▸' });
    controls.append(edit, open);

    header.append(titleBox, controls);

    const status = el('div', { className: 'status' });
    const dot = el('span', { className: 'dot warn' });
  const badge = el('span', { className: 'badge', textContent: 'Checking…' });
    status.append(dot, badge);

    const urlRow = el('div', { className: 'row' });
    const urlText = el('div', { className: 'url', textContent: url });
    urlRow.append(urlText);

    card.append(header, status, urlRow);
    wrap.append(card);

    // actions
    edit.addEventListener('click', () => {
      if(app.isStatic){
        alert('Static app path is fixed in this dashboard.');
        return;
      }
      const val = prompt('Enter the base URL for this service', url);
      if(val){ setStoredUrl(app.id, val.trim()); urlText.textContent = val.trim(); recheck(card, app, val.trim(), dot, badge); }
    });
    open.addEventListener('click', () => openInPanel(app, url));

    // initial status
    if(app.isStatic){ dot.className = 'dot ok'; badge.textContent = 'Available (local)'; }
    else { recheck(card, app, url, dot, badge); }
  });
}

async function recheck(card, app, url, dot, badge){
  dot.className = 'dot warn'; badge.textContent = 'checking…';
  const r = await checkStatus(url, app.health);
  if(r.status === 'ok'){ dot.className = 'dot ok'; badge.textContent = 'Online'; }
  else { dot.className = 'dot err'; badge.textContent = 'Offline'; }
}

function openInPanel(app, url){
  const iframe = $('#preview');
  const panelTitle = $('#panel-title');
  const panelUrl = $('#panel-url');
  const openNew = $('#open-new');

  const target = app.isStatic ? app.defaultUrl : (getStoredUrl(app.id) || url || app.defaultUrl);
  panelTitle.textContent = app.name;
  panelUrl.textContent = target;
  openNew.disabled = false;
  openNew.onclick = () => window.open(target, '_blank');
  iframe.src = target;
  const panel = document.querySelector('.panel');
  panel.classList.remove('panel-closed');
  panel.classList.add('panel-open');
  panel.style.display = 'flex';
  // move focus into the panel for keyboard users
  const prevFocus = document.activeElement;
  panel.setAttribute('data-prev-focus', prevFocus?.id || '');
  iframe.focus();
}

function wireUI(){
  $('#recheck').addEventListener('click', renderCards);
  $('#open-all').addEventListener('click', () => {
    APPS.forEach(a => {
      const base = a.isStatic ? a.defaultUrl : (getStoredUrl(a.id) || a.defaultUrl);
      if(base) window.open(base, '_blank');
    });
  });
  // Theme toggle
  const toggle = $('#theme-toggle');
  const pref = localStorage.getItem('tk.theme') || 'auto';
  applyTheme(pref);
  toggle.textContent = (pref === 'dark') ? '☀️' : '🌙';
  toggle.addEventListener('click', () => {
    const now = document.documentElement.classList.contains('theme-dark') ? 'auto' : 'dark';
    applyTheme(now);
    localStorage.setItem('tk.theme', now);
    toggle.textContent = (now === 'dark') ? '☀️' : '🌙';
    toggle.setAttribute('aria-pressed', (now === 'dark') ? 'true' : 'false');
  });
  $('#close-panel').addEventListener('click', () => {
    closePanel();
  });
}

function closePanel(){
  const panel = document.querySelector('.panel');
  if(!panel) return;
  const iframe = $('#preview');
  iframe.src = 'about:blank';
  panel.classList.remove('panel-open');
  panel.classList.add('panel-closed');
  // hide visually after animation
  setTimeout(() => { if(panel.classList.contains('panel-closed')) panel.style.display = 'none'; }, 320);
  // restore focus if possible
  const prevId = panel.getAttribute('data-prev-focus');
  if(prevId){ const el = document.getElementById(prevId); if(el) el.focus(); }
}

// Close panel with Escape key for convenience
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    const panel = document.querySelector('.panel');
    if(panel && panel.classList.contains('panel-open')) closePanel();
  }
});

// OTP is served by our local server under /otp/
async function prepareOtpProxy(){ /* no-op, URL set to /otp/ */ }

(async function init(){
  await prepareOtpProxy();
  wireUI();
  renderCards();
})();

function applyTheme(mode){
  const root = document.documentElement;
  if(mode === 'dark') root.classList.add('theme-dark');
  else root.classList.remove('theme-dark');
}
