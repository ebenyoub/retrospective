import { expect, test, type Page } from '@playwright/test';

const prepareCommentsSession = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.setItem('token', 'playwright-token');
  });

  await page.route('http://localhost:8000/auth/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { userId: 1, username: 'JohnDoe', email: 'john@example.com' },
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
          name: 'Session comments test',
          code: '3000',
          status: 'open',
          step: 'writing',
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
            authorId: 1,
            authorName: 'JohnDoe',
            columnType: 'start',
            content: 'Carte test focus',
            createdAt: '2026-07-07T10:00:00.000Z',
            votesCount: 0,
            votedByMe: false,
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
        data: [{ id: 1, sessionId: 300, displayName: 'JohnDoe', role: 'facilitator', status: 'online' }],
      }),
    });
  });
};

test('visualise la modal de commentaires, ses limitations et valide la gestion du focus trap', async ({ page }) => {
  await prepareCommentsSession(page);

  await page.goto('/session/300');

  const commentsButton = page.getByRole('button', { name: 'Ouvrir les commentaires' });
  await expect(commentsButton).toBeVisible();

  // 1. Clic sur le bouton de commentaires et ouverture de la modal
  await commentsButton.click();

  const commentsModal = page.getByRole('dialog');
  await expect(commentsModal).toBeVisible();

  // 2. Vérification de l'état vide
  const emptyStateMessage = commentsModal.getByText('Aucun commentaire disponible');
  await expect(emptyStateMessage).toBeVisible();

  // 3. Vérification des contrôles désactivés
  const textarea = commentsModal.getByRole('textbox', { name: 'Écrire un commentaire' });
  await expect(textarea).toBeDisabled();

  const sendButton = commentsModal.getByRole('button', { name: 'Envoyer le commentaire' });
  await expect(sendButton).toBeDisabled();

  // 4. Vérification de la fermeture de la modal via la touche Escape
  await page.keyboard.press('Escape');
  await expect(commentsModal).not.toBeVisible();

  // 5. Validation du focus trap : restauration du focus sur le bouton d'origine
  await expect(commentsButton).toBeFocused();
});
