const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

let items = [];
let nextId = 1;

function setNotice(req, message) {
  req.app.locals.notice = message;
}

app.use((req, res, next) => {
  res.locals.notice = req.app.locals.notice || null;
  req.app.locals.notice = null;
  next();
});

function findItem(id) {
  return items.find((item) => item.id === id);
}

app.get('/', (req, res) => {
  res.redirect('/items');
});

app.get('/items', (req, res) => {
  res.render('items/index', { items });
});

app.get('/items/new', (req, res) => {
  res.render('items/new', { item: { name: '' }, errors: [] });
});

app.post('/items', (req, res) => {
  const now = new Date();
  const item = {
    id: nextId,
    name: req.body.name || '',
    created_at: now,
    updated_at: now
  };

  nextId += 1;
  items.push(item);

  setNotice(req, 'Item was successfully created.');
  res.redirect(`/items/${item.id}`);
});

app.get('/items/:id', (req, res, next) => {
  const item = findItem(Number(req.params.id));
  if (!item) return next();
  res.render('items/show', { item });
});

app.get('/items/:id/edit', (req, res, next) => {
  const item = findItem(Number(req.params.id));
  if (!item) return next();
  res.render('items/edit', { item, errors: [] });
});

app.post('/items/:id', (req, res, next) => {
  const item = findItem(Number(req.params.id));
  if (!item) return next();

  item.name = req.body.name || '';
  item.updated_at = new Date();

  setNotice(req, 'Item was successfully updated.');
  res.redirect(`/items/${item.id}`);
});

app.post('/items/:id/delete', (req, res, next) => {
  const id = Number(req.params.id);
  const item = findItem(id);
  if (!item) return next();

  items = items.filter((entry) => entry.id !== id);

  setNotice(req, 'Item was successfully deleted.');
  res.redirect('/items');
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.resetStore = () => {
  items = [];
  nextId = 1;
  app.locals.notice = null;
};

module.exports = app;
