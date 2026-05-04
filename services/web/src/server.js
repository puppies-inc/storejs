const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Web service listening on port ${port}`);
});
// Dark mode support 1777906193
