const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

let sheep = [];
let nextId = 1;

function setNotice(req, message) {
  req.app.locals.notice = message;
}

app.use((req, res, next) => {
  res.locals.notice = req.app.locals.notice || null;
  req.app.locals.notice = null;
  next();
});

function findSheep(id) {
  return sheep.find((item) => item.id === id);
}

app.get('/', (req, res) => {
  res.redirect('/sheep');
});

app.get('/sheep', (req, res) => {
  res.render('sheep/index', { sheep });
});

app.get('/sheep/new', (req, res) => {
  res.render('sheep/new', { sheep: { name: '' }, errors: [] });
});

app.post('/sheep', (req, res) => {
  const now = new Date();
  const newSheep = {
    id: nextId,
    name: req.body.name || '',
    created_at: now,
    updated_at: now
  };

  nextId += 1;
  sheep.push(newSheep);

  setNotice(req, 'Sheep was successfully created.');
  res.redirect(`/sheep/${newSheep.id}`);
});

app.get('/sheep/:id', (req, res, next) => {
  const sheepItem = findSheep(Number(req.params.id));
  if (!sheepItem) return next();
  res.render('sheep/show', { sheep: sheepItem });
});

app.get('/sheep/:id/edit', (req, res, next) => {
  const sheepItem = findSheep(Number(req.params.id));
  if (!sheepItem) return next();
  res.render('sheep/edit', { sheep: sheepItem, errors: [] });
});

app.post('/sheep/:id', (req, res, next) => {
  const sheepItem = findSheep(Number(req.params.id));
  if (!sheepItem) return next();

  sheepItem.name = req.body.name || '';
  sheepItem.updated_at = new Date();

  setNotice(req, 'Sheep was successfully updated.');
  res.redirect(`/sheep/${sheepItem.id}`);
});

app.post('/sheep/:id/delete', (req, res, next) => {
  const id = Number(req.params.id);
  const sheepItem = findSheep(id);
  if (!sheepItem) return next();

  sheep = sheep.filter((item) => item.id !== id);

  setNotice(req, 'Sheep was successfully deleted.');
  res.redirect('/sheep');
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.resetStore = () => {
  sheep = [];
  nextId = 1;
  app.locals.notice = null;
};

module.exports = app;
