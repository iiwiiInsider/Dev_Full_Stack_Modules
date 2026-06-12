require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const { Pool } = require('pg');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Postgres pool
const connectionOptions = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
} : (() => {
  const cfg = {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'postgres',
  database: process.env.PGDATABASE || 'private_libary'
  };
  if (process.env.PGPASSWORD) cfg.password = String(process.env.PGPASSWORD);
  return cfg;
})();

async function createDbIfMissing(){
  const targetDb = connectionOptions.database;
  if (!targetDb) return;
  // Try a temp connection to the target DB to see if it exists
  try {
    const testPool = new Pool(connectionOptions);
    await testPool.query('SELECT 1');
    await testPool.end();
    return; // exists
  } catch (e) {
    if (!/does not exist/i.test(e.message)) return; // other error
    // Connect to default postgres DB and create
    const adminCfg = { ...connectionOptions, database: 'postgres' };
    const adminPool = new Pool(adminCfg);
    try {
      await adminPool.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`Created database ${targetDb}`);
    } catch (ce) {
      if (!/already exists/i.test(ce.message)) {
        console.error('Failed to create database', ce.message);
      }
    } finally { await adminPool.end(); }
  }
}

// Ensure DB then create main pool
let pool; (async () => { await createDbIfMissing(); pool = new Pool(connectionOptions); ensureSchema().then(()=>console.log('Schema ready')).catch(e=>console.error('Schema init failed (continuing to run)', e.message)); })();

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Ensure table exists
async function ensureSchema(){
  await pool.query(`CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    open_library_id TEXT,
    title TEXT NOT NULL,
    author TEXT,
    cover_url TEXT,
    published_year INT,
    isbn TEXT,
    status TEXT DEFAULT 'unread',
    rating INT CHECK (rating BETWEEN 1 AND 5),
    notes TEXT,
    date_added TIMESTAMP DEFAULT NOW(),
    date_finished DATE
  );`);
}
// (schema init triggered after pool creation above)

// Utility: sanitize rating to null/1..5
function normalizeRating(r) { if(!r) return null; const n = Number(r); return (n>=1 && n<=5)?n:null; }

// Home - list books with optional search/filter
app.get('/', async (req, res, next) => {
  const { q, status, sort } = req.query;
  const values = [];
  let whereClauses = [];
  if (q) {
    values.push(`%${q.toLowerCase()}%`);
    whereClauses.push('(LOWER(title) LIKE $' + values.length + ' OR LOWER(author) LIKE $' + values.length + ')');
  }
  if (status) {
    values.push(status);
    whereClauses.push('status = $' + values.length);
  }
  let sql = 'SELECT * FROM books';
  if (whereClauses.length) sql += ' WHERE ' + whereClauses.join(' AND ');
  let order = 'date_added DESC';
  if (sort === 'title') order = 'LOWER(title) ASC';
  else if (sort === 'author') order = 'LOWER(author) ASC NULLS LAST';
  else if (sort === 'rating') order = 'rating DESC NULLS LAST';
  sql += ' ORDER BY ' + order;
  try {
  const { rows } = await pool.query(sql, values);
  res.render('index', { books: rows, query: q || '', status: status || '', sort: sort || '', error: null });
  } catch (err) { next(err); }
});

// Search Open Library API (AJAX endpoint)
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ docs: [] });
  try {
    const url = 'https://openlibrary.org/search.json?q=' + encodeURIComponent(q) + '&limit=20';
    const response = await fetch(url, { timeout: 10000 });
    if (!response.ok) throw new Error('Open Library error: ' + response.status);
    const data = await response.json();
    const simplified = (data.docs || []).map(d => ({
      key: d.key,
      title: d.title,
      author: (d.author_name && d.author_name[0]) || '',
      year: d.first_publish_year,
      cover_i: d.cover_i,
      isbn: d.isbn ? d.isbn[0] : null
    }));
    res.json({ docs: simplified });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Add book
app.post('/books', async (req, res, next) => {
  try {
    const { open_library_id, title, author, cover_i, published_year, isbn } = req.body;
    const cover_url = cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg` : null;
    await pool.query(`INSERT INTO books(open_library_id, title, author, cover_url, published_year, isbn) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`, [open_library_id, title, author, cover_url, published_year || null, isbn]);
    res.redirect('/');
  } catch (err) { next(err); }
});

// Update status/rating/notes
app.put('/books/:id', async (req, res, next) => {
  try {
    const { status, rating, notes, date_finished } = req.body;
    await pool.query(`UPDATE books SET status=$1, rating=$2, notes=$3, date_finished=$4 WHERE id=$5`, [status, normalizeRating(rating), notes || null, date_finished || null, req.params.id]);
    res.redirect('/');
  } catch (err) { next(err); }
});

// Delete
app.delete('/books/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM books WHERE id=$1', [req.params.id]);
    res.redirect('/');
  } catch (err) { next(err); }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false }); }
});

// 404
app.use((req, res) => { res.status(404).render('404'); });

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line
  console.error('Error:', err);
  res.status(500);
  if (req.accepts('html')) return res.render('error', { error: err });
  res.json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, () => {
  console.log(`Book Tracker running http://localhost:${PORT}`);
});
server.on('error', (e)=>{
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Close the other process or set PORT env.`);
  } else {
    console.error('Server error', e);
  }
});
