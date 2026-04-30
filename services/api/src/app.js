const express = require('express');

const app = express();

app.use(express.json());

let products = [];
let nextId = 1;

function findProduct(id) {
  return products.find((product) => product.id === id);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = findProduct(Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.post('/api/products', (req, res) => {
  // BUG: intentionally broken for canary test
  throw new Error('Product creation is temporarily broken!');
});

app.put('/api/products/:id', (req, res) => {
  const product = findProduct(Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Not found' });

  product.name = req.body.name || '';
  product.updated_at = new Date();

  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = findProduct(id);
  if (!product) return res.status(404).json({ error: 'Not found' });

  products = products.filter((item) => item.id !== id);

  res.json({ message: 'Product deleted' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.resetStore = () => {
  products = [];
  nextId = 1;
};

module.exports = app;
// smoke-test-trigger 1777465401
// canary-test 1777524634
// unified-canary-test 1777528717
