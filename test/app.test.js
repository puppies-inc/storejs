const request = require('supertest');
const app = require('../src/app');

describe('Animal CRUD', () => {
  beforeEach(() => {
    app.resetStore();
  });

  it('index page loads', async () => {
    const response = await request(app).get('/animals');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Animals');
  });

  it('root redirects to animals index', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/animals');
  });

  it('legacy puppies path redirects to animals index', async () => {
    const response = await request(app).get('/puppies');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/animals');
  });

  it('about page loads', async () => {
    const response = await request(app).get('/about');
    expect(response.status).toBe(200);
    expect(response.text).toContain('About StoreJS');
  });

  it('new page loads with species options', async () => {
    const response = await request(app).get('/animals/new');
    expect(response.status).toBe(200);
    expect(response.text).toContain('New animal');
    expect(response.text).toContain('Puppy');
    expect(response.text).toContain('Kitten');
    expect(response.text).toContain('Bunny');
    expect(response.text).toContain('Bird');
    expect(response.text).toContain('Hamster');
  });

  it('create increases animal count and redirects correctly', async () => {
    const createResponse = await request(app)
      .post('/animals')
      .type('form')
      .send({ name: 'Buddy', species: 'puppy' });

    expect(createResponse.status).toBe(302);
    expect(createResponse.headers.location).toBe('/animals/1');

    const showResponse = await request(app).get('/animals/1');
    expect(showResponse.text).toContain('Puppy was successfully created.');
    expect(showResponse.text).toContain('Species: Puppy');

    const indexResponse = await request(app).get('/animals');
    expect(indexResponse.text).toContain('Name: Buddy');
  });

  it('create supports kittens and other species', async () => {
    const createResponse = await request(app)
      .post('/animals')
      .type('form')
      .send({ name: 'Miso', species: 'kitten' });

    expect(createResponse.status).toBe(302);
    expect(createResponse.headers.location).toBe('/animals/1');

    const showResponse = await request(app).get('/animals/1');
    expect(showResponse.status).toBe(200);
    expect(showResponse.text).toContain('Name: Miso');
    expect(showResponse.text).toContain('Species: Kitten');
    expect(showResponse.text).toContain('Kitten was successfully created.');
  });

  it('unknown species falls back to puppy', async () => {
    await request(app)
      .post('/animals')
      .type('form')
      .send({ name: 'Mystery', species: 'dragon' });

    const response = await request(app).get('/animals/1');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Species: Puppy');
  });

  it('show page loads', async () => {
    await request(app).post('/animals').type('form').send({ name: 'Max', species: 'bird' });

    const response = await request(app).get('/animals/1');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Name: Max');
    expect(response.text).toContain('Species: Bird');
  });

  it('edit page loads', async () => {
    await request(app).post('/animals').type('form').send({ name: 'Luna', species: 'bunny' });

    const response = await request(app).get('/animals/1/edit');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Editing animal');
  });

  it('update persists change and redirects correctly', async () => {
    await request(app).post('/animals').type('form').send({ name: 'Old Name', species: 'hamster' });

    const updateResponse = await request(app)
      .post('/animals/1')
      .type('form')
      .send({ name: 'New Name', species: 'kitten' });

    expect(updateResponse.status).toBe(302);
    expect(updateResponse.headers.location).toBe('/animals/1');

    const showResponse = await request(app).get('/animals/1');
    expect(showResponse.text).toContain('Name: New Name');
    expect(showResponse.text).toContain('Species: Kitten');
    expect(showResponse.text).toContain('Kitten was successfully updated.');
  });

  it('delete decreases animal count and redirects correctly', async () => {
    await request(app).post('/animals').type('form').send({ name: 'To Delete', species: 'puppy' });

    const deleteResponse = await request(app).post('/animals/1/delete');

    expect(deleteResponse.status).toBe(302);
    expect(deleteResponse.headers.location).toBe('/animals');

    const indexResponse = await request(app).get('/animals');
    expect(indexResponse.text).not.toContain('Name: To Delete');
    expect(indexResponse.text).toContain('Puppy was successfully deleted.');
  });

  it('returns 404 for missing animal', async () => {
    const response = await request(app).get('/animals/999');
    expect(response.status).toBe(404);
  });

  it('theme toggle is present and defaults to dark on every page', async () => {
    await request(app).post('/animals').type('form').send({ name: 'Theme Pup', species: 'puppy' });

    const pages = [
      await request(app).get('/animals'),
      await request(app).get('/animals/new'),
      await request(app).get('/animals/1'),
      await request(app).get('/animals/1/edit'),
      await request(app).get('/about')
    ];

    for (const response of pages) {
      expect(response.status).toBe(200);
      expect(response.text).toContain('data-theme="dark"');
      expect(response.text).toContain('id="theme-toggle"');
      expect(response.text).toContain('Light mode');
    }
  });
});
