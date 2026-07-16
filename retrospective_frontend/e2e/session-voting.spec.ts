import { expect, test, type Page } from '@playwright/test';

const prepareVotingSession = async (page: Page, votedState: { voted: boolean }): Promise<void> => {
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

  await page.route('http://localhost:8000/session/300', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 300,
          name: 'Session voting test',
          code: '3000',
          status: 'open',
          step: 'voting',
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });

  await page.route('http://localhost:8000/session/300/cards', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            sessionId: 300,
            authorId: 2,
            authorName: 'Participant',
            columnType: 'start',
            content: 'Une carte de test',
            createdAt: '2026-07-07T10:00:00.000Z',
            votesCount: votedState.voted ? 1 : 0,
            votedByMe: votedState.voted,
          },
        ],
      }),
    });
  });

  await page.route('http://localhost:8000/session/300/participants/self', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, role: 'facilitator' } }),
    });
  });

  await page.route('http://localhost:8000/session/300/participants', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            sessionId: 300,
            displayName: 'Facilitateur',
            role: 'facilitator',
            status: 'online',
          },
        ],
      }),
    });
  });
};

test('visualise la barre de quota et effectue un vote sur une carte', async ({ page }) => {
  const votedState = { voted: false };
  let votePayloadCaptured = false;

  await prepareVotingSession(page, votedState);

  // Mock du endpoint de vote
  await page.route('http://localhost:8000/session/300/cards/1/vote', async (route) => {
    votedState.voted = true;
    votePayloadCaptured = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { votesCount: 1 } }),
    });
  });

  await page.goto('/session/300');

  // 1. Vérification de la présence de la barre d'action et du quota initial
  const quotaStatus = page.getByRole('status', { name: '5 votes restants sur 5' });
  await expect(quotaStatus).toBeVisible();

  // 2. Vérification des détails de la carte de test
  const cardItem = page.locator('div').filter({ hasText: 'ParticipantUne carte de test' }).first();
  await expect(cardItem).toBeVisible();
  await expect(cardItem.locator('span').filter({ hasText: '0 vote' })).toBeVisible();

  // 3. Clic sur le bouton de vote
  const voteButton = cardItem.getByRole('button', { name: 'Voter' });
  await expect(voteButton).toBeVisible();
  await voteButton.click();

  // 4. Vérification que l'API de vote a bien été appelée
  expect(votePayloadCaptured).toBe(true);

  // 5. Vérification du changement d'état du bouton et de la décrémentation du quota à l'écran
  const votedButton = cardItem.getByRole('button', { name: 'Voté' });
  await expect(votedButton).toBeVisible();
  await expect(votedButton).toBeDisabled();

  // 6. Vérification du quota mis à jour dans la barre
  const updatedQuotaStatus = page.getByRole('status', { name: '4 votes restants sur 5' });
  await expect(updatedQuotaStatus).toBeVisible();
});
