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

  const participantsDrawer = page.getByRole('dialog', { name: 'Participants (1)' });
  await expect(participantsDrawer).toBeVisible();
  await expect(participantsDrawer).toBeFocused();
  const participantAvatar = participantsDrawer.locator('div[aria-hidden="true"]').filter({ hasText: 'F' });
  await expect(participantAvatar).toHaveCSS('width', '32px');
  await expect(participantAvatar).toHaveCSS('height', '32px');
  await expect(participantAvatar).toHaveCSS('font-size', '12px');
  await expect(participantAvatar).toHaveCSS('background-color', 'rgb(239, 68, 68)');

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
  const participantsDrawer = page.getByRole('dialog', { name: 'Participants (1)' });
  await expect(participantsDrawer).toHaveClass(/bottom-0/);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Discussion' }).click();
  const discussionDrawer = page.getByRole('dialog', { name: 'Discussion' });
  await expect(discussionDrawer).toHaveClass(/inset-0/);
});
