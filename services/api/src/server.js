const app = require('./app');

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`API service listening on port ${port}`);
});
// logging 1777977838
