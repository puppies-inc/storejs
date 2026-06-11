const request = require('supertest');
const app = require('../src/app');

describe('Cat CRUD', () => {
  beforeEach(() => {
    app.resetStore();
  });

  it('index page loads', async () => {
    const response = await request(app).get('/cats');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Cats');
  });

  it('root redirects to cats index', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/cats');
  });

  it('about page loads', async () => {
    const response = await request(app).get('/about');
    expect(response.status).toBe(200);
    expect(response.text).toContain('About StoreJS');
  });

  it('new page loads', async () => {
    const response = await request(app).get('/cats/new');
    expect(response.status).toBe(200);
    expect(response.text).toContain('New cat');
  });

  it('create increases cat count and redirects correctly', async () => {
    const createResponse = await request(app)
      .post('/cats')
      .type('form')
      .send({ name: 'Whiskers' });

    expect(createResponse.status).toBe(302);
    expect(createResponse.headers.location).toBe('/cats/1');

    const showResponse = await request(app).get('/cats/1');
    expect(showResponse.text).toContain('Cat was successfully created.');

    const indexResponse = await request(app).get('/cats');
    expect(indexResponse.text).toContain('Name: Whiskers');
  });

  it('show page loads', async () => {
    await request(app).post('/cats').type('form').send({ name: 'Mittens' });

    const response = await request(app).get('/cats/1');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Name: Mittens');
  });

  it('edit page loads', async () => {
    await request(app).post('/cats').type('form').send({ name: 'Luna' });

    const response = await request(app).get('/cats/1/edit');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Editing cat');
  });

  it('update persists change and redirects correctly', async () => {
    await request(app).post('/cats').type('form').send({ name: 'Old Name' });

    const updateResponse = await request(app)
      .post('/cats/1')
      .type('form')
      .send({ name: 'New Name' });

    expect(updateResponse.status).toBe(302);
    expect(updateResponse.headers.location).toBe('/cats/1');

    const showResponse = await request(app).get('/cats/1');
    expect(showResponse.text).toContain('Name: New Name');
    expect(showResponse.text).toContain('Cat was successfully updated.');
  });

  it('delete decreases cat count and redirects correctly', async () => {
    await request(app).post('/cats').type('form').send({ name: 'To Delete' });

    const deleteResponse = await request(app).post('/cats/1/delete');

    expect(deleteResponse.status).toBe(302);
    expect(deleteResponse.headers.location).toBe('/cats');

    const indexResponse = await request(app).get('/cats');
    expect(indexResponse.text).not.toContain('Name: To Delete');
    expect(indexResponse.text).toContain('Cat was successfully deleted.');
  });

  it('returns 404 for missing cat', async () => {
    const response = await request(app).get('/cats/999');
    expect(response.status).toBe(404);
  });
});
