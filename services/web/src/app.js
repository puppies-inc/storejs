const express = require('express');
const path = require('path');

const app = express();

const API_URL = process.env.API_URL || 'http://localhost:3001';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

function setNotice(req, message) {
  req.app.locals.notice = message;
}

app.use((req, res, next) => {
  res.locals.notice = req.app.locals.notice || null;
  req.app.locals.notice = null;
  next();
});

async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok && response.status === 404) return null;
  return response.json();
}

async function apiPost(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.json();
}

async function apiPut(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.json();
}

async function apiDelete(path) {
  const response = await fetch(`${API_URL}${path}`, { method: 'DELETE' });
  return response.json();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'web', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.redirect('/products');
});

app.get('/products', async (req, res, next) => {
  try {
    const products = await apiGet('/api/products');
    res.render('products/index', { products });
  } catch (err) {
    next(err);
  }
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/products/new', (req, res) => {
  res.render('products/new', { product: { name: '' }, errors: [] });
});

app.post('/products', async (req, res, next) => {
  try {
    const product = await apiPost('/api/products', { name: req.body.name || '' });
    setNotice(req, 'Product was successfully created.');
    res.redirect(`/products/${product.id}`);
  } catch (err) {
    next(err);
  }
});

app.get('/products/:id', async (req, res, next) => {
  try {
    const product = await apiGet(`/api/products/${req.params.id}`);
    if (!product) return res.status(404).send('Not Found');
    res.render('products/show', { product });
  } catch (err) {
    next(err);
  }
});

app.get('/products/:id/edit', async (req, res, next) => {
  try {
    const product = await apiGet(`/api/products/${req.params.id}`);
    if (!product) return res.status(404).send('Not Found');
    res.render('products/edit', { product, errors: [] });
  } catch (err) {
    next(err);
  }
});

app.post('/products/:id', async (req, res, next) => {
  try {
    const product = await apiPut(`/api/products/${req.params.id}`, { name: req.body.name || '' });
    if (!product) return res.status(404).send('Not Found');
    setNotice(req, 'Product was successfully updated.');
    res.redirect(`/products/${product.id}`);
  } catch (err) {
    next(err);
  }
});

app.post('/products/:id/delete', async (req, res, next) => {
  try {
    await apiDelete(`/api/products/${req.params.id}`);
    setNotice(req, 'Product was successfully deleted.');
    res.redirect('/products');
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

module.exports = app;
