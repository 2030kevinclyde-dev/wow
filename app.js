const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Hidden proxy route with triple-click trigger
app.post('/hidden-proxy', (req, res) => {
    // Implement your proxy logic here
    // Example: res.json({ message: 'Proxy triggered!' });
});

let clickCount = 0;
let lastClickTime = 0;

// Placeholder for your triple-click detection logic
app.post('/triple-click', (req, res) => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 300) {
        clickCount++;
    } else {
        clickCount = 1;
    }
    lastClickTime = currentTime;

    if (clickCount === 3) {
        // Trigger the hidden proxy
        // e.g., make a request to /hidden-proxy
        clickCount = 0; // Reset after triggering
        res.json({ message: 'Triple-click detected! Triggering hidden proxy...' });
    } else {
        res.json({ message: 'Click registered.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
