const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 5050;
const workspaceRoot = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  // Determine relative path based on route
  let relPath = req.url;
  if (req.url === '/' || req.url === '/water' || req.url === '/water.html' || req.url === '/water_transition_demo.html') {
    relPath = '/scratch/prototype/water_transition_demo.html';
  } else if (req.url === '/butterfly' || req.url === '/butterfly.html') {
    relPath = '/scratch/prototype/butterfly.html';
  } else if (req.url === '/index' || req.url === '/index.html') {
    relPath = '/scratch/prototype/index.html';
  }

  // Resolve absolute path inside workspace root safely
  const filePath = path.normalize(path.join(workspaceRoot, relPath));
  
  // Prevent directory traversal security issues
  if (!filePath.startsWith(workspaceRoot)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if file exists and serve
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    // Determine content type
    let contentType = 'text/plain';
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.obj') contentType = 'text/plain'; // Serve OBJ as plain text

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading file');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`🚀 Prototype Server running at ${url}`);
  console.log(`Press Ctrl+C to stop the server.`);
  
  // Open in browser based on OS
  let command;
  if (process.platform === 'win32') {
    command = `start ${url}`;
  } else if (process.platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }
  
  exec(command, (err) => {
    if (err) {
      console.error(`Failed to open browser automatically: ${err.message}`);
    } else {
      console.log(`Opened ${url} in your default browser.`);
    }
  });
});
