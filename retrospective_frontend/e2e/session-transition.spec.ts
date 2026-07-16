import { expect, test, type Page } from '@playwright/test';

const prepareDynamicMocks = async (page: Page, state: { currentStep: string }): Promise<void> => {
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

  // Mock de session dynamique reflétant l'état courant
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
          step: state.currentStep,
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
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

  // Intercepteur du PATCH pour changer dynamiquement l'étape dans la "base de données" mockée
  await page.route('http://localhost:8000/session/500/step', async (route) => {
    const payload = route.request().postDataJSON();
    state.currentStep = payload.step;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
};

test('visualise et enchaîne les 4 étapes de session contrôlées par le facilitateur', async ({ page }) => {
  const state = { currentStep: 'waiting' };
  let patchStepPayloads: string[] = [];

  await prepareDynamicMocks(page, state);

  // Écouter les requêtes PATCH de transition pour vérification
  page.on('request', request => {
    if (request.url().endsWith('/session/500/step') && request.method() === 'PATCH') {
      const payload = request.postDataJSON();
      if (payload && payload.step) {
        patchStepPayloads.push(payload.step);
      }
    }
  });

  await page.goto('/session/500');

  // ── ÉTAPE 1 : Waiting Step ──
  const startButton = page.getByRole('button', { name: 'Lancer la rétro' });
  await expect(startButton).toBeVisible();
  await startButton.click();

  // ── ÉTAPE 2 : Writing Step ──
  const writingTextarea = page.getByPlaceholder('Nouvelle carte...').first();
  await expect(writingTextarea).toBeVisible();

  const startVotingButton = page.getByRole('button', { name: 'Passer au vote →' });
  await expect(startVotingButton).toBeVisible();
  await startVotingButton.click();

  // ── ÉTAPE 3 : Voting Step ──
  const quotaStatus = page.getByRole('status', { name: '5 votes restants sur 5' });
  await expect(quotaStatus).toBeVisible();

  const viewResultsButton = page.getByRole('button', { name: 'Voir les résultats →' });
  await expect(viewResultsButton).toBeVisible();
  await viewResultsButton.click();

  // ── ÉTAPE 4 : Results Step ──
  const resultsTitle = page.getByRole('heading', { name: 'Top 3 des cartes' });
  await expect(resultsTitle).toBeVisible();

  // Validation finale de l'historique des requêtes de transition émises
  expect(patchStepPayloads).toContain('writing');
  expect(patchStepPayloads).toContain('voting');
  expect(patchStepPayloads).toContain('results');
});
