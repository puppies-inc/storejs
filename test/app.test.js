const request = require('supertest');
const app = require('../src/app');

describe('Item CRUD', () => {
  beforeEach(() => {
    app.resetStore();
  });

  it('index page loads', async () => {
    const response = await request(app).get('/items');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Items');
  });

  it('root redirects to items index', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/items');
  });

  it('new page loads', async () => {
    const response = await request(app).get('/items/new');
    expect(response.status).toBe(200);
    expect(response.text).toContain('New item');
  });

  it('create increases item count and redirects correctly', async () => {
    const createResponse = await request(app)
      .post('/items')
      .type('form')
      .send({ name: 'Desk lamp' });

    expect(createResponse.status).toBe(302);
    expect(createResponse.headers.location).toBe('/items/1');

    const showResponse = await request(app).get('/items/1');
    expect(showResponse.text).toContain('Item was successfully created.');

    const indexResponse = await request(app).get('/items');
    expect(indexResponse.text).toContain('Name: Desk lamp');
  });

  it('show page loads', async () => {
    await request(app).post('/items').type('form').send({ name: 'Chair' });

    const response = await request(app).get('/items/1');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Name: Chair');
  });

  it('edit page loads', async () => {
    await request(app).post('/items').type('form').send({ name: 'Table' });

    const response = await request(app).get('/items/1/edit');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Editing item');
  });

  it('update persists change and redirects correctly', async () => {
    await request(app).post('/items').type('form').send({ name: 'Old Name' });

    const updateResponse = await request(app)
      .post('/items/1')
      .type('form')
      .send({ name: 'New Name' });

    expect(updateResponse.status).toBe(302);
    expect(updateResponse.headers.location).toBe('/items/1');

    const showResponse = await request(app).get('/items/1');
    expect(showResponse.text).toContain('Name: New Name');
    expect(showResponse.text).toContain('Item was successfully updated.');
  });

  it('delete decreases item count and redirects correctly', async () => {
    await request(app).post('/items').type('form').send({ name: 'To Delete' });

    const deleteResponse = await request(app).post('/items/1/delete');

    expect(deleteResponse.status).toBe(302);
    expect(deleteResponse.headers.location).toBe('/items');

    const indexResponse = await request(app).get('/items');
    expect(indexResponse.text).not.toContain('Name: To Delete');
    expect(indexResponse.text).toContain('Item was successfully deleted.');
  });

  it('returns 404 for missing item', async () => {
    const response = await request(app).get('/items/999');
    expect(response.status).toBe(404);
  });
});
