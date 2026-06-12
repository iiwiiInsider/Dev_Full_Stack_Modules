const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsEl = document.getElementById('searchResults');
const themeToggle = document.getElementById('themeToggle');

function bookCard(b){
  const cover = b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : '';
  return `<div class="result-item">
    ${cover?`<img src="${cover}" alt="Cover of ${b.title}" style="width:100%;height:200px;object-fit:cover;border-radius:6px;" loading="lazy"/>`:`<div class='cover-placeholder' style='height:200px;border:1px dashed #555;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.7rem;opacity:.6;'>No Cover</div>`}
    <strong style="font-size:.8rem;">${escapeHtml(b.title)}</strong>
    <span class="small muted">${escapeHtml(b.author||'')}</span>
    <button class="btn btn-small" data-add='${JSON.stringify(b).replace(/'/g,"&apos;")}' aria-label="Add ${escapeHtml(b.title)}">Add</button>
  </div>`;
}

function escapeHtml(str){ return (str||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c])); }

async function performSearch(){
  const q = searchInput.value.trim();
  if(!q){ resultsEl.innerHTML=''; return; }
  resultsEl.innerHTML = '<div class="placeholder" style="height:8px;border-radius:4px;width:60%;"></div>';
  try {
    const res = await fetch('/api/search?q='+encodeURIComponent(q));
    const data = await res.json();
    resultsEl.innerHTML = data.docs.map(bookCard).join('');
  } catch(e){
    resultsEl.innerHTML = '<div class="alert error">Search failed.</div>';
  }
}

searchBtn?.addEventListener('click', performSearch);
searchInput?.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); performSearch(); }});

resultsEl?.addEventListener('click', e=>{
  const btn = e.target.closest('button[data-add]');
  if(!btn) return;
  const data = JSON.parse(btn.getAttribute('data-add'));
  const form = document.createElement('form');
  form.method='POST'; form.action='/books';
  ['key','title','author','cover_i','year','isbn'].forEach(k=>{
    const inp = document.createElement('input'); inp.type='hidden';
    inp.name = ({key:'open_library_id', year:'published_year'}[k]) || k;
    inp.value = data[k] || '';
    form.appendChild(inp);
  });
  document.body.appendChild(form); form.submit();
});

// Theme toggle
(function initTheme(){
  const stored = localStorage.getItem('theme');
  if(stored) document.documentElement.setAttribute('data-theme', stored);
})();

themeToggle?.addEventListener('click', ()=>{
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', current);
  localStorage.setItem('theme', current);
});
