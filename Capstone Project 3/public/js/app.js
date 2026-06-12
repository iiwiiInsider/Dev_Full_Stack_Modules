// Reveal-on-scroll animations
// Reveal-on-scroll animations
(function(){
	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (prefersReduced) return;

	const els = document.querySelectorAll('.reveal');
	if (!els.length) return;

	const io = new IntersectionObserver((entries) => {
		for (const entry of entries){
			if (entry.isIntersecting){
				entry.target.classList.add('in');
				io.unobserve(entry.target);
			}
		}
	}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

	els.forEach(el => io.observe(el));
})();

// Theme toggle (respects system, stores preference)
(function(){
	const btn = document.getElementById('themeToggle');
	if (!btn) return;
	const KEY = 'theme';
	const apply = (mode) => {
		document.documentElement.dataset.theme = mode;
	};
	const saved = localStorage.getItem(KEY);
	if (saved) apply(saved);
	btn.addEventListener('click', () => {
		const next = (document.documentElement.dataset.theme === 'dark') ? 'light' : 'dark';
		apply(next);
		localStorage.setItem(KEY, next);
	});
})();

// Char counters and autosave draft (title/body)
(function(){
	const title = document.getElementById('title');
	const body = document.getElementById('body');
	const tags = document.getElementById('tags');
	if (!title && !body) return;

	const updateCount = (input, key) => {
		const el = document.querySelector(`[data-count-for="${key}"]`);
		if (el && input) el.textContent = String(input.value.length);
	};
	updateCount(title, 'title');
	updateCount(body, 'body');
	title && title.addEventListener('input', () => updateCount(title, 'title'));
	body && body.addEventListener('input', () => updateCount(body, 'body'));

	const isEdit = /\/posts\/(\d+)\/(edit)?/.test(location.pathname);
	const draftKey = isEdit ? `draft:${location.pathname}` : 'draft:/posts/new';
	const form = title?.form || body?.form;
	if (form){
		// Load draft
		const draft = localStorage.getItem(draftKey);
		if (draft){
			try{
				const data = JSON.parse(draft);
				if (title && !title.value) title.value = data.title || '';
				if (body && !body.value) body.value = data.body || '';
				if (tags && !tags.value) tags.value = data.tags || '';
			}catch{}
		}
		// Save draft
		const save = () => {
			const data = { title: title?.value || '', body: body?.value || '', tags: tags?.value || '' };
			localStorage.setItem(draftKey, JSON.stringify(data));
		};
		title && title.addEventListener('input', save);
		body && body.addEventListener('input', save);
		tags && tags.addEventListener('input', save);
		form.addEventListener('submit', () => localStorage.removeItem(draftKey));
	}
})();

// Copy post link
(function(){
	const btn = document.querySelector('[data-copy-link]');
	if (!btn) return;
	btn.addEventListener('click', async () => {
		try{
			await navigator.clipboard.writeText(location.href);
			showToast('Link copied');
		}catch{
			showToast('Copy failed');
		}
	});
})();

// Toast helper
function showToast(text){
	let t = document.createElement('div');
	t.className = 'toast';
	t.textContent = text;
	document.body.appendChild(t);
	setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(4px)'; }, 1600);
	setTimeout(() => t.remove(), 2200);
}
