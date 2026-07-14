import { expect, test, type Page } from '@playwright/test';

const prepareSession = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.setItem('token', 'playwright-token');
  });

  await page.route('http://localhost:8000/auth/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { userId: 1, username: 'Facilitateur' },
      }),
    });
  });
  await page.route('http://localhost:8000/session/200', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 200,
          name: 'Session drawers',
          code: '2000',
          status: 'open',
          step: 'writing',
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });
  await page.route('http://localhost:8000/session/200/cards', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
  await page.route('http://localhost:8000/session/200/participants/self', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, role: 'facilitator' } }),
    });
  });
  await page.route('http://localhost:8000/session/200/participants', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            sessionId: 200,
            displayName: 'Facilitateur',
            role: 'facilitator',
            status: 'online',
          },
          {
            id: 2,
            sessionId: 200,
            displayName: 'Alice',
            role: 'participant',
            status: 'online',
          },
          {
            id: 3,
            sessionId: 200,
            displayName: 'Bob',
            role: 'participant',
            status: 'offline',
          },
        ],
      }),
    });
  });
};

test('ouvre et ferme les drawers au clavier et au clic extérieur', async ({ page }) => {
  await prepareSession(page);
  await page.goto('/session/200');

  const participantsTrigger = page.getByRole('button', { name: 'Participants' });
  await participantsTrigger.click();

  // Le drawer affiche Participants (3) au total
  const participantsDrawer = page.getByRole('dialog', { name: 'Participants (3)' });
  await expect(participantsDrawer).toBeVisible();
  await expect(participantsDrawer).toBeFocused();

  // Vérification de la taille et de l'aspect de l'avatar du premier participant
  const participantAvatar = participantsDrawer.locator('div[aria-hidden="true"]').filter({ hasText: 'F' });
  await expect(participantAvatar).toHaveCSS('width', '32px');
  await expect(participantAvatar).toHaveCSS('height', '32px');
  await expect(participantAvatar).toHaveCSS('font-size', '12px');
  await expect(participantAvatar).toHaveCSS('background-color', 'rgb(239, 68, 68)');

  // ── VALIDATION DES RÔLES ET STATUTS (MVP-PARTICIPANTS-02) ──

  // 1. Facilitateur (rôle Facilitateur, badge Hôte, en ligne)
  const facItem = participantsDrawer.locator('li').filter({ hasText: 'Facilitateur' });
  // Le nom "Facilitateur" est présent 2 fois (le pseudo de l'hôte et son rôle "Facilitateur")
  await expect(facItem.getByText('Facilitateur', { exact: true })).toHaveCount(2);
  await expect(facItem.getByText('Hôte')).toBeVisible();
  await expect(facItem.getByText('En ligne')).toBeVisible();

  // 2. Alice (rôle Participant, en ligne, pas de badge Hôte)
  const aliceItem = participantsDrawer.locator('li').filter({ hasText: 'Alice' });
  await expect(aliceItem.getByText('Participant')).toBeVisible();
  await expect(aliceItem.getByText('Hôte')).toHaveCount(0);
  await expect(aliceItem.getByText('En ligne')).toBeVisible();

  // 3. Bob (rôle Participant, hors ligne)
  const bobItem = participantsDrawer.locator('li').filter({ hasText: 'Bob' });
  await expect(bobItem.getByText('Participant')).toBeVisible();
  await expect(bobItem.getByText('Hors ligne')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(participantsDrawer).not.toBeVisible();
  await expect(participantsTrigger).toBeFocused();

  await page.getByRole('button', { name: 'Discussion' }).click();
  const discussionDrawer = page.getByRole('dialog', { name: 'Discussion' });
  await expect(discussionDrawer).toBeVisible();

  await page.getByRole('button', { name: 'Fermer le panneau Discussion' }).click();
  await expect(discussionDrawer).not.toBeVisible();
});

test('conserve les placements mobiles des deux drawers', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await prepareSession(page);
  await page.goto('/session/200');

  await page.getByRole('button', { name: 'Participants' }).click();
  const participantsDrawer = page.getByRole('dialog', { name: 'Participants (3)' });
  await expect(participantsDrawer).toHaveClass(/bottom-0/);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Discussion' }).click();
  const discussionDrawer = page.getByRole('dialog', { name: 'Discussion' });
  await expect(discussionDrawer).toHaveClass(/inset-0/);
});
