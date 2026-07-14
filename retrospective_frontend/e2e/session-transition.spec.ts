import { expect, test, type Page } from '@playwright/test';

const prepareBaseMocks = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.setItem('token', 'playwright-token');
  });

  await page.route('http://localhost:8000/auth/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { userId: 1, username: 'Facilitateur' }
      }),
    });
  });

  await page.route('http://localhost:8000/session/500/cards', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            sessionId: 500,
            authorId: 1,
            authorName: 'Facilitateur',
            columnType: 'start',
            content: 'Carte transition',
            createdAt: '2026-07-07T10:00:00.000Z',
            votesCount: 0,
            votedByMe: false,
          },
        ],
      }),
    });
  });

  await page.route('http://localhost:8000/session/500/participants/self', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, role: 'facilitator' } }),
    });
  });

  await page.route('http://localhost:8000/session/500/participants', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            sessionId: 500,
            displayName: 'Facilitateur',
            role: 'facilitator',
            status: 'online',
          },
        ],
      }),
    });
  });

  // Par défaut, le PATCH sur step réussit
  await page.route('http://localhost:8000/session/500/step', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
};

test('visualise et enchaîne les 4 étapes de session contrôlées par le facilitateur', async ({ page }) => {
  await prepareBaseMocks(page);

  // 1. Initialisation en mode 'waiting'
  await page.route('http://localhost:8000/session/500', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 500,
          name: 'Session transition test',
          code: '5000',
          status: 'open',
          step: 'waiting',
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });

  await page.goto('/session/500');

  // ── ÉTAPE 1 : Waiting Step ──
  const startButton = page.getByRole('button', { name: 'Lancer la rétro' });
  await expect(startButton).toBeVisible();

  // Préparation du mock pour l'étape suivante ('writing')
  await page.route('http://localhost:8000/session/500', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 500,
          name: 'Session transition test',
          code: '5000',
          status: 'open',
          step: 'writing',
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });

  const patchPromise1 = page.waitForRequest('http://localhost:8000/session/500/step');
  await startButton.click();
  const request1 = await patchPromise1;
  expect(request1.postDataJSON().step).toBe('writing');

  // ── ÉTAPE 2 : Writing Step ──
  const writingTextarea = page.getByPlaceholder('Nouvelle carte...').first();
  await expect(writingTextarea).toBeVisible();

  const startVotingButton = page.getByRole('button', { name: 'Passer au vote →' });
  await expect(startVotingButton).toBeVisible();

  // Préparation du mock pour l'étape suivante ('voting')
  await page.route('http://localhost:8000/session/500', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 500,
          name: 'Session transition test',
          code: '5000',
          status: 'open',
          step: 'voting',
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });

  const patchPromise2 = page.waitForRequest('http://localhost:8000/session/500/step');
  await startVotingButton.click();
  const request2 = await patchPromise2;
  expect(request2.postDataJSON().step).toBe('voting');

  // ── ÉTAPE 3 : Voting Step ──
  const quotaStatus = page.getByRole('status', { name: '5 votes restants sur 5' });
  await expect(quotaStatus).toBeVisible();

  const viewResultsButton = page.getByRole('button', { name: 'Voir les résultats →' });
  await expect(viewResultsButton).toBeVisible();

  // Préparation du mock pour l'étape suivante ('results')
  await page.route('http://localhost:8000/session/500', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 500,
          name: 'Session transition test',
          code: '5000',
          status: 'open',
          step: 'results',
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });

  const patchPromise3 = page.waitForRequest('http://localhost:8000/session/500/step');
  await viewResultsButton.click();
  const request3 = await patchPromise3;
  expect(request3.postDataJSON().step).toBe('results');

  // ── ÉTAPE 4 : Results Step ──
  const resultsTitle = page.getByRole('heading', { name: 'Top 3 des cartes' });
  await expect(resultsTitle).toBeVisible();
});
