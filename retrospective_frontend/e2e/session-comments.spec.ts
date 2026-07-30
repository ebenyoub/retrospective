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

  // Le premier chargement ne trouve aucun commentaire ; l'ajout en crée un.
  let comments: Array<{ id: number; cardId: number; authorId: number; authorName: string; content: string; createdAt: string }> = [];

  await page.route('http://localhost:8000/session/300/cards/1/comments', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: comments }),
      });
      return;
    }

    if (route.request().method() === 'POST') {
      const created = {
        id: 1,
        cardId: 1,
        authorId: 1,
        authorName: 'JohnDoe',
        content: 'Un commentaire de test',
        createdAt: '2026-07-16T10:00:00.000Z',
      };
      comments = [...comments, created];
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Commentaire ajouté.', data: created }),
      });
      return;
    }

    return route.continue();
  });

  await page.route('http://localhost:8000/session/300/cards/1/comments/1', async (route) => {
    comments = comments.filter((comment) => comment.id !== 1);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Commentaire supprimé.' }),
    });
  });
};

test('ajoute et supprime un commentaire réel, sans donnée fictive', async ({ page }) => {
  await prepareCommentsSession(page);

  await page.goto('/session/300');

  const commentsButton = page.getByRole('button', { name: 'Commentaires' });
  await expect(commentsButton).toBeVisible();

  // 1. Clic sur le bouton de commentaires et dépliage de la section
  await commentsButton.click();

  const commentsSection = page.getByRole('region', { name: 'Commentaires' });
  await expect(commentsSection).toBeVisible();

  // 2. Vérification de l'état vide (aucun commentaire côté serveur)
  await expect(commentsSection.getByText('Aucun commentaire pour le moment.')).toBeVisible();

  // 3. Les contrôles sont utilisables (persistance réelle, plus de placeholder désactivé)
  const textarea = commentsSection.getByRole('textbox', { name: 'Écrire un commentaire' });
  await expect(textarea).toBeEnabled();

  const sendButton = commentsSection.getByRole('button', { name: 'Envoyer le commentaire' });
  await expect(sendButton).toBeDisabled();

  // 4. Ajout d'un commentaire
  await textarea.fill('Un commentaire de test');
  await expect(sendButton).toBeEnabled();
  await sendButton.click();

  await expect(commentsSection.getByText('Un commentaire de test')).toBeVisible();

  // 5. L'auteur peut supprimer son propre commentaire
  await commentsSection.getByRole('button', { name: 'Supprimer le commentaire' }).click();
  await expect(commentsSection.getByText('Aucun commentaire pour le moment.')).toBeVisible();

  // 6. Vérification de la fermeture de la section en recliquant sur le bouton
  await commentsButton.click();
  await expect(commentsSection).not.toBeVisible();
});
