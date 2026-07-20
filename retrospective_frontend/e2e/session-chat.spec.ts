import { expect, test, type Page } from '@playwright/test';

const prepareChatSession = async (page: Page): Promise<void> => {
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

  await page.route('http://localhost:8000/session/450', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 450,
          name: 'Session chat test',
          code: '4500',
          status: 'open',
          step: 'writing',
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });

  await page.route('http://localhost:8000/session/450/cards', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route('http://localhost:8000/session/450/participants/self', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, role: 'facilitator' } }),
    });
  });

  await page.route('http://localhost:8000/session/450/participants', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [{ id: 1, sessionId: 450, displayName: 'JohnDoe', role: 'facilitator', status: 'online' }],
      }),
    });
  });

  let messages: Array<{ id: number; sessionId: number; authorId: number; authorName: string; content: string; createdAt: string }> = [];

  await page.route('http://localhost:8000/session/450/chat/messages', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: messages }),
      });
      return;
    }

    if (route.request().method() === 'POST') {
      const created = {
        id: messages.length + 1,
        sessionId: 450,
        authorId: 1,
        authorName: 'JohnDoe',
        content: 'Hello world, ceci est un test de discussion',
        createdAt: new Date().toISOString(),
      };
      messages = [...messages, created];
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Message envoyé.', data: created }),
      });
      return;
    }

    return route.continue();
  });
};

test('ajoute et affiche des messages dans le chat en temps réel', async ({ page }) => {
  await prepareChatSession(page);

  page.on('console', (msg) => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  await page.goto('/session/450');

  const chatButton = page.getByRole('button', { name: 'Discussion' });
  await expect(chatButton).toBeVisible();

  // 1. Ouvrir le drawer de discussion
  await chatButton.click();

  // Desktop : panneau docké (role="complementary"), plus un dialog modal —
  // on peut lire/interagir avec le reste de l'écran pendant qu'il est ouvert.
  const chatDrawer = page.getByRole('complementary', { name: 'Discussion' });
  await expect(chatDrawer).toBeVisible();

  // 2. Vérification de l'état vide
  await expect(chatDrawer.getByText('Aucun message pour le moment')).toBeVisible();
  await expect(chatDrawer.getByText('0 messages')).toBeVisible();

  // 3. Écriture d'un message
  const textarea = chatDrawer.getByRole('textbox', { name: 'Écrire un message' });
  await expect(textarea).toBeEnabled();

  const sendButton = chatDrawer.getByRole('button', { name: 'Envoyer le message' });
  await expect(sendButton).toBeDisabled();

  await textarea.fill('Hello world, ceci est un test de discussion');
  await expect(sendButton).toBeEnabled();
  await sendButton.click();

  // 4. Vérification que le message est affiché et que le compteur est mis à jour
  await expect(chatDrawer.getByText('Hello world, ceci est un test de discussion')).toBeVisible();
  await expect(chatDrawer.getByText('1 message')).toBeVisible();

  // 5. Fermeture du drawer
  await page.keyboard.press('Escape');
  await expect(chatDrawer).not.toBeVisible();
});
