import { expect, test } from '@playwright/test';

test('parcours produit complet : inscription, creation de session, ecriture, vote, et resultats', async ({ page }) => {
  let currentStep = 'waiting';
  let voted = false;
  let cardsCount = 0;
  const cardsList: any[] = [];

  // ── MOCKS RÉSEAU DYNAMIQUES ──

  // 1. Inscription
  await page.route('http://localhost:8000/auth/signup', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          token: 'full-journey-token',
          userId: 1,
          username: 'JohnDoe',
          email: 'john@example.com',
        },
      }),
    });
  });

  // 2. Profil
  await page.route('http://localhost:8000/auth/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { userId: 1, username: 'JohnDoe', email: 'john@example.com' }
      }),
    });
  });

  // 3. Création de session
  await page.route('http://localhost:8000/session/create-session', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { sessionId: 600, code: '6000', name: 'Sprint Full Journey' },
      }),
    });
  });

  // 4. Détails de la session 600 (dynamique basé sur currentStep)
  await page.route('http://localhost:8000/session/600', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 600,
          name: 'Sprint Full Journey',
          code: '6000',
          status: 'open',
          step: currentStep,
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
        },
      }),
    });
  });

  // 5. Participants
  await page.route('http://localhost:8000/session/600/participants/self', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, role: 'facilitator' } }),
    });
  });

  await page.route('http://localhost:8000/session/600/participants', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [{ id: 1, sessionId: 600, displayName: 'JohnDoe', role: 'facilitator', status: 'online' }],
      }),
    });
  });

  // 6. Gestion des cartes (dynamique)
  await page.route('http://localhost:8000/session/600/cards', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON();
      cardsCount++;
      cardsList.push({
        id: cardsCount,
        sessionId: 600,
        authorId: 1,
        authorName: 'JohnDoe',
        columnType: payload.columnType,
        content: payload.content,
        createdAt: '2026-07-07T10:00:00.000Z',
        votesCount: voted ? 1 : 0,
        votedByMe: voted,
      });
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { cardId: cardsCount } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: cardsList.map(card => ({
          ...card,
          votesCount: voted ? 1 : 0,
          votedByMe: voted,
        })),
      }),
    });
  });

  // 7. Transition d'étape (dynamique)
  await page.route('http://localhost:8000/session/600/step', async (route) => {
    const payload = route.request().postDataJSON();
    currentStep = payload.step;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  // 8. Vote
  await page.route('http://localhost:8000/session/600/cards/1/vote', async (route) => {
    voted = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { votesCount: 1 } }),
    });
  });

  // ── DÉROULEMENT DU SCÉNARIO ──

  // 1. Inscription (Signup)
  await page.goto('/signup');
  await page.getByLabel("Pseudonyme (Nom d'utilisateur)").fill('JohnDoe');
  await page.getByLabel('Adresse e-mail').fill('john@example.com');
  await page.getByLabel('Mot de passe', { exact: true }).fill('Password123');
  await page.getByLabel('Confirmation du mot de passe').fill('Password123');
  await page.getByRole('button', { name: "S'inscrire" }).click();

  // Attendre d'être redirigé vers l'accueil suite à l'inscription réussie
  await expect(page).toHaveURL('/');

  // 2. Création de session (directement sur la page d'accueil connectée)
  await page.getByLabel('Nom de la rétro').fill('Sprint Full Journey');
  await page.getByLabel('Format de rétro').selectOption('start-stop-continue');
  await page.getByRole('button', { name: 'Créer et lancer' }).click();

  // Attendre la redirection directe vers le tableau
  await expect(page).toHaveURL(/\/session\/600$/);

  // 3. Salle d'attente (Waiting Step)
  const startButton = page.getByRole('button', { name: 'Lancer la rétro' });
  await expect(startButton).toBeVisible();
  await startButton.click();

  // 4. Écriture (Writing Step)
  const textarea = page.getByPlaceholder('Nouvelle carte...').first();
  await expect(textarea).toBeVisible();
  await textarea.fill('Une idée de test');
  await page.getByRole('button', { name: 'Ajouter' }).first().click();

  // Passage aux votes
  const startVotingButton = page.getByRole('button', { name: 'Passer au vote →' });
  await expect(startVotingButton).toBeVisible();
  await startVotingButton.click();

  // 5. Votes (Voting Step)
  const quotaStatus = page.getByRole('status', { name: '5 votes restants sur 5' });
  await expect(quotaStatus).toBeVisible();

  const cardItem = page.locator('div').filter({ hasText: 'JohnDoeUne idée de test' }).first();
  await expect(cardItem).toBeVisible();
  const voteButton = cardItem.getByRole('button', { name: 'Voter' });
  await expect(voteButton).toBeVisible();
  await voteButton.click();

  // Passage aux résultats
  const viewResultsButton = page.getByRole('button', { name: 'Voir les résultats →' });
  await expect(viewResultsButton).toBeVisible();
  await viewResultsButton.click();

  // 6. Résultats (Results Step)
  const resultsTitle = page.getByRole('heading', { name: 'Top 3 des cartes' });
  await expect(resultsTitle).toBeVisible();

  // Vérification de la présence de la carte avec la médaille d'or
  const topCard = page.locator('article').filter({ hasText: '🥇' });
  await expect(topCard.getByText('Une idée de test')).toBeVisible();
  await expect(topCard.getByText('1')).toBeVisible();
});
