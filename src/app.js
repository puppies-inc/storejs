const express = require('express');
const path = require('path');
const { catsCreated, catsDeleted, catsTotal } = require('./metrics');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

let cats = [];
let nextId = 1;

function setNotice(req, message) {
  req.app.locals.notice = message;
}

app.use((req, res, next) => {
  res.locals.notice = req.app.locals.notice || null;
  req.app.locals.notice = null;
  next();
});

function findCat(id) {
  return cats.find((cat) => cat.id === id);
}

app.get('/', (req, res) => {
  res.redirect('/cats');
});

app.get('/cats', (req, res) => {
  res.render('cats/index', { cats });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/cats/new', (req, res) => {
  res.render('cats/new', { cat: { name: '' }, errors: [] });
});

app.post('/cats', (req, res) => {
  const now = new Date();
  const cat = {
    id: nextId,
    name: req.body.name || '',
    created_at: now,
    updated_at: now
  };

  nextId += 1;
  cats.push(cat);
  catsCreated.add(1);
  catsTotal.add(1);

  setNotice(req, 'Cat was successfully created.');
  res.redirect(`/cats/${cat.id}`);
});

app.get('/cats/:id', (req, res, next) => {
  const cat = findCat(Number(req.params.id));
  if (!cat) return next();
  res.render('cats/show', { cat });
});

app.get('/cats/:id/edit', (req, res, next) => {
  const cat = findCat(Number(req.params.id));
  if (!cat) return next();
  res.render('cats/edit', { cat, errors: [] });
});

app.post('/cats/:id', (req, res, next) => {
  const cat = findCat(Number(req.params.id));
  if (!cat) return next();

  cat.name = req.body.name || '';
  cat.updated_at = new Date();

  setNotice(req, 'Cat was successfully updated.');
  res.redirect(`/cats/${cat.id}`);
});

app.post('/cats/:id/delete', (req, res, next) => {
  const id = Number(req.params.id);
  const cat = findCat(id);
  if (!cat) return next();

  cats = cats.filter((item) => item.id !== id);
  catsDeleted.add(1);
  catsTotal.add(-1);

  setNotice(req, 'Cat was successfully deleted.');
  res.redirect('/cats');
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.resetStore = () => {
  cats = [];
  nextId = 1;
  app.locals.notice = null;
};

module.exports = app;
