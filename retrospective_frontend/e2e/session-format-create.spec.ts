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
      const cardPayloads: unknown[] = [];

      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'playwright-token');
      });

      await page.route('**/auth/profile', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { userId: 1, username: 'Facilitateur' },
          }),
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
      await page.route('**/session/100', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 100,
              name: 'Sprint format',
              code: '1234',
              status: 'open',
              step: 'writing',
              ownerId: 1,
              formatName: format.name,
              formatColumns: format.columns,
            },
          }),
        });
      });
      await page.route('**/session/100/cards', async (route) => {
        if (route.request().method() === 'POST') {
          cardPayloads.push(route.request().postDataJSON());
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: { cardId: cardPayloads.length } }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      });
      await page.route('**/session/100/participants/self', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { id: 1, role: 'facilitator' } }),
        });
      });
      await page.route('**/session/100/participants', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ id: 1, sessionId: 100, displayName: 'Facilitateur', role: 'facilitator', status: 'online' }],
          }),
        });
      });

      await page.route('**/session/resume/active', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: null }),
        });
      });

      await page.goto('/session');

      await page.getByLabel('Nom de la session').fill('Sprint format');
      await page.getByLabel('Format de rétro').click();
      await page.getByRole('option', { name: format.name }).click();
      await page.getByRole('button', { name: 'Créer la session' }).click();

      await expect(page.getByText('Félicitations !')).toBeVisible();
      expect(createPayload).toEqual({
        name: 'Sprint format',
        formatName: format.name,
        formatColumns: format.columns,
        stepDurationMinutes: 5,
      });

      await page.getByRole('button', { name: 'Accéder au tableau' }).click();

      for (const column of format.columns) {
        await expect(page.getByText(column).first()).toBeVisible();
      }

      const textareas = page.getByPlaceholder('Nouvelle carte...');
      const addButtons = page.getByRole('button', { name: 'Ajouter' });

      await textareas.nth(0).fill(`Carte ${format.columns[0]}`);
      await addButtons.nth(0).click();
      await textareas.nth(1).fill(`Carte ${format.columns[1]}`);
      await addButtons.nth(1).click();
      await textareas.nth(2).fill(`Carte ${format.columns[2]}`);
      await addButtons.nth(2).click();

      await expect.poll(() => cardPayloads).toEqual([
        { content: `Carte ${format.columns[0]}`, columnType: 'start' },
        { content: `Carte ${format.columns[1]}`, columnType: 'stop' },
        { content: `Carte ${format.columns[2]}`, columnType: 'continue' },
      ]);
    });
  }
});
