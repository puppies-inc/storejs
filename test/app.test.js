const request = require('supertest');
const app = require('../src/app');

describe('Puppy CRUD', () => {
  beforeEach(() => {
    app.resetStore();
  });

  it('index page loads', async () => {
    const response = await request(app).get('/puppies');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Puppies');
  });

  it('root redirects to puppies index', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/puppies');
  });

  it('about page loads', async () => {
    const response = await request(app).get('/about');
    expect(response.status).toBe(200);
    expect(response.text).toContain('About StoreJS');
  });

  it('new page loads', async () => {
    const response = await request(app).get('/puppies/new');
    expect(response.status).toBe(200);
    expect(response.text).toContain('New puppy');
    expect(response.text).toContain('Image URL');
  });

  it('create increases puppy count and redirects correctly', async () => {
    const createResponse = await request(app)
      .post('/puppies')
      .type('form')
      .send({ name: 'Buddy' });

    expect(createResponse.status).toBe(302);
    expect(createResponse.headers.location).toBe('/puppies/1');

    const showResponse = await request(app).get('/puppies/1');
    expect(showResponse.text).toContain('Puppy was successfully created.');

    const indexResponse = await request(app).get('/puppies');
    expect(indexResponse.text).toContain('Name: Buddy');
  });

  it('create with an image_url persists it and renders it on the show page', async () => {
    const createResponse = await request(app)
      .post('/puppies')
      .type('form')
      .send({ name: 'Buddy', image_url: 'https://example.com/buddy.jpg' });

    expect(createResponse.status).toBe(302);

    const showResponse = await request(app).get('/puppies/1');
    expect(showResponse.text).toContain('src="https://example.com/buddy.jpg"');
  });

  it('create without an image_url falls back to the placeholder image', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Buddy' });

    const showResponse = await request(app).get('/puppies/1');
    expect(showResponse.text).toContain('src="https://placedog.net/640/480?id=1"');
  });

  it('show page loads', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Max' });

    const response = await request(app).get('/puppies/1');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Name: Max');
  });

  it('edit page loads', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Luna' });

    const response = await request(app).get('/puppies/1/edit');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Editing puppy');
    expect(response.text).toContain('Image URL');
  });

  it('update persists change and redirects correctly', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Old Name' });

    const updateResponse = await request(app)
      .post('/puppies/1')
      .type('form')
      .send({ name: 'New Name' });

    expect(updateResponse.status).toBe(302);
    expect(updateResponse.headers.location).toBe('/puppies/1');

    const showResponse = await request(app).get('/puppies/1');
    expect(showResponse.text).toContain('Name: New Name');
    expect(showResponse.text).toContain('Puppy was successfully updated.');
  });

  it('update persists a new image_url and renders it on the show page', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Rex' });

    const updateResponse = await request(app)
      .post('/puppies/1')
      .type('form')
      .send({ name: 'Rex', image_url: 'https://example.com/rex.jpg' });

    expect(updateResponse.status).toBe(302);

    const showResponse = await request(app).get('/puppies/1');
    expect(showResponse.text).toContain('src="https://example.com/rex.jpg"');
  });

  it('delete decreases puppy count and redirects correctly', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'To Delete' });

    const deleteResponse = await request(app).post('/puppies/1/delete');

    expect(deleteResponse.status).toBe(302);
    expect(deleteResponse.headers.location).toBe('/puppies');

    const indexResponse = await request(app).get('/puppies');
    expect(indexResponse.text).not.toContain('Name: To Delete');
    expect(indexResponse.text).toContain('Puppy was successfully deleted.');
  });

  it('returns 404 for missing puppy', async () => {
    const response = await request(app).get('/puppies/999');
    expect(response.status).toBe(404);
  });
});
