const { metrics } = require('@opentelemetry/api');

const meter = metrics.getMeter('storejs-business');

const animalsCreated = meter.createCounter('store.animals.created', {
  description: 'Total number of animals created',
});

const animalsDeleted = meter.createCounter('store.animals.deleted', {
  description: 'Total number of animals deleted',
});

const animalsTotal = meter.createUpDownCounter('store.animals.total', {
  description: 'Current number of animals in the store',
});

module.exports = { animalsCreated, animalsDeleted, animalsTotal };
