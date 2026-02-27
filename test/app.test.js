const request = require('supertest');
const app = require('../src/app');

describe('Sheep CRUD', () => {
  beforeEach(() => {
    app.resetStore();
  });

  it('index page loads', async () => {
    const response = await request(app).get('/sheep');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Sheep');
  });

  it('root redirects to sheep index', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/sheep');
  });

  it('new page loads', async () => {
    const response = await request(app).get('/sheep/new');
    expect(response.status).toBe(200);
    expect(response.text).toContain('New sheep');
  });

  it('create increases sheep count and redirects correctly', async () => {
    const createResponse = await request(app)
      .post('/sheep')
      .type('form')
      .send({ name: 'Desk lamp' });

    expect(createResponse.status).toBe(302);
    expect(createResponse.headers.location).toBe('/sheep/1');

    const showResponse = await request(app).get('/sheep/1');
    expect(showResponse.text).toContain('Sheep was successfully created.');

    const indexResponse = await request(app).get('/sheep');
    expect(indexResponse.text).toContain('Name: Desk lamp');
  });

  it('show page loads', async () => {
    await request(app).post('/sheep').type('form').send({ name: 'Chair' });

    const response = await request(app).get('/sheep/1');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Name: Chair');
  });

  it('edit page loads', async () => {
    await request(app).post('/sheep').type('form').send({ name: 'Table' });

    const response = await request(app).get('/sheep/1/edit');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Editing sheep');
  });

  it('update persists change and redirects correctly', async () => {
    await request(app).post('/sheep').type('form').send({ name: 'Old Name' });

    const updateResponse = await request(app)
      .post('/sheep/1')
      .type('form')
      .send({ name: 'New Name' });

    expect(updateResponse.status).toBe(302);
    expect(updateResponse.headers.location).toBe('/sheep/1');

    const showResponse = await request(app).get('/sheep/1');
    expect(showResponse.text).toContain('Name: New Name');
    expect(showResponse.text).toContain('Sheep was successfully updated.');
  });

  it('delete decreases sheep count and redirects correctly', async () => {
    await request(app).post('/sheep').type('form').send({ name: 'To Delete' });

    const deleteResponse = await request(app).post('/sheep/1/delete');

    expect(deleteResponse.status).toBe(302);
    expect(deleteResponse.headers.location).toBe('/sheep');

    const indexResponse = await request(app).get('/sheep');
    expect(indexResponse.text).not.toContain('Name: To Delete');
    expect(indexResponse.text).toContain('Sheep was successfully deleted.');
  });

  it('returns 404 for missing sheep', async () => {
    const response = await request(app).get('/sheep/999');
    expect(response.status).toBe(404);
  });
});
