const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const PORT = process.env.PORT || 3002;
const INTERVAL = 30000;

async function checkProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    const products = await response.json();
    console.log(`[worker] Product count: ${products.length} (${new Date().toISOString()})`);
  } catch (err) {
    console.error(`[worker] Failed to fetch products: ${err.message}`);
  }
}

// Health check server
const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'worker', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Worker health check listening on port ${PORT}`);
});

// Run immediately, then on interval
checkProducts();
setInterval(checkProducts, INTERVAL);
// Notification system 1777906194
