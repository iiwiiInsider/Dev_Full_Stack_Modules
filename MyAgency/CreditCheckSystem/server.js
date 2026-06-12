// Minimal static server for CreditCheckSystem
// No external dependencies; serves files from this directory.

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const base = __dirname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function send(res, status, data, contentType) {
  res.writeHead(status, { 'Content-Type': contentType || 'text/plain; charset=utf-8' });
  res.end(data);
}

const server = http.createServer((req, res) => {
  // Default to index.html
  let safePath = req.url.split('?')[0];
  if (safePath === '/' || !safePath) safePath = '/index.html';

  const filePath = path.join(base, path.normalize(safePath));

  // Prevent path traversal
  if (!filePath.startsWith(base)) {
    return send(res, 400, 'Bad Request');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return send(res, 404, 'Not Found');
      }
      return send(res, 500, 'Server Error');
    }
    const ext = path.extname(filePath);
    send(res, 200, data, mime[ext] || 'application/octet-stream');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
