const express = require('express');
const path = require('path');
const { puppiesCreated, puppiesDeleted, puppiesTotal } = require('./metrics');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

const ANIMAL_SPECIES = ['Dog', 'Cat', 'Rabbit', 'Hamster', 'Bird', 'Fish', 'Reptile', 'Other'];
const DEFAULT_SPECIES = 'Dog';

const SPECIES_EMOJI = {
  Dog: '🐶',
  Cat: '🐱',
  Rabbit: '🐰',
  Hamster: '🐹',
  Bird: '🐦',
  Fish: '🐠',
  Reptile: '🦎',
  Other: '🐾'
};

function speciesEmoji(species) {
  return SPECIES_EMOJI[species] || SPECIES_EMOJI.Other;
}

function normalizeSpecies(species) {
  const trimmed = (species || '').trim();
  return ANIMAL_SPECIES.includes(trimmed) ? trimmed : DEFAULT_SPECIES;
}

app.locals.animalSpecies = ANIMAL_SPECIES;
app.locals.speciesEmoji = speciesEmoji;

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
  res.render('puppies/new', { puppy: { name: '', species: DEFAULT_SPECIES }, errors: [] });
});

app.post('/puppies', (req, res) => {
  const now = new Date();
  const species = normalizeSpecies(req.body.species);
  const puppy = {
    id: nextId,
    name: req.body.name || '',
    species,
    created_at: now,
    updated_at: now
  };

  nextId += 1;
  puppies.push(puppy);
  puppiesCreated.add(1, { species });
  puppiesTotal.add(1, { species });

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
  puppy.species = normalizeSpecies(req.body.species);
  puppy.updated_at = new Date();

  setNotice(req, 'Puppy was successfully updated.');
  res.redirect(`/puppies/${puppy.id}`);
});

app.post('/puppies/:id/delete', (req, res, next) => {
  const id = Number(req.params.id);
  const puppy = findPuppy(id);
  if (!puppy) return next();

  puppies = puppies.filter((item) => item.id !== id);
  puppiesDeleted.add(1, { species: puppy.species });
  puppiesTotal.add(-1, { species: puppy.species });

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
