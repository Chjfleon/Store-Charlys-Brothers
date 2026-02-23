const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Compression (gzip/brotli when supported)
app.use(compression());

// Serve static with cache headers for assets
app.use((req, res, next) => {
  // Set sensible caching for static assets
  if (req.url.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|json)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.url.match(/\.(html)$/)) {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

app.use(express.static(path.join(__dirname, '/')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Static server running on http://localhost:${PORT}/`));
