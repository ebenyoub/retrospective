import { expect, test } from '@playwright/test';

type SessionStep = 'waiting' | 'writing' | 'voting' | 'results' | 'action' | 'summary';

interface RetroCardFixture {
  id: number;
  sessionId: number;
  authorId: number;
  authorName: string;
  columnType: 'start' | 'stop' | 'continue';
  content: string;
  createdAt: string;
  votesCount: number;
  votedByMe: boolean;
  commentsCount: number;
}

interface ActionFixture {
  id: number;
  sessionId: number;
  description: string;
  owner: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string | null;
  createdAt: string;
}

const isCardPayload = (value: unknown): value is { columnType: RetroCardFixture['columnType']; content: string } => (
  typeof value === 'object'
  && value !== null
  && 'columnType' in value
  && 'content' in value
  && (value.columnType === 'start' || value.columnType === 'stop' || value.columnType === 'continue')
  && typeof value.content === 'string'
);

const isStepPayload = (value: unknown): value is { step: SessionStep } => (
  typeof value === 'object'
  && value !== null
  && 'step' in value
  && (value.step === 'waiting' || value.step === 'writing' || value.step === 'voting' || value.step === 'results' || value.step === 'action' || value.step === 'summary')
);

const isActionPayload = (value: unknown): value is {
  description: string;
  owner: string;
  priority: ActionFixture['priority'];
  deadline?: string | null;
} => (
  typeof value === 'object'
  && value !== null
  && 'description' in value
  && 'owner' in value
  && 'priority' in value
  && typeof value.description === 'string'
  && typeof value.owner === 'string'
  && (value.priority === 'high' || value.priority === 'medium' || value.priority === 'low')
  && (!('deadline' in value) || value.deadline === null || typeof value.deadline === 'string')
);

test('parcours produit complet : inscription, création, écriture, vote, plan d’action, récapitulatif et clôture', async ({ page }) => {
  let currentStep: SessionStep = 'waiting';
  let voted: boolean = false;
  let closeRequestSucceeded: boolean = false;
  let cardsCount: number = 0;
  const cardsList: RetroCardFixture[] = [];
  const actionsList: ActionFixture[] = [];

  // ── MOCKS RÉSEAU DYNAMIQUES ──

  // 1. Inscription
  await page.route('http://localhost:8000/api/auth/signup', async (route) => {
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
  await page.route('http://localhost:8000/api/auth/profile', async (route) => {
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
  await page.route('http://localhost:8000/api/session/create-session', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { sessionId: 600, joinCode: '6000', name: 'Sprint Full Journey' },
      }),
    });
  });

  // 4. Détails de la session 600 (dynamique basé sur currentStep)
  await page.route('http://localhost:8000/api/session/600', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 600,
          name: 'Sprint Full Journey',
          joinCode: '6000',
          status: 'open',
          step: currentStep,
          ownerId: 1,
          formatName: 'Commencer / Arrêter / Continuer',
          formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
          stepDurationMinutes: 5,
          stepEndsAt: null,
        },
      }),
    });
  });

  // 5. Participants
  await page.route('http://localhost:8000/api/session/600/participants/self', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, role: 'facilitator' } }),
    });
  });

  await page.route('http://localhost:8000/api/session/600/participants', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: [{ id: 1, sessionId: 600, displayName: 'JohnDoe', role: 'facilitator', status: 'online' }],
      }),
    });
  });

  // Dépendances chargées au montage du tableau.
  await page.route('http://localhost:8000/api/session/600/messages', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.route('http://localhost:8000/api/session/600/actions', async (route) => {
    if (route.request().method() === 'POST') {
      const payload: unknown = route.request().postDataJSON();
      if (!isActionPayload(payload)) {
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ success: false }) });
        return;
      }

      const action: ActionFixture = {
        id: actionsList.length + 1,
        sessionId: 600,
        description: payload.description,
        owner: payload.owner,
        priority: payload.priority,
        deadline: payload.deadline ?? null,
        createdAt: '2026-07-07T10:05:00.000Z',
      };
      actionsList.push(action);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: action }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: actionsList }),
    });
  });

  // 6. Gestion des cartes (dynamique)
  await page.route('http://localhost:8000/api/session/600/cards', async (route) => {
    if (route.request().method() === 'POST') {
      const payload: unknown = route.request().postDataJSON();
      if (!isCardPayload(payload)) {
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ success: false }) });
        return;
      }
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
        commentsCount: 0,
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
  await page.route('http://localhost:8000/api/session/600/step', async (route) => {
    const payload: unknown = route.request().postDataJSON();
    if (!isStepPayload(payload)) {
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ success: false }) });
      return;
    }
    currentStep = payload.step;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { step: currentStep, stepEndsAt: null } }),
    });
  });

  // 8. Vote
  await page.route('http://localhost:8000/api/session/600/cards/1/vote', async (route) => {
    voted = true;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { voteId: 1, votesUsed: 1, votesLeft: 4, cardVotesCount: 1 },
      }),
    });
  });

  // 9. Clôture de session et liste affichée après redirection.
  await page.route('http://localhost:8000/api/session/600/close', async (route) => {
    closeRequestSucceeded = route.request().method() === 'POST';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { status: 'closed' } }),
    });
  });

  await page.route('http://localhost:8000/api/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
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
  await page.getByLabel('Format de rétro').click();
  await page.getByRole('option', { name: 'Commencer / Arrêter / Continuer' }).click();
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
  const startVotingButton = page.getByRole('button', { name: 'Passer au vote' });
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
  await expect(page.getByRole('status', { name: '4 votes restants sur 5' })).toBeVisible();
  await expect(cardItem.getByRole('button', { name: 'Voté' })).toBeVisible();

  // Passage aux résultats
  const viewResultsButton = page.getByRole('button', { name: 'Voir les résultats' });
  await expect(viewResultsButton).toBeVisible();
  await viewResultsButton.click();

  // 6. Résultats (Results Step)
  const resultsTitle = page.getByRole('heading', { name: 'Top 3 des cartes' });
  await expect(resultsTitle).toBeVisible();

  // Vérification de la présence de la carte avec la médaille d'or
  const topCard = page.locator('article').filter({ hasText: '🥇' });
  await expect(topCard.getByText('Une idée de test')).toBeVisible();
  await expect(topCard.getByText('1')).toBeVisible();

  // 7. Plan d'action
  await page.getByRole('button', { name: "Passer au plan d'action" }).click();
  await expect(page.getByRole('heading', { name: "Plan d'action" })).toBeVisible();
  await page.getByRole('button', { name: 'Ajouter une action' }).click();
  await page.getByLabel("Description de l'action").fill('Partager les résultats avec l’équipe');
  await page.getByLabel("Responsable de l'action").fill('JohnDoe');
  await page.getByRole('button', { name: 'Priorité Haute' }).click();
  await page.getByRole('button', { name: "Ajouter l'action" }).click();
  await expect(page.getByText('Partager les résultats avec l’équipe')).toBeVisible();

  // 8. Récapitulatif
  await page.getByRole('button', { name: 'Voir le récapitulatif' }).click();
  await expect(page.getByText('✓ Prêt à clôturer')).toBeVisible();
  await expect(page.getByText('Une idée de test')).toBeVisible();
  await expect(page.getByText('Partager les résultats avec l’équipe')).toBeVisible();

  // 9. Clôture puis redirection vers les sessions du facilitateur.
  await page.getByRole('button', { name: 'Terminer la session' }).click();
  await expect(page).toHaveURL('/sessions');
  expect(closeRequestSucceeded).toBe(true);
});
