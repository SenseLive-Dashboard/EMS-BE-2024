const express = require('express');
const cors = require('cors');
const router = require('./routes');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5100;

// Load SSL certificate files
const privateKey = fs.readFileSync(path.resolve('/etc/letsencrypt/live/senso.senselive.in/privkey.pem'), 'utf8');
const fullchain = fs.readFileSync(path.resolve('/etc/letsencrypt/live/senso.senselive.in/fullchain.pem'), 'utf8');
const credentials = { key: privateKey, cert: fullchain };

// Middleware
app.use(cors());
app.use(express.json());

// Use the router for handling routes
app.use('/ems', router);
app.get('/ems/test', (req, res) => {
  console.log('Received GET request to /ems/test');
  res.send('Response from Node.js server');
});

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start server
httpsServer.listen(port, () => {
  console.log(`HTTPS server listening on port ${port}`);
});
