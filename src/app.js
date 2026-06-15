const express = require('express');
const path = require('path');
const { puppiesCreated, puppiesDeleted, puppiesTotal } = require('./metrics');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

let puppies = [];
let nextId = 1;

function setNotice(req, message) {
  req.app.locals.notice = message;
}

app.use((req, res, next) => {
  res.locals.notice = req.app.locals.notice || null;
  req.app.locals.notice = null;
  next();
});

function findPuppy(id) {
  return puppies.find((puppy) => puppy.id === id);
}

app.get('/', (req, res) => {
  res.redirect('/puppies');
});

app.get('/puppies', (req, res) => {
  res.render('puppies/index', { puppies });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/puppies/new', (req, res) => {
  res.render('puppies/new', { puppy: { name: '' }, errors: [] });
});

app.post('/puppies', (req, res) => {
  const now = new Date();
  const puppy = {
    id: nextId,
    name: req.body.name || '',
    created_at: now,
    updated_at: now
  };

  nextId += 1;
  puppies.push(puppy);
  puppiesCreated.add(1);
  puppiesTotal.add(1);

  setNotice(req, 'Puppy was successfully created.');
  res.redirect(`/puppies/${puppy.id}`);
});

app.get('/puppies/:id', (req, res, next) => {
  const puppy = findPuppy(Number(req.params.id));
  if (!puppy) return next();
  res.render('puppies/show', { puppy });
});

app.get('/puppies/:id/edit', (req, res, next) => {
  const puppy = findPuppy(Number(req.params.id));
  if (!puppy) return next();
  res.render('puppies/edit', { puppy, errors: [] });
});

app.post('/puppies/:id', (req, res, next) => {
  const puppy = findPuppy(Number(req.params.id));
  if (!puppy) return next();

  puppy.name = req.body.name || '';
  puppy.updated_at = new Date();

  setNotice(req, 'Puppy was successfully updated.');
  res.redirect(`/puppies/${puppy.id}`);
});

app.post('/puppies/:id/delete', (req, res, next) => {
  const id = Number(req.params.id);
  const puppy = findPuppy(id);
  if (!puppy) return next();

  puppies = puppies.filter((item) => item.id !== id);
  puppiesDeleted.add(1);
  puppiesTotal.add(-1);

  setNotice(req, 'Puppy was successfully deleted.');
  res.redirect('/puppies');
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.resetStore = () => {
  puppies = [];
  nextId = 1;
  app.locals.notice = null;
};

module.exports = app;

// Search endpoint for puppies
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  const results = puppies.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  res.render('puppies/index', { puppies: results, query });
});
