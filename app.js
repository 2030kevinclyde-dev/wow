// app.js

const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const port = process.env.PORT || 3000;

// Create a proxy server
const proxy = httpProxy.createProxyServer();

// Proxy requests
app.use('/api', (req, res) => {
    proxy.web(req, res, { target: 'http://your-target-url.com' }, (err) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
