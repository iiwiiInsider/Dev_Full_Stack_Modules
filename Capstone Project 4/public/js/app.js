import axios from 'https://cdn.jsdelivr.net/npm/axios@1.7.7/+esm';

const rootList = document.getElementById('root-list');
const picsList = document.getElementById('pics-list');
const moodboard = document.getElementById('moodboard');
const avatar = document.getElementById('avatar');
const btnShuffle = document.getElementById('shuffle');
const btnClear = document.getElementById('clear');
const density = document.getElementById('density');

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => (e.dataset[dk] = dv));
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (v != null) e.setAttribute(k, v);
  });
  children.forEach(c => e.append(c));
  return e;
}

async function fetchJSON(url) {
  const { data } = await axios.get(url);
  return data;
}

function isImage(item) {
  const name = (item.name || '').toLowerCase();
  return item.file && /(jpg|jpeg|png|gif|webp|bmp|tiff)$/.test(name);
}

function renderList(container, items, onOpen) {
  container.innerHTML = '';
  items.forEach(item => {
    const badge = item.folder ? 'folder' : isImage(item) ? 'image' : (item.file ? 'file' : 'item');
    const node = el('button', { class: 'item', title: item.name, onClick: () => onOpen(item) },
      el('span', { class: 'badge' }, badge), ' ', item.name);
    container.appendChild(node);
  });
}

async function loadRoot() {
  const data = await fetchJSON('/api/drive/root');
  renderList(rootList, data.value || [], openItem);
}
async function loadPictures() {
  const data = await fetchJSON('/api/drive/pictures');
  renderList(picsList, data.value || [], openItem);
}

let densityLimit = 60; // how many tiles to render
function randomSpan(min, max) { return Math.random() < 0.7 ? 1 : Math.floor(Math.random() * (max - min + 1)) + min; }

function addTile(item) {
  const w = randomSpan(2, 3);
  const h = randomSpan(2, 3);
  const tile = el('a', { class: 'tile', href: item.webUrl, target: '_blank', dataset: { w, h } },
    el('img', { src: `/api/thumb/${item.id}`, alt: item.name }));
  moodboard.appendChild(tile);
}

let lastImages = [];
async function openItem(item) {
  if (item.folder) {
    const data = await fetchJSON(`/api/drive/${item.id}/children`);
    const images = (data.value || []).filter(isImage);
    moodboard.innerHTML = '';
    lastImages = images;
    images.slice(0, densityLimit).forEach(addTile);
    if (!images.length) moodboard.textContent = 'No images in this folder.';
  } else if (isImage(item)) {
    moodboard.innerHTML = '';
    addTile(item);
    lastImages = [item];
  } else {
    window.open(item.webUrl, '_blank');
  }
}

if (rootList) {
  Promise.allSettled([loadRoot(), loadPictures()]);
}

// Controls
async function loadAvatar() {
  if (!avatar) return;
  try {
    const res = await fetch('/api/avatar');
    if (res.status === 204) return; // no avatar
    const blob = await res.blob();
    avatar.src = URL.createObjectURL(blob);
    avatar.hidden = false;
  } catch {}
}

function shuffleTiles() {
  if (!lastImages.length) return;
  moodboard.innerHTML = '';
  // shuffle copy
  const shuffled = [...lastImages].sort(() => Math.random() - 0.5);
  shuffled.slice(0, densityLimit).forEach(addTile);
}

function clearBoard() { moodboard.innerHTML = ''; }

btnShuffle?.addEventListener('click', shuffleTiles);
btnClear?.addEventListener('click', clearBoard);
density?.addEventListener('input', (e) => {
  densityLimit = parseInt(e.target.value || '60', 10);
});

loadAvatar();
