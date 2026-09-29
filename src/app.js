const express = require('express');
const path = require('path');
const { animalsCreated, animalsDeleted, animalsTotal } = require('./metrics');
const { SPECIES, DEFAULT_SPECIES, resolveSpecies, photoUrl } = require('./species');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

app.locals.SPECIES = SPECIES;
app.locals.resolveSpecies = resolveSpecies;
app.locals.photoUrl = photoUrl;

let animals = [];
let nextId = 1;

function setNotice(req, message) {
  req.app.locals.notice = message;
}

app.use((req, res, next) => {
  res.locals.notice = req.app.locals.notice || null;
  req.app.locals.notice = null;
  next();
});

function findAnimal(id) {
  return animals.find((animal) => animal.id === id);
}

app.get('/', (req, res) => {
  res.redirect('/animals');
});

app.get('/puppies', (req, res) => {
  res.redirect('/animals');
});

app.get('/animals', (req, res) => {
  res.render('animals/index', { animals });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/animals/new', (req, res) => {
  res.render('animals/new', { animal: { name: '', species: DEFAULT_SPECIES.id }, errors: [] });
});

app.post('/animals', (req, res) => {
  const now = new Date();
  const species = resolveSpecies(req.body.species);
  const animal = {
    id: nextId,
    name: req.body.name || '',
    species: species.id,
    created_at: now,
    updated_at: now
  };

  nextId += 1;
  animals.push(animal);
  animalsCreated.add(1, { species: animal.species });
  animalsTotal.add(1, { species: animal.species });

  setNotice(req, `${species.label} was successfully created.`);
  res.redirect(`/animals/${animal.id}`);
});

app.get('/animals/:id', (req, res, next) => {
  const animal = findAnimal(Number(req.params.id));
  if (!animal) return next();
  res.render('animals/show', { animal });
});

app.get('/animals/:id/edit', (req, res, next) => {
  const animal = findAnimal(Number(req.params.id));
  if (!animal) return next();
  res.render('animals/edit', { animal, errors: [] });
});

app.post('/animals/:id', (req, res, next) => {
  const animal = findAnimal(Number(req.params.id));
  if (!animal) return next();

  const previousSpecies = animal.species;
  const species = resolveSpecies(req.body.species);

  animal.name = req.body.name || '';
  animal.species = species.id;
  animal.updated_at = new Date();

  if (previousSpecies !== animal.species) {
    animalsTotal.add(-1, { species: previousSpecies });
    animalsTotal.add(1, { species: animal.species });
  }

  setNotice(req, `${species.label} was successfully updated.`);
  res.redirect(`/animals/${animal.id}`);
});

app.post('/animals/:id/delete', (req, res, next) => {
  const id = Number(req.params.id);
  const animal = findAnimal(id);
  if (!animal) return next();

  animals = animals.filter((item) => item.id !== id);
  animalsDeleted.add(1, { species: animal.species });
  animalsTotal.add(-1, { species: animal.species });

  setNotice(req, `${resolveSpecies(animal.species).label} was successfully deleted.`);
  res.redirect('/animals');
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.resetStore = () => {
  animals = [];
  nextId = 1;
  app.locals.notice = null;
};

module.exports = app;
