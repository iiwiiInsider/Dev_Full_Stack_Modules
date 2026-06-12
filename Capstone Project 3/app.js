const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data store
let posts = [];
let nextId = 1;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers
function summarize(text, len = 180) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len).trimEnd() + '\u2026' : text;
}

function normalizeTags(input) {
  if (!input) return [];
  return Array.from(
    new Set(
      String(input)
        .split(/[,#\n\t ]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function readTime(text) {
  if (!text) return '0 min read';
  const words = String(text).trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function formatDate(d) {
  try {
    return d.toLocaleString();
  } catch {
    return new Date(d).toLocaleString();
  }
}

// Routes
app.get('/', (req, res) => {
  const { q = '', tag = '', sort = 'new', msg = '' } = req.query;
  let list = posts.slice();

  // Search filtering
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        p.body.toLowerCase().includes(needle) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.includes(needle)))
    );
  }

  // Tag filtering
  if (tag) {
    const target = String(tag).toLowerCase();
    list = list.filter((p) => Array.isArray(p.tags) && p.tags.includes(target));
  }

  // Sort by updatedAt
  list.sort((a, b) => {
    const da = new Date(a.updatedAt).getTime();
    const db = new Date(b.updatedAt).getTime();
    return sort === 'old' ? da - db : db - da;
  });

  // Collect all tags
  const tagSet = new Set();
  for (const p of posts) {
    if (Array.isArray(p.tags)) p.tags.forEach((t) => tagSet.add(t));
  }
  const allTags = Array.from(tagSet).sort();

  res.render('index', {
    title: 'Home',
    posts: list,
    summarize,
    readTime,
    formatDate,
    q,
    tag,
    sort,
    allTags,
    msg,
  });
});

// New post form
app.get('/posts/new', (req, res) => {
  res.render('new', { title: 'New Post' });
});

// Create post
app.post('/posts', (req, res) => {
  const { title, body, tags } = req.body;
  if (!title || !body) {
    return res
      .status(400)
      .render('new', { error: 'Title and body are required.', title, body, tags });
  }
  const now = new Date();
  const post = {
    id: nextId++,
    title: title.trim(),
    body: body.trim(),
    tags: normalizeTags(tags),
    createdAt: now,
    updatedAt: now,
  };
  posts.unshift(post);
  res.redirect(`/posts/${post.id}?msg=created`);
});

// View one post
app.get('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((p) => p.id === id);
  if (!post) return res.status(404).render('404');
  const { msg = '' } = req.query;
  res.render('show', { title: post.title, post, readTime, formatDate, msg });
});

// Edit form
app.get('/posts/:id/edit', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((p) => p.id === id);
  if (!post) return res.status(404).render('404');
  res.render('edit', { title: `Edit: ${post.title}`, post });
});

// Update
app.put('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((p) => p.id === id);
  if (!post) return res.status(404).render('404');
  const { title, body, tags } = req.body;
  if (!title || !body) {
    return res
      .status(400)
      .render('edit', {
        post: { ...post, title, body, tags },
        error: 'Title and body are required.',
      });
  }
  post.title = title.trim();
  post.body = body.trim();
  post.tags = normalizeTags(tags);
  post.updatedAt = new Date();
  res.redirect(`/posts/${post.id}?msg=updated`);
});

// Delete
app.delete('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const exists = posts.some((p) => p.id === id);
  posts = posts.filter((p) => p.id !== id);
  if (!exists) return res.status(404).render('404');
  res.redirect('/?msg=deleted');
});

// 404 fallback
app.use((req, res) => res.status(404).render('404'));

app.listen(PORT, () => {
  console.log(`Blog app listening on http://localhost:${PORT}`);
});
