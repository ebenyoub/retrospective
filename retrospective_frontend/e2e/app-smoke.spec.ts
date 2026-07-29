import { expect, test } from '@playwright/test';

test('ouvre l application et genere une capture', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/retrospective/i);
  await expect(page.getByText('Range ta chambre').first()).toBeVisible();

  await page.screenshot({
    path: 'test-results/screenshots/home.png',
    fullPage: true,
  });
});
