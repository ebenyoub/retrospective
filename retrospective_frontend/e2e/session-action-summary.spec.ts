import { expect, test, type Page } from '@playwright/test';

const prepareActionSummarySession = async (
  page: Page,
  state: { currentStep: string },
  actions: Array<{ id: number; description: string; owner: string; priority: string; deadline: string | null }>,
  selfRole: 'facilitator' | 'participant' = 'facilitator'
): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.setItem('token', 'playwright-token');
  });

  await page.route('http://localhost:8000/api/auth/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        // Le rôle facilitateur/participant est déterminé côté frontend par
        // comparaison userId (ce profil) === ownerId (session, toujours 1),
        // pas par le champ `role` de /participants/self.
        success: true,
        data: { userId: selfRole === 'facilitator' ? 1 : 2, username: selfRole === 'facilitator' ? 'Facilitateur' : 'Participant 1' }
      }),
    });
  });

  await page.route('http://localhost:8000/api/session/600', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 600,
          name: 'Session action/résumé test',
          code: '6000',
          status: 'open',
          step: state.currentStep,
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });

  await page.route('http://localhost:8000/api/session/600/cards', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            sessionId: 600,
            authorId: 2,
            authorName: 'Participant 1',
            columnType: 'start',
            content: 'Carte la plus votée',
            createdAt: '2026-07-07T10:00:00.000Z',
            votesCount: 5,
            votedByMe: false,
          },
          {
            id: 2,
            sessionId: 600,
            authorId: 3,
            authorName: 'Participant 2',
            columnType: 'stop',
            content: 'Carte peu votée',
            createdAt: '2026-07-07T10:01:00.000Z',
            votesCount: 1,
            votedByMe: false,
          },
        ],
      }),
    });
  });

  await page.route('http://localhost:8000/api/session/600/participants/self', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: selfRole === 'facilitator' ? 1 : 2, role: selfRole } }),
    });
  });

  await page.route('http://localhost:8000/api/session/600/participants', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          { id: 1, sessionId: 600, displayName: 'Facilitateur', role: 'facilitator', status: 'online' },
          { id: 2, sessionId: 600, displayName: 'Participant 1', role: 'participant', status: 'online' },
        ],
      }),
    });
  });

  await page.route('http://localhost:8000/api/session/600/step', async (route) => {
    const payload = route.request().postDataJSON();
    state.currentStep = payload.step;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { step: payload.step, stepEndsAt: null } }),
    });
  });

  await page.route('http://localhost:8000/api/session/600/actions', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON();
      const created = {
        id: actions.length + 1,
        description: payload.description,
        owner: payload.owner,
        priority: payload.priority,
        deadline: payload.deadline ?? null,
      };
      actions.push(created);

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Action enregistrée.', data: { ...created, sessionId: 600, createdAt: new Date().toISOString() } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: actions.map((a) => ({ ...a, sessionId: 600, createdAt: '2026-07-19T10:00:00.000Z' })),
      }),
    });
  });

  await page.route('http://localhost:8000/api/session/600/chat/messages', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
};

test('le facilitateur ajoute une action, voit le podium de référence, revient en arrière puis clôture via le récapitulatif', async ({ page }) => {
  const state = { currentStep: 'action' };
  const actions: Array<{ id: number; description: string; owner: string; priority: string; deadline: string | null }> = [];

  await prepareActionSummarySession(page, state, actions);
  await page.goto('/session/600');

  // ── Plan d'action : le podium de référence est visible (US-15) ──
  await expect(page.getByText('Top 5 des cartes')).toBeVisible();
  const podiumArticles = page.locator('article').filter({ hasText: 'Carte la plus votée' });
  await expect(podiumArticles).toBeVisible();

  // Ajout d'une action par le facilitateur
  await page.getByRole('button', { name: 'Ajouter une action' }).click();
  await page.getByLabel("Description de l'action").fill('Rédiger le compte-rendu de sprint');
  await page.getByLabel("Responsable de l'action").fill('Alice');
  await page.getByRole('button', { name: 'Priorité Haute' }).click();
  await page.getByRole('button', { name: "Ajouter l'action" }).click();

  await expect(page.getByText('Rédiger le compte-rendu de sprint')).toBeVisible();
  await expect(page.getByText('Alice')).toBeVisible();

  // ── Retour en arrière (US-15) : revient aux Résultats sans perdre l'action ──
  await page.getByRole('button', { name: 'Étape précédente' }).click();
  await expect(page.getByText("Revenir à l'étape précédente ?")).toBeVisible();
  await page.getByRole('button', { name: 'Revenir en arrière' }).click();

  await expect(page.getByText('Top 3 des cartes')).toBeVisible();
  expect(state.currentStep).toBe('results');

  // Un seul point de clôture : le bouton "Terminer la session" de la barre d'action.
  await expect(page.getByRole('button', { name: 'Terminer la session' })).toHaveCount(1);

  // Reprendre l'avancement jusqu'au récapitulatif final.
  await page.getByRole('button', { name: "Passer au plan d'action" }).click();
  await expect(page.getByText("Rédiger le compte-rendu de sprint")).toBeVisible();
  await page.getByRole('button', { name: 'Voir le récapitulatif' }).click();

  // ── Récapitulatif final ──
  await expect(page.getByText('✓ Prêt à clôturer')).toBeVisible();
  await expect(page.getByText('Top 3 des cartes')).toBeVisible();
  await expect(page.getByText('Rédiger le compte-rendu de sprint')).toBeVisible();
  await expect(page.getByText('Facilitateur').first()).toBeVisible();
  await expect(page.getByText('Participant 1').first()).toBeVisible();

  // Toujours un seul bouton de clôture, pas de doublon dans l'écran récapitulatif.
  await expect(page.getByRole('button', { name: 'Terminer la session' })).toHaveCount(1);
});

test('un participant non-facilitateur ne voit ni le formulaire d\'ajout d\'action ni le bouton de clôture', async ({ page }) => {
  const state = { currentStep: 'action' };
  const actions: Array<{ id: number; description: string; owner: string; priority: string; deadline: string | null }> = [
    { id: 1, description: 'Action déjà prévue', owner: 'Bob', priority: 'medium', deadline: null },
  ];

  await prepareActionSummarySession(page, state, actions, 'participant');

  await page.goto('/session/600');

  await expect(page.getByText('Action déjà prévue')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajouter une action' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Terminer la session' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Étape précédente' })).toHaveCount(0);
});
