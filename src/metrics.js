const { metrics } = require('@opentelemetry/api');

const meter = metrics.getMeter('storejs-business');

const catsCreated = meter.createCounter('store.cats.created', {
  description: 'Total number of cats created',
});

const catsDeleted = meter.createCounter('store.cats.deleted', {
  description: 'Total number of cats deleted',
});

const catsTotal = meter.createUpDownCounter('store.cats.total', {
  description: 'Current number of cats in the store',
});

module.exports = { catsCreated, catsDeleted, catsTotal };
