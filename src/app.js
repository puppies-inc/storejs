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

// Centralized id validation + lookup for every `:id` route. Any route using
// this middleware can rely on `req.puppy` being a valid, existing puppy.
// Non-numeric ids and missing puppies both skip the rest of the current
// route (`next('route')`) and fall through to the final 404 handler, so no
// route can accidentally skip the check.
function loadPuppy(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next('route');

  const puppy = findPuppy(id);
  if (!puppy) return next('route');

  req.puppy = puppy;
  next();
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

app.get('/puppies/:id', loadPuppy, (req, res) => {
  res.render('puppies/show', { puppy: req.puppy });
});

app.get('/puppies/:id/edit', loadPuppy, (req, res) => {
  res.render('puppies/edit', { puppy: req.puppy, errors: [] });
});

app.post('/puppies/:id', loadPuppy, (req, res) => {
  const puppy = req.puppy;
  puppy.name = req.body.name || '';
  puppy.updated_at = new Date();

  setNotice(req, 'Puppy was successfully updated.');
  res.redirect(`/puppies/${puppy.id}`);
});

app.post('/puppies/:id/delete', loadPuppy, (req, res) => {
  const { id } = req.puppy;
  puppies = puppies.filter((item) => item.id !== id);
  puppiesDeleted.add(1);
  puppiesTotal.add(-1);

  setNotice(req, 'Puppy was successfully deleted.');
  res.redirect('/puppies');
});

app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Catch-all error handler. Ensures any unexpected failure (e.g. malformed
// percent-encoding in a route param, which Express throws before our route
// handlers even run) returns a controlled response instead of leaking a raw
// stack trace to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).send('Something went wrong');
});

app.resetStore = () => {
  puppies = [];
  nextId = 1;
  app.locals.notice = null;
};

module.exports = app;
