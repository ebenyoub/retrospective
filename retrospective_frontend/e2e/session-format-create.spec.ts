import { expect, test } from '@playwright/test';

const formats = [
  {
    id: 'start-stop-continue',
    name: 'Commencer / Arrêter / Continuer',
    columns: ['Commencer', 'Arrêter', 'Continuer'],
  },
  {
    id: 'positive-negative-actions',
    name: 'Points positifs / Points négatifs / Actions',
    columns: ['Points positifs', 'Points négatifs', 'Actions'],
  },
  {
    id: 'success-difficulties-ideas',
    name: 'Succès / Difficultés / Idées',
    columns: ['Succès', 'Difficultés', 'Idées'],
  },
  {
    id: 'liked-less-liked-proposals',
    name: "J'ai aimé / J'ai moins aimé / Propositions",
    columns: ["J'ai aimé", "J'ai moins aimé", 'Propositions'],
  },
  {
    id: 'keep-improve-innovate',
    name: 'Conserver / Améliorer / Innover',
    columns: ['Conserver', 'Améliorer', 'Innover'],
  },
  {
    id: 'went-well-improve-next-actions',
    name: 'Bien passé / À améliorer / Prochaines actions',
    columns: ['Bien passé', 'À améliorer', 'Prochaines actions'],
  },
];

test.describe('création de session avec format MVP', () => {
  for (const format of formats) {
    test(`envoie le format ${format.name}`, async ({ page }) => {
      let createPayload: unknown = null;

      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'playwright-token');
      });

      await page.route('**/auth/profile', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ userId: 1, username: 'Facilitateur' }),
        });
      });

      await page.route('**/session/create-session', async (route) => {
        createPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { sessionId: 100, code: '1234', name: 'Sprint format' },
          }),
        });
      });

      await page.goto('/session');

      await page.getByLabel('Nom de la session').fill('Sprint format');
      await page.getByLabel('Format de rétro').selectOption(format.id);
      await page.getByRole('button', { name: 'Créer la session' }).click();

      await expect(page.getByText('Félicitations !')).toBeVisible();
      expect(createPayload).toEqual({
        name: 'Sprint format',
        formatName: format.name,
        formatColumns: format.columns,
      });
    });
  }
});
