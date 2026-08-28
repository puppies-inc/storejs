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

function validatePuppy({ breed }) {
  const errors = [];

  if (!breed || !breed.trim()) {
    errors.push('Breed is required.');
  }

  return errors;
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
  res.render('puppies/new', { puppy: { name: '', breed: '' }, errors: [] });
});

app.post('/puppies', (req, res) => {
  const name = req.body.name || '';
  const breed = req.body.breed || '';
  const errors = validatePuppy({ breed });

  if (errors.length > 0) {
    return res.status(422).render('puppies/new', { puppy: { name, breed }, errors });
  }

  const now = new Date();
  const puppy = {
    id: nextId,
    name,
    breed,
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

  const name = req.body.name || '';
  const breed = req.body.breed || '';
  const errors = validatePuppy({ breed });

  if (errors.length > 0) {
    return res.status(422).render('puppies/edit', { puppy: { ...puppy, name, breed }, errors });
  }

  puppy.name = name;
  puppy.breed = breed;
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
