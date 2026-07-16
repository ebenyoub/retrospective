import { expect, test } from '@playwright/test';

test.describe('Parcours d\'authentification et d\'identité étanches', () => {
  
  test.beforeEach(async ({ page }) => {
    // Rediriger la console du navigateur pour voir les erreurs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`BROWSER ERROR: ${msg.text()}`);
      }
    });

    // Mock du profil utilisateur connecté (non connecté par défaut)
    await page.route('http://localhost:8000/auth/profile', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Non connecté.'
        }),
      });
    });

    // Mock de reprise de session active (renvoie vide par défaut)
    await page.route('http://localhost:8000/session/resume/active', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: null }),
      });
    });

    // Mock des sessions (renvoie vide pour éviter toute interférence historique)
    await page.route('http://localhost:8000/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: []
        }),
      });
    });

    // Mock de jointure en tant que connecté
    await page.route('http://localhost:8000/session/join', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { joinId: 10, sessionId: 600 }
        }),
      });
    });

    // Mock de jointure en tant qu'invité
    await page.route('http://localhost:8000/session/join-guest', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 9, displayName: 'Sarah', guestToken: 'guest-token', sessionId: 600 }
        }),
      });
    });

    // Mock des détails de la session 600
    await page.route('http://localhost:8000/session/600', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 600,
            name: 'Sprint de test',
            code: '6000',
            status: 'open',
            step: 'waiting',
            ownerId: 1,
            formatName: 'Commencer / Arrêter / Continuer',
            formatColumns: ['Commencer', 'Arrêter', 'Continuer'],
          },
        }),
      });
    });

    // Mock des participants de la session 600
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
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // Mock des cartes
    await page.route('http://localhost:8000/session/600/cards', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: []
        }),
      });
    });
  });

  test('1 & 9. Connexion d\'un compte existant et affichage des menus de compte', async ({ page }) => {
    await page.route('http://localhost:8000/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { token: 'jwt-token', userId: 1, username: 'JohnDoe', email: 'john@example.com' }
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Adresse e-mail').fill('john@example.com');
    await page.locator('#password').fill('Password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    // Redirection après connexion sur l'accueil
    await expect(page).toHaveURL('/');

    // Bouton de profil visible (affiche le username de l'utilisateur connecté)
    const profileBtn = page.getByRole('button', { name: 'JohnDoe' });
    await expect(profileBtn).toBeVisible();

    await profileBtn.click();
    await expect(page.getByRole('menuitem', { name: 'Mes sessions' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Déconnexion' })).toBeVisible();
  });

  test('2 & 7. Inscription d\'un nouveau compte et absence de redirection automatique', async ({ page }) => {
    await page.route('http://localhost:8000/auth/signup', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { token: 'jwt-token-new', userId: 2, username: 'JaneDoe', email: 'jane@example.com' }
        }),
      });
    });

    await page.goto('/signup');
    await page.getByLabel("Pseudonyme (Nom d'utilisateur)").fill('JaneDoe');
    await page.getByLabel('Adresse e-mail').fill('jane@example.com');
    await page.locator('#password').fill('Password123');
    await page.getByLabel('Confirmation du mot de passe').fill('Password123');
    await page.getByRole('button', { name: "S'inscrire" }).click();

    // Redirection saine sur l'accueil neutre
    await expect(page).toHaveURL('/');

    // Aucun comportement d'aspiration automatique vers la session 600
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/');
  });

  test('3. Déconnexion utilisateur', async ({ page }) => {
    // Injecter token de départ
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'jwt-token');
    });

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

    await page.goto('/');
    const profileBtn = page.getByRole('button', { name: 'JohnDoe' });
    await expect(profileBtn).toBeVisible();

    await profileBtn.click();
    await page.getByRole('menuitem', { name: 'Déconnexion' }).click();

    // Doit être déconnecté et voir le bouton de profil masqué (car non connecté)
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'JohnDoe' })).not.toBeVisible();
  });

  test('4. Rafraîchissement après connexion', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'jwt-token');
    });

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

    await page.goto('/');
    await expect(page.getByRole('button', { name: 'JohnDoe' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'JohnDoe' })).toBeVisible();
  });

  test('5. Participant invité avec code + pseudo et absence de profil en session', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Rejoindre', exact: true }).click();

    // Saisie du code et du pseudo (obligatoire pour l'invité)
    const codeInputs = page.locator('input[aria-label^="Chiffre"]');
    await codeInputs.nth(0).fill('6');
    await codeInputs.nth(1).fill('0');
    await codeInputs.nth(2).fill('0');
    await codeInputs.nth(3).fill('0');

    const pseudoInput = page.getByLabel('Prénom ou pseudo');
    await expect(pseudoInput).toBeVisible();
    await pseudoInput.fill('Sarah');

    await page.getByRole('button', { name: 'Rejoindre →' }).click();

    // Arrivée en session
    await expect(page).toHaveURL(/\/session\/600$/);

    // En tant qu'invité, aucun menu de compte ne doit être visible
    await expect(page.getByRole('button', { name: 'JohnDoe' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Profil' })).not.toBeVisible();
  });

  test('6. Utilisateur connecté sans champ pseudo', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'jwt-token');
    });

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

    await page.goto('/');
    await page.getByRole('button', { name: 'Rejoindre', exact: true }).click();

    // Le champ pseudo ne doit pas être affiché
    await expect(page.getByLabel('Prénom ou pseudo')).not.toBeVisible();

    const codeInputs = page.locator('input[aria-label^="Chiffre"]');
    await codeInputs.nth(0).fill('6');
    await codeInputs.nth(1).fill('0');
    await codeInputs.nth(2).fill('0');
    await codeInputs.nth(3).fill('0');

    await page.getByRole('button', { name: 'Rejoindre →' }).click();
    await expect(page).toHaveURL(/\/session\/600$/);
  });

  test('8. Absence de réutilisation d\'un participant invité après connexion d\'un autre compte', async ({ page }) => {
    await page.addInitScript(() => {
      // Injecter un invité
      window.localStorage.setItem('retro:guest:600', JSON.stringify({ participantId: 9, displayName: 'Sarah', guestToken: 'guest-token' }));
    });

    await page.route('http://localhost:8000/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { token: 'jwt-token', userId: 1, username: 'JohnDoe', email: 'john@example.com' }
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Adresse e-mail').fill('john@example.com');
    await page.locator('#password').fill('Password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL('/');

    // Vérifier que le localStorage d'invité a bien été purgé
    const guestStorage = await page.evaluate(() => window.localStorage.getItem('retro:guest:600'));
    expect(guestStorage).toBeNull();
  });

  test('10. Création et ouverture d\'une session facilitateur', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'jwt-token');
    });

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

    await page.route('http://localhost:8000/session/create-session', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { sessionId: 600, code: '6000', name: 'Sprint de test' },
        }),
      });
    });

    await page.goto('/');
    await page.getByLabel('Nom de la rétro').fill('Sprint de test');
    await page.getByRole('button', { name: 'Créer et lancer' }).click();

    // Redirection vers le tableau
    await expect(page).toHaveURL(/\/session\/600$/);

    // Le facilitateur doit voir son profil dans la barre de session (rechercher JohnDoe ou Profil)
    await expect(page.getByRole('button', { name: /JohnDoe|Profil/ })).toBeVisible();
  });
});
