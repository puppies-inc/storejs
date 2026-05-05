const app = require('./app');

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`API service listening on port ${port}`);
});
// i18n 1777977069
