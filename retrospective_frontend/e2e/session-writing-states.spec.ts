import { expect, test, type Page } from '@playwright/test';

const prepareStatesSession = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.setItem('token', 'playwright-token');
  });

  await page.route('http://localhost:8000/api/auth/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { userId: 1, username: 'JohnDoe', email: 'john@example.com' },
      }),
    });
  });

  // Mock de session avec un délai artificiel pour laisser le temps de voir l'état de chargement
  await page.route('http://localhost:8000/api/session/400', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 400,
          name: 'Session states test',
          code: '4000',
          status: 'open',
          step: 'writing',
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });

  await page.route('http://localhost:8000/api/session/400/cards', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }), // Aucun message = colonnes vides
    });
  });

  await page.route('http://localhost:8000/api/session/400/participants/self', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, role: 'facilitator' } }),
    });
  });

  await page.route('http://localhost:8000/api/session/400/participants', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [{ id: 1, sessionId: 400, displayName: 'JohnDoe', role: 'facilitator', status: 'online' }],
      }),
    });
  });
};

test("visualise l'état de chargement et les EmptyStates du tableau d'écriture", async ({ page }) => {
  await prepareStatesSession(page);

  // 1. Accès à la session
  await page.goto('/session/400');

  // 2. Vérification immédiate du texte de chargement initial
  await expect(page.getByText('Chargement de la session...')).toBeVisible();

  // 3. Attente de la fin du chargement et de l'affichage du tableau
  await expect(page.getByText('Chargement de la session...')).not.toBeVisible();
  await expect(page.getByText('Session states test')).toBeVisible();

  // 4. Vérification des EmptyStates pour chaque colonne
  // Les 3 colonnes vides doivent afficher leurs titres respectifs d'état vide
  await expect(page.getByText('Aucune carte commencer')).toBeVisible();
  await expect(page.getByText('Aucune carte arrêter')).toBeVisible();
  await expect(page.getByText('Aucune carte continuer')).toBeVisible();

  // Et chaque colonne affiche la description d'ajout d'une idée
  await expect(page.getByText('Ajoutez une première idée dans cette colonne…')).toHaveCount(3);
});
