const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = 5500;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown'
};

const server = http.createServer((req, res) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  
  let filePath = '.' + req.url.split('?')[0];
  if (filePath === './') {
    filePath = './index.html';
  }

  // If path ends with '/' or has no extension, check if it's a directory
  // and serve its index.html
  const tryServe = (fPath) => {
    fs.stat(fPath, (statErr, stats) => {
      if (!statErr && stats.isDirectory()) {
        // It's a directory — serve index.html inside it
        const dirIndex = path.join(fPath, 'index.html');
        fs.readFile(dirIndex, (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('index.html not found in directory');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
        return;
      }

      const extname = String(path.extname(fPath)).toLowerCase();
      const contentType = MIME_TYPES[extname] || 'application/octet-stream';

      fs.readFile(fPath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT' || error.code === 'EISDIR') {
            fs.readFile('./index.html', (err, indexContent) => {
              if (err) {
                res.writeHead(404);
                res.end('File not found and no index.html available');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(indexContent, 'utf-8');
              }
            });
          } else {
            res.writeHead(500);
            res.end('Server Error: ' + error.code);
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });
  };

  tryServe(filePath);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    PORT++;
    server.listen(PORT);
  } else {
    console.error('Server error:', e);
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`✅ SERVER RUNNING AT: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
