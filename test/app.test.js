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
  });

  it('create increases puppy count and redirects correctly', async () => {
    const createResponse = await request(app)
      .post('/puppies')
      .type('form')
      .send({ name: 'Buddy', breed: 'Labrador' });

    expect(createResponse.status).toBe(302);
    expect(createResponse.headers.location).toBe('/puppies/1');

    const showResponse = await request(app).get('/puppies/1');
    expect(showResponse.text).toContain('Puppy was successfully created.');
    expect(showResponse.text).toContain('Breed: Labrador');

    const indexResponse = await request(app).get('/puppies');
    expect(indexResponse.text).toContain('Name: Buddy');
    expect(indexResponse.text).toContain('Breed: Labrador');
  });

  it('show page loads', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Max', breed: 'Beagle' });

    const response = await request(app).get('/puppies/1');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Name: Max');
    expect(response.text).toContain('Breed: Beagle');
  });

  it('edit page loads', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Luna', breed: 'Husky' });

    const response = await request(app).get('/puppies/1/edit');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Editing puppy');
    expect(response.text).toContain('value="Husky"');
  });

  it('index page lists breed alongside name for multiple puppies', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Rex', breed: 'Boxer' });
    await request(app).post('/puppies').type('form').send({ name: 'Fido', breed: 'Corgi' });

    const response = await request(app).get('/puppies');
    expect(response.text).toContain('Name: Rex — Breed: Boxer');
    expect(response.text).toContain('Name: Fido — Breed: Corgi');
  });

  it('update persists change and redirects correctly', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Old Name', breed: 'Poodle' });

    const updateResponse = await request(app)
      .post('/puppies/1')
      .type('form')
      .send({ name: 'New Name', breed: 'Bulldog' });

    expect(updateResponse.status).toBe(302);
    expect(updateResponse.headers.location).toBe('/puppies/1');

    const showResponse = await request(app).get('/puppies/1');
    expect(showResponse.text).toContain('Name: New Name');
    expect(showResponse.text).toContain('Breed: Bulldog');
    expect(showResponse.text).toContain('Puppy was successfully updated.');
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
