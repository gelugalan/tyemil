const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const shoesRouter = require('./routes/shoes');
const usersRouter = require('./routes/users');

const hostname = '127.0.0.1';
const port = 5000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;


  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }


  if (shoesRouter(req, res, pathname, query) !== false) return;


  if (usersRouter(req, res, pathname) !== false) return;


  if (req.url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', req.url);
    fs.createReadStream(filePath)
      .on('error', () => {
        res.writeHead(404); res.end('Not found');
      })
      .pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, hostname, () => {
  console.log(`🚀 Serverul rulează la http://${hostname}:${port}`);
});
