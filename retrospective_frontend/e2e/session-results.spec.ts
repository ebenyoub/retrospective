import { expect, test, type Page } from '@playwright/test';

const prepareResultsSession = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.setItem('token', 'playwright-token');
  });

  await page.route('http://localhost:8000/api/auth/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { userId: 1, username: 'Facilitateur' }
      }),
    });
  });

  await page.route('http://localhost:8000/api/session/400', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 400,
          name: 'Session results test',
          code: '4000',
          status: 'open',
          step: 'results',
          ownerId: 1,
          formatName: 'Succès / Difficultés / Idées',
          formatColumns: ['Succès', 'Difficultés', 'Idées'],
        },
      }),
    });
  });

  await page.route('http://localhost:8000/api/session/400/cards', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            sessionId: 400,
            authorId: 2,
            authorName: 'Participant 1',
            columnType: 'start',
            content: 'Livraison réussie',
            createdAt: '2026-07-07T10:00:00.000Z',
            votesCount: 2,
            votedByMe: false,
          },
          {
            id: 2,
            sessionId: 400,
            authorId: 3,
            authorName: 'Participant 2',
            columnType: 'stop',
            content: 'Blocage API',
            createdAt: '2026-07-07T10:01:00.000Z',
            votesCount: 5,
            votedByMe: false,
          },
          {
            id: 3,
            sessionId: 400,
            authorId: 4,
            authorName: 'Participant 3',
            columnType: 'continue',
            content: 'Atelier de test',
            createdAt: '2026-07-07T10:02:00.000Z',
            votesCount: 1,
            votedByMe: false,
          },
        ],
      }),
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
        data: [
          {
            id: 1,
            sessionId: 400,
            displayName: 'Facilitateur',
            role: 'facilitator',
            status: 'online',
          },
        ],
      }),
    });
  });
};

test('visualise le tableau des résultats avec le Top 3 et les libellés dynamiques de format', async ({ page }) => {
  await prepareResultsSession(page);

  await page.goto('/session/400');

  // 1. Vérification de l'accès à l'étape "results" par la présence du Top 3
  const top3Title = page.getByRole('heading', { name: 'Top 3 des cartes' });
  await expect(top3Title).toBeVisible();

  // 2. Vérification de l'ordre de tri des cartes (les plus votées en premier : 🥇, 🥈, 🥉)
  const firstMedal = page.locator('article').filter({ hasText: '🥇' });
  await expect(firstMedal.getByText('Blocage API')).toBeVisible();
  await expect(firstMedal.getByText('5')).toBeVisible();

  const secondMedal = page.locator('article').filter({ hasText: '🥈' });
  await expect(secondMedal.getByText('Livraison réussie')).toBeVisible();
  await expect(secondMedal.getByText('2')).toBeVisible();

  const thirdMedal = page.locator('article').filter({ hasText: '🥉' });
  await expect(thirdMedal.getByText('Atelier de test')).toBeVisible();
  await expect(thirdMedal.getByText('1')).toBeVisible();

  // 3. Vérification des libellés dynamiques du format de rétrospective (Succès / Difficultés / Idées)
  await expect(page.getByText('Succès').first()).toBeVisible();
  await expect(page.getByText('Difficultés').first()).toBeVisible();
  await expect(page.getByText('Idées').first()).toBeVisible();

  // Les libellés génériques par défaut (ou d'autres formats) ne doivent pas être visibles
  await expect(page.getByText('Commencer')).toHaveCount(0);
  await expect(page.getByText('Arrêter')).toHaveCount(0);
});
