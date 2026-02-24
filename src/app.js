const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

let products = [];
let nextId = 1;

function setNotice(req, message) {
  req.app.locals.notice = message;
}

app.use((req, res, next) => {
  res.locals.notice = req.app.locals.notice || null;
  req.app.locals.notice = null;
  next();
});

function findProduct(id) {
  return products.find((product) => product.id === id);
}

app.get('/', (req, res) => {
  res.redirect('/products');
});

app.get('/products', (req, res) => {
  res.render('products/index', { products });
});

app.get('/products/new', (req, res) => {
  res.render('products/new', { product: { name: '' }, errors: [] });
});

app.post('/products', (req, res) => {
  const now = new Date();
  const product = {
    id: nextId,
    name: req.body.name || '',
    created_at: now,
    updated_at: now
  };

  nextId += 1;
  products.push(product);

  setNotice(req, 'Product was successfully created.');
  res.redirect(`/products/${product.id}`);
});

app.get('/products/:id', (req, res, next) => {
  const product = findProduct(Number(req.params.id));
  if (!product) return next();
  res.render('products/show', { product });
});

app.get('/products/:id/edit', (req, res, next) => {
  const product = findProduct(Number(req.params.id));
  if (!product) return next();
  res.render('products/edit', { product, errors: [] });
});

app.post('/products/:id', (req, res, next) => {
  const product = findProduct(Number(req.params.id));
  if (!product) return next();

  product.name = req.body.name || '';
  product.updated_at = new Date();

  setNotice(req, 'Product was successfully updated.');
  res.redirect(`/products/${product.id}`);
});

app.post('/products/:id/delete', (req, res, next) => {
  const id = Number(req.params.id);
  const product = findProduct(id);
  if (!product) return next();

  products = products.filter((item) => item.id !== id);

  setNotice(req, 'Product was successfully deleted.');
  res.redirect('/products');
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.resetStore = () => {
  products = [];
  nextId = 1;
  app.locals.notice = null;
};

module.exports = app;
