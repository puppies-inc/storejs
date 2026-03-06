const request = require('supertest');
const app = require('../src/app');

describe('Product CRUD', () => {
  beforeEach(() => {
    app.resetStore();
  });

  it('index page loads', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Products');
  });

  it('root redirects to products index', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/products');
  });

  it('new page loads', async () => {
    const response = await request(app).get('/products/new');
    expect(response.status).toBe(200);
    expect(response.text).toContain('New product');
  });

  it('about page loads', async () => {
    const response = await request(app).get('/about');
    expect(response.status).toBe(200);
    expect(response.text).toContain('About');
  });

  it('create increases product count and redirects correctly', async () => {
    const createResponse = await request(app)
      .post('/products')
      .type('form')
      .send({ name: 'Desk lamp' });

    expect(createResponse.status).toBe(302);
    expect(createResponse.headers.location).toBe('/products/1');

    const showResponse = await request(app).get('/products/1');
    expect(showResponse.text).toContain('Product was successfully created.');

    const indexResponse = await request(app).get('/products');
    expect(indexResponse.text).toContain('Name: Desk lamp');
  });

  it('show page loads', async () => {
    await request(app).post('/products').type('form').send({ name: 'Chair' });

    const response = await request(app).get('/products/1');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Name: Chair');
  });

  it('edit page loads', async () => {
    await request(app).post('/products').type('form').send({ name: 'Table' });

    const response = await request(app).get('/products/1/edit');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Editing product');
  });

  it('update persists change and redirects correctly', async () => {
    await request(app).post('/products').type('form').send({ name: 'Old Name' });

    const updateResponse = await request(app)
      .post('/products/1')
      .type('form')
      .send({ name: 'New Name' });

    expect(updateResponse.status).toBe(302);
    expect(updateResponse.headers.location).toBe('/products/1');

    const showResponse = await request(app).get('/products/1');
    expect(showResponse.text).toContain('Name: New Name');
    expect(showResponse.text).toContain('Product was successfully updated.');
  });

  it('delete decreases product count and redirects correctly', async () => {
    await request(app).post('/products').type('form').send({ name: 'To Delete' });

    const deleteResponse = await request(app).post('/products/1/delete');

    expect(deleteResponse.status).toBe(302);
    expect(deleteResponse.headers.location).toBe('/products');

    const indexResponse = await request(app).get('/products');
    expect(indexResponse.text).not.toContain('Name: To Delete');
    expect(indexResponse.text).toContain('Product was successfully deleted.');
  });

  it('returns 404 for missing product', async () => {
    const response = await request(app).get('/products/999');
    expect(response.status).toBe(404);
  });
});
