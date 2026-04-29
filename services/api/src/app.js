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
  const now = new Date();
  const product = {
    id: nextId,
    name: req.body.name || '',
    created_at: now,
    updated_at: now
  };

  nextId += 1;
  products.push(product);

  res.status(201).json(product);
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
// batch1 test 1777377880
// batch1 retry 1777378114
// merge-test 1777380202
// sequential-test 1777381056
// webhook-test 1777383027
// discord-notify-test 1777383656
// blue-green test 1777397902
// bluegreen-v3-test1 1777399769
// bg-v3-retest 1777400060
// test-fail 1777448824
// dash0-verify-test 1777449432
