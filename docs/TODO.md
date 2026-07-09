# TODO

> Tickets simples et tâches en attente. Les gros sujets sont dans `docs/backlog/PRODUCT_BACKLOG.md`.

## À faire maintenant

- [ ] Analyser le code existant frontend et backend
- [ ] Remplir `docs/technical/ARCHITECTURE.md` avec l'état réel du code
- [ ] Remplir `docs/technical/DATABASE.md` avec le schéma existant
- [ ] Définir le périmètre MVP dans `docs/project/PERIMETRE_MVP.md`

## À faire ensuite

- [ ] Créer les User Stories dans `docs/project/USER_STORIES.md`
- [ ] Remplir le backlog produit `docs/backlog/PRODUCT_BACKLOG.md`
- [ ] Configurer les variables d'environnement (`.env.example`)
- [ ] Vérifier que le projet démarre correctement frontend + backend

## Améliorations documentaires

- [ ] Compléter `docs/jury/REFERENTIEL_DWWM.md` avec les compétences couvertes
- [ ] Commencer à collecter les preuves dans `docs/jury/PREUVES_A_COLLECTER.md`

## À faire maintenant (mis à jour 2026-07-09 — phase de stabilisation)

- [x] Préparer la démo locale : `docker compose up --build` vérifié le 2026-07-09 (backend + MySQL démarrent, schéma initialisé automatiquement).
- [x] Parcours utilisateur complet vérifié en conditions réelles (Playwright, 2 utilisateurs) le 2026-07-09 : inscription, connexion, création/join de session, workflow d'étapes, CRUD cartes, limite de 5 votes, résultats triés, déconnexion, responsive 390px.

## Tickets issus de l'audit MVP final — soutenance (2026-07-09)

### Bugs corrigés dans cette session
- [x] **B-SIGNUP-01 — Validator mot de passe incohérent** : règle `<= 6` avec message "3 caractères" → corrigé en `< 6` + message "6 caractères minimum" (`Signup.tsx`).
- [x] **B-AUTH-01 — Logout incomplet** : `token`, `userId`, `username`, `email` pas remis à zéro dans le state React lors du logout → nettoyage complet dans `logout()` (`AuthContext.tsx`).
- [x] **UX-HOME-01 — Champs décoratifs sans indication** : le formulaire "Créer une rétro" de la home page utilise des champs non fonctionnels → ajout d'une note "Un compte est requis" sous le bouton (`HomeTabsCard.tsx`).

### Tickets créés (non bloquants — à faire après soutenance)
- [ ] **TODO-HOME-01 — Compteur "7 participants" en dur** : remplacer `CONNECTED_PARTICIPANTS = 7` par une vraie donnée temps réel ou supprimer l'indicateur. Risque : question du jury sur cette valeur fixe.
- [ ] **TODO-HOME-02 — Formulaire "quick start" home page** : les champs Nom/Prénom/MDP sont visuellement présents mais non connectés au backend. Décision à prendre : les supprimer ou les relier au vrai flux de création de session.
- [ ] **TODO-URL-01 — API base URL en dur (`http://localhost:8000`)** : toutes les pages font des `fetch` hardcodés. À externaliser dans une variable `VITE_API_URL` pour permettre un déploiement propre (hors périmètre DWWM mais bonne pratique à mentionner à l'oral).
- [ ] **TODO-AUTH-02 — Pas de redirection post-login vers la page d'origine** : après `RequireAuth` redirect vers `/login`, l'utilisateur est envoyé sur `/profile` et non sur la page demandée. Amélioration UX post-soutenance.
- [ ] **TODO-DOCS-01 — Régénérer secrets** : `JWT_SECRET` et `GMAIL_APP_PASSWORD` du `docker-compose.yml` sont des valeurs placeholder. À documenter dans les slides jury et à régénérer en prod.

## Tickets issus de l'audit styles Tailwind/Figma du 2026-07-09

- [ ] **Toast en styled-components avec fond blanc** (`ToastStyled.tsx` + icônes Font Awesome via CDN dans `index.html`) : seul composant hors Tailwind, style clair qui détonne sur le thème sombre Figma. Décider : réécrire le toast en Tailwind avec les tokens du thème (et retirer `styled-components` + le CDN Font Awesome), ou l'assumer tel quel devant le jury.
- [ ] **Compteur de votes restants absent** : la maquette Figma affiche "5 votes restants" pendant la phase de vote ; l'application n'informe l'utilisateur qu'au moment du refus du 6e vote. Amélioration UX à chiffrer.
- [ ] **Éléments maquette hors périmètre MVP** (à assumer à l'oral, pas à corriger) : chat "Discussion", liste des participants avec avatars, timer d'étape, commentaires sur cartes, lien d'invitation `retroflow.app/join/...`, code à 6 caractères (le MVP utilise 4 chiffres).

## Tickets issus des tests manuels du 2026-07-09

- [ ] **Formulaire "Créer une rétro" de la page d'accueil partiellement décoratif** : les champs "Votre prénom" et "Mot de passe" de la maquette Figma correspondent à un démarrage rapide anonyme non implémenté. Aujourd'hui le bouton redirige vers le vrai parcours (inscription ou `/session`). Décider : implémenter le démarrage anonyme, ou simplifier le formulaire pour ne garder que le nom.
- [ ] **Compteur "7 participants connectés" en dur** sur la page d'accueil (`home.tsx`, commentaire existant) — à brancher sur une vraie donnée ou à retirer avant la soutenance pour éviter une question piège du jury.
- [ ] **Rafraîchissement du tableau par polling (4 s)** : les changements d'étape/cartes des autres participants apparaissent avec un léger délai. Acceptable pour le MVP, à savoir expliquer à l'oral (alternative : WebSocket, hors périmètre DWWM).

## À faire ensuite (mis à jour 2026-07-08)

- [x] Dette documentée : la table `sessions` n'a pas de colonne `name`, alors que le cahier des charges (F04/US-04) exige un nom de session obligatoire à la création (Résolu le 2026-07-08).
- [x] **Dette d'architecture backend — audit 2026-07-08** : refactor backend homogène livré via PR #15 ; controllers sans `db`/SQL/`bcrypt`/`jwt`/provider direct, services pour logique métier, models pour SQL.
- [x] Tests manquants côté auth/reset : `forgot.controller.ts`, `code.controller.ts`, `reset.controller.ts`, `delete.controller.ts` couverts via PR #15.
- [x] **Lot 1 cartes** : `createCard`, `getCards`, `deleteCard` déplacés vers `card.service.ts` (PR #15).
- [x] **Lot 2 sessions** : `create.controller.ts` et `join.controller.ts` refactorés vers services/models (PR #15).
- [x] **Lot 3 auth de base** : `login.controller.ts`, `signup.controller.ts`, `delete.controller.ts` refactorés vers services/models ; `profile` passe par service (PR #15).
- [x] **Lot 4 reset password** : `forgot.controller.ts`, `code.controller.ts`, `reset.controller.ts` refactorés vers services/models (PR #15).
- [x] **B17 Messages d'erreur cohérents** : helper frontend `apiError`, fallbacks réseau cohérents, erreurs API affichées sur les écrans clés.
- [x] `validators/` (dossier prévu dans l'architecture cible) mis en place avec Zod pour valider les requêtes API (Résolu le 2026-07-08).
- [x] Modification d'une carte existante (US-07, B11) — `PATCH /session/:sessionId/cards/:cardId`, bouton auteur uniquement, édition inline, refetch après succès, toast sur erreur.
- [x] Responsive design basique (B16) — formulaires fluides, header/menu qui wrap, dashboard en 1/2/3 colonnes selon largeur, captures mobile/tablette vérifiées.
- [x] `mail.controller.ts` et `test_transporter.js` (racine backend) — code mort supprimé (Résolu le 2026-07-08).
- [ ] **Mode backend hors Docker** — recréer `retrospective_backend/.env` depuis `.env.example` avec de vraies valeurs avant de démarrer le serveur manuellement. En mode Docker Compose, les variables locales sont fournies par `docker-compose.yml`.
- [ ] Secrets (`JWT_SECRET`, `GMAIL_APP_PASSWORD`) à régénérer — exposés en clair dans un historique Git local avant purge.

## Fait ✅ (2026-07-08, suite de journée — votes, résultats, rôles, delete-card, Express 5, UI)

- [x] Migration Express 4.22.2 → 5.2.1 (`refactor/express5`), zéro changement de code, vérifié par tests + démarrage serveur réel avec vraies requêtes HTTP
- [x] Système de votes backend (`POST /session/:sessionId/cards/:cardId/vote`, `refactor/voting-backend`) — pattern `controller → service → model`, 1 vote/carte/utilisateur, limite 5 votes/session
- [x] Bouton "Voter" + compteur frontend (`feature/vote-ui`) sur `RetroCardItem.tsx`
- [x] Composant `FormField` (`refactor/frontend-ui-components`) — déduplique 12 blocs JSX sur Login/Signup/Forgot/Profile, corrige un bug d'input non contrôlé sur `Login.tsx`
- [x] Vue "Résultats" triée par votes (`feature/results-view`, US-09) — réutilise `RetroColumn` avec formulaire d'ajout rendu optionnel
- [x] Badge de rôle facilitateur/participant sur le tableau (`feature/session-role-badge`) — composant `Badge` créé, réutilisé sur `RetroColumn` et `SessionList`
- [x] Suppression de carte, **backend uniquement** (`feature/delete-card`) — `DELETE /session/:sessionId/cards/:cardId`, 403 si pas l'auteur, votes supprimés avant la carte (pas de cascade en base). PR ouverte, pas mergée.
- [x] Suppression de carte côté frontend (`feature/delete-card`) — bouton "Supprimer" visible uniquement pour l'auteur (`card.authorId === userId`), appel `DELETE /session/:sessionId/cards/:cardId`, refetch après succès, toast sur erreur. Frontend 26/26, build et lint OK.

## Fait ✅ (nettoyage dette technique, 2026-07-08)

- [x] `console.log` résiduel supprimé dans `create.controller.ts`
- [x] `retrospective_backend/logs/all.log` et `logs/error.log` retirés du suivi Git (`git rm --cached`) — fichiers conservés en local, déjà couverts par la règle `.gitignore` racine (`logs`), aucune modification de `.gitignore` nécessaire

## Dette technique backend TypeScript

- [x] Rendre `retrospective_backend` compatible avec `npx tsc --noEmit` sans erreur (Résolu le 2026-07-09 : validateurs migrés vers la syntaxe Zod v4 `error`, tests des messages ajoutés).

## Phase tests unitaires minimum — terminée (2026-07-07)

Plus de test unitaire "de fond" à ajouter en dehors de ceux qui accompagnent chaque nouvelle fonctionnalité produit.

## Fait ✅ (suite)

- [x] Table SQL `retro_cards` (`retrospective_backend/sql/create_retro_cards.sql`) (2026-07-07)
- [x] Endpoint `POST /session/:sessionId/cards` + tests (`npm run test` : 15/15 passés) (2026-07-07)
- [x] Endpoint `GET /session/:sessionId/cards` + tests (`npm run test` : 19/19 passés) (2026-07-07)
- [x] Premier écran `SessionDashboard.tsx` : 3 colonnes + lecture des cartes (`npm run test` frontend : 11/11 passés, `npm run build` : succès) (2026-07-07)
- [x] Formulaire d'ajout de carte (`RetroAddCardForm.tsx`, React Hook Form + Zod) dans chaque colonne — `npm run test` frontend : 14/14 passés, `npm run build` : succès (2026-07-07)
- [x] `feature/auth-session` : correction `any` dans `create.controller.ts`, tests `create`/`join.controller.ts`, endpoint `GET /session` (US-05) + `SessionList.tsx` — backend 29/29, frontend 17/17, build et lint OK (2026-07-08)
- [x] Refactor pilote `session/list.controller.ts` en `controller → service → model` + middleware d'erreur centralisé (`asyncHandler`/`errorHandler`) — backend 38/38, frontend 17/17, build et lint OK (2026-07-08)
- [x] `AppError` ajoutée (statusCode/message/code/details), `errorHandler` distingue AppError vs erreur inconnue, stack masquée en production — backend 42/42 (2026-07-08)
- [x] Réorganisation complète du backend sous `src/` (`refactor/backend-architecture`, 7 commits : types, utils, routes, middlewares, controllers, services, models) — déplacement structurel uniquement, aucune logique modifiée, backend 42/42 à chaque étape (2026-07-08)

## Fait ✅

- [x] Création de la fondation documentaire et IA (2026-06-26)
- [x] Correction des deux imports à casse invalide qui cassaient `npm run build` (2026-07-07)
- [x] Page d'accueil `src/pages/home/` reconstruite depuis `figma_make.zip` (2026-07-07)
- [x] Frontmatter YAML ajouté aux 8 agents `.claude/agents/` (2026-07-07)
- [x] Règles "périmètre autorisé par tâche" et "review = diff uniquement" ajoutées dans `CLAUDE.md` (2026-07-07)
- [x] Vitest installé côté frontend + premier test (`useFormValidation.test.ts`) — `npm run test` : 4/4 passés (2026-07-07)
- [x] Test Vitest sur `HomeTabsCard.tsx` — `npm run test` : 8/8 passés (2026-07-07)
- [x] Vitest installé côté backend + premier test sur `auth.middleware.ts` — `npm run test` : 3/3 passés (2026-07-07)
- [x] Test backend sur `login.controller.ts` (`db.execute`/`bcrypt.compare` mockés) — `npm run test` : 7/7 passés (2026-07-07)
- [x] Test backend sur `signup.controller.ts` (`db.execute`/`bcrypt.hash` mockés) (2026-07-07)
- [x] Test backend sur `profile.controller.ts` (fonction pure, sans mock) — `npm run test` : 11/11 passés (2026-07-07)
