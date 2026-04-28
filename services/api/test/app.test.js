const request = require('supertest');
const app = require('../src/app');

describe('API Product CRUD', () => {
  beforeEach(() => {
    app.resetStore();
  });

  it('health check returns ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('api');
    expect(response.body.timestamp).toBeDefined();
  });

  it('index returns empty array', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('create returns product with id', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Desk lamp' });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(1);
    expect(response.body.name).toBe('Desk lamp');
    expect(response.body.created_at).toBeDefined();
  });

  it('create increases product count', async () => {
    await request(app).post('/api/products').send({ name: 'Desk lamp' });

    const response = await request(app).get('/api/products');
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Desk lamp');
  });

  it('show returns product', async () => {
    await request(app).post('/api/products').send({ name: 'Chair' });

    const response = await request(app).get('/api/products/1');
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Chair');
  });

  it('update persists change', async () => {
    await request(app).post('/api/products').send({ name: 'Old Name' });

    const updateResponse = await request(app)
      .put('/api/products/1')
      .send({ name: 'New Name' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('New Name');

    const showResponse = await request(app).get('/api/products/1');
    expect(showResponse.body.name).toBe('New Name');
  });

  it('delete removes product', async () => {
    await request(app).post('/api/products').send({ name: 'To Delete' });

    const deleteResponse = await request(app).delete('/api/products/1');
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Product deleted');

    const indexResponse = await request(app).get('/api/products');
    expect(indexResponse.body).toHaveLength(0);
  });

  it('returns 404 for missing product', async () => {
    const response = await request(app).get('/api/products/999');
    expect(response.status).toBe(404);
  });
});
