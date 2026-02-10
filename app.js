const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  xfwd: true,
  secure: false,
});

proxy.on('error', (err, req, res) => {
  if (res.headersSent) {
    return;
  }

  res.status(502).json({
    error: 'Unable to load target URL.',
    details: err.message,
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/load', (req, res) => {
  const rawUrl = (req.query.url || '').toString().trim();

  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing required "url" query parameter.' });
  }

  let normalized = rawUrl;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let targetUrl;
  try {
    targetUrl = new URL(normalized);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  const targetOrigin = targetUrl.origin;
  const targetPath = `${targetUrl.pathname}${targetUrl.search}` || '/';

  req.url = targetPath;

  proxy.web(req, res, {
    target: targetOrigin,
    prependPath: false,
    ignorePath: true,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
