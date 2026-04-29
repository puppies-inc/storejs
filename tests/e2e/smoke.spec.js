const { test, expect } = require('@playwright/test');

test.describe('StoreJS Web Smoke Tests', () => {

  test('health check returns ok', async ({ request }) => {
    const resp = await request.get('/health');
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('web');
  });

  test('homepage redirects to products', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/products/);
  });

  test('products page loads', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('h1')).toContainText(/products/i);
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);
  });

  test('full CRUD: create, view, edit, delete product', async ({ page }) => {
    // Navigate to new product form
    await page.goto('/products');
    await page.click('a[href="/products/new"]');
    await expect(page).toHaveURL(/\/products\/new/);

    // Create product
    await page.fill('input[name="name"]', 'Smoke Test Widget');
    await page.click('button[type="submit"], input[type="submit"]');

    // Should redirect to product show page
    await expect(page).toHaveURL(/\/products\/\d+/);
    await expect(page.locator('body')).toContainText('Smoke Test Widget');

    // Edit product
    await page.click('a[href*="edit"]');
    await expect(page).toHaveURL(/\/edit/);
    await page.fill('input[name="name"]', 'Updated Smoke Widget');
    await page.click('button[type="submit"], input[type="submit"]');

    // Verify update
    await expect(page.locator('body')).toContainText('Updated Smoke Widget');

    // Delete product
    await page.click('button:has-text("Delete"), input[value="Delete"], form[action*="delete"] button, form[action*="delete"] input[type="submit"]');

    // Should redirect to products index
    await expect(page).toHaveURL(/\/products$/);

    // Verify product is gone
    await expect(page.locator('body')).not.toContainText('Updated Smoke Widget');
  });

  test('create product shows success notice', async ({ page }) => {
    await page.goto('/products/new');
    await page.fill('input[name="name"]', 'Notice Test Product');
    await page.click('button[type="submit"], input[type="submit"]');

    // Check for success notice
    await expect(page.locator('body')).toContainText(/successfully created/i);

    // Cleanup - delete the product
    await page.click('button:has-text("Delete"), input[value="Delete"], form[action*="delete"] button, form[action*="delete"] input[type="submit"]');
  });
});
