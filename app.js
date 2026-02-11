const express = require('express');
const bridgeLib = require('http-proxy');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const relay = bridgeLib.createProxyServer({
  changeOrigin: true,
  xfwd: true,
  secure: false,
});

relay.on('error', (err, req, res) => {
  if (res.headersSent) {
    return;
  }

  res.status(502).send('Unable to open that link.');
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/go', (req, res) => {
  const rawUrl = (req.query.url || '').toString().trim();

  if (!rawUrl) {
    return res.status(400).send('Missing url.');
  }

  let normalized = rawUrl;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let target;
  try {
    target = new URL(normalized);
  } catch {
    return res.status(400).send('Invalid URL.');
  }

  req.url = `${target.pathname}${target.search}` || '/';

  relay.web(req, res, {
    target: target.origin,
    prependPath: false,
    ignorePath: true,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
