# Book Tracker (Capstone Project 5)

A personal library tracker web app built with Express, PostgreSQL, and the Open Library APIs. Search for books, view cover & metadata, and maintain a list of books you've read (with status, rating, notes, and dates).

## Features
- Search books by title / author / ISBN (Open Library Search API)
- Auto-fetch book cover via Open Library Covers API
- Add books to your local PostgreSQL `books` table
- Mark read / unread, set rating (1-5), personal notes, and date finished
- Responsive, accessible, modern UI (mobile-first)
- Sorting & basic filtering
- Graceful error handling & logging

## Tech
- Node.js + Express + EJS templates
- PostgreSQL (`pg` driver)
- Modern CSS (no heavy framework) + a little utility flex/grid
- `node-fetch` for API calls
- `dotenv` for configuration
- `morgan` for concise request logging
- `method-override` to support PUT/DELETE from forms

## Environment
Copy `.env.example` to `.env` and adjust as needed.

```
PGHOST=localhost
PGPORT=5432
PGDATABASE=private_library
PGUSER=postgres
PGPASSWORD=ylQQFMl^mrQ8Ls3
PORT=3000
```

## Database
Ensure database `private_library` exists and contains table `books`.

```sql
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  open_library_id TEXT,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  published_year INT,
  isbn TEXT,
  status TEXT DEFAULT 'unread', -- unread|reading|read
  rating INT CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  date_added TIMESTAMP DEFAULT NOW(),
  date_finished DATE
);
CREATE INDEX IF NOT EXISTS idx_books_title ON books USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_books_author ON books USING gin (to_tsvector('english', author));
```

## Install & Run

```
npm install
npm run dev
```
Visit: http://localhost:3000

## Open Library APIs
- Search: `https://openlibrary.org/search.json?q=QUERY&limit=20`
- Covers: `https://covers.openlibrary.org/b/id/{coverID}-{size}.jpg`

## Future Enhancements
- User auth & multi-user separation
- Tagging & advanced filters
- Bulk import/export

## License
MIT
