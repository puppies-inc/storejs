const express = require('express');
const path = require('path');
const { puppiesCreated, puppiesDeleted, puppiesTotal } = require('./metrics');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

let puppies = [];
let nextId = 1;

function redirectWithNotice(res, location, message) {
  res.redirect(`${location}?notice=${encodeURIComponent(message)}`);
}

function findPuppy(id) {
  return puppies.find((puppy) => puppy.id === id);
}

app.get('/', (req, res) => {
  res.redirect('/puppies');
});

app.get('/puppies', (req, res) => {
  res.render('puppies/index', { puppies, notice: req.query.notice || null });
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

  redirectWithNotice(res, `/puppies/${puppy.id}`, 'Puppy was successfully created.');
});

app.get('/puppies/:id', (req, res, next) => {
  const puppy = findPuppy(Number(req.params.id));
  if (!puppy) return next();
  res.render('puppies/show', { puppy, notice: req.query.notice || null });
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

  redirectWithNotice(res, `/puppies/${puppy.id}`, 'Puppy was successfully updated.');
});

app.post('/puppies/:id/delete', (req, res, next) => {
  const id = Number(req.params.id);
  const puppy = findPuppy(id);
  if (!puppy) return next();

  puppies = puppies.filter((item) => item.id !== id);
  puppiesDeleted.add(1);
  puppiesTotal.add(-1);

  redirectWithNotice(res, '/puppies', 'Puppy was successfully deleted.');
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.resetStore = () => {
  puppies = [];
  nextId = 1;
};

module.exports = app;
