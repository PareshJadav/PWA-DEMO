const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/pwa-demo/browser')));

// Serve all routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/pwa-demo/browser/index.html'));
});

const options = {
  key: fs.readFileSync('localhost.key'),
  cert: fs.readFileSync('localhost.crt')
};

const port = 4200;
https.createServer(options, app).listen(port, () => {
  console.log(`HTTPS server running on port ${port}`);
}); 