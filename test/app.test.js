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
      .send({ name: 'Buddy' });

    expect(createResponse.status).toBe(302);
    expect(createResponse.headers.location).toBe('/puppies/1');

    const showResponse = await request(app).get('/puppies/1');
    expect(showResponse.text).toContain('Puppy was successfully created.');

    const indexResponse = await request(app).get('/puppies');
    expect(indexResponse.text).toContain('Name: Buddy');
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
  });

  it('edit page pre-fills the name input with the current puppy name', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Rex' });

    const response = await request(app).get('/puppies/1/edit');
    expect(response.status).toBe(200);
    expect(response.text).toMatch(/<input id="name" name="name" type="text" value="Rex"/);
  });

  it('edit page reflects the latest name after an update, not the original', async () => {
    await request(app).post('/puppies').type('form').send({ name: 'Old Name' });
    await request(app).post('/puppies/1').type('form').send({ name: 'New Name' });

    const response = await request(app).get('/puppies/1/edit');
    expect(response.text).toMatch(/<input id="name" name="name" type="text" value="New Name"/);
    expect(response.text).not.toContain('value="Old Name"');
  });

  it('edit page escapes special characters in the pre-filled name', async () => {
    await request(app)
      .post('/puppies')
      .type('form')
      .send({ name: 'O\'Brien "Rex" & Co. <3' });

    const response = await request(app).get('/puppies/1/edit');
    expect(response.text).toContain(
      'value="O&#39;Brien &#34;Rex&#34; &amp; Co. &lt;3"'
    );
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
