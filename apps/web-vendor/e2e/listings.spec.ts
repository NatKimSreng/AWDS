import { test, expect } from '@playwright/test';

test.describe('Vendor listing form', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const login = await fetch(`${process.env.VITE_API_URL ?? 'http://127.0.0.1:8000'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: 'vendor1@angkor.local', password: 'password' }),
    });
    const { token } = (await login.json()) as { token: string };

    await page.goto(baseURL!);
    await page.evaluate((t) => {
      localStorage.setItem('sanctum-token', t);
      localStorage.setItem(
        'vendor-auth-storage',
        JSON.stringify({
          state: {
            user: {
              id: 147,
              name: 'Siem Reap Sunrise Tours',
              email: 'vendor1@angkor.local',
              role: { id: 2, name: 'provider', label: 'Provider' },
              language_pref: 'en',
            },
            token: t,
          },
          version: 0,
        })
      );
    }, token);
    await page.reload();
  });

  test('creates a new listing with hero and gallery images', async ({ page }) => {
    await page.goto('/listings/new');

    await expect(page.getByRole('heading', { name: /Create a new listing/i })).toBeVisible({ timeout: 10000 });

    // Wait for lookups to load
    await expect(page.locator('#category_id')).toContainText('Temples & History', { timeout: 10000 });

    const title = `Playwright Test Tour ${Date.now()}`;

    // Basic info
    await page.locator('#title').fill(title);
    await page.locator('#category_id').selectOption({ index: 1 });
    await page.locator('#city_id').selectOption({ index: 1 });
    await page.locator('#description').fill('A tour created by Playwright E2E test.');

    // Details & policies
    await page.getByRole('button', { name: 'Details & policies' }).click();
    await page.locator('#duration_minutes').fill('120');
    await page.locator('#base_price_usd').fill('29.99');
    await page.locator('#min_group').fill('1');
    await page.locator('#max_group').fill('6');
    await page.locator('#status').selectOption('pending');

    // Photos section
    await page.getByRole('button', { name: 'Photos' }).click();
    await page.getByText('Click to upload hero image').click();
    await page.locator('input[accept="image/*"]').first().setInputFiles('e2e/hero.png');
    await expect(page.locator('span', { hasText: /^Hero$/ })).toBeVisible();

    await page.getByText('Drag & drop photos here, or click to browse').click();
    await page.locator('input[accept="image/*"]').nth(1).setInputFiles(['e2e/gallery1.png', 'e2e/gallery2.png']);
    await expect(page.getByText('2 / 10')).toBeVisible();

    // Itinerary
    await page.getByRole('button', { name: 'Itinerary' }).click();
    await page.getByPlaceholder('e.g. 08:00').fill('08:00');
    await page.getByPlaceholder('What happens at this stop?').fill('Pickup from hotel');
    await page.getByRole('button', { name: 'Add another stop' }).click();

    // Submit
    await page.getByRole('button', { name: /Create listing/i }).click();

    // Should redirect to /listings
    await page.waitForURL('/listings');
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  });
});
