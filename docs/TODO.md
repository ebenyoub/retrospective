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

## À faire maintenant (mis à jour 2026-07-08 fin de journée)

- [ ] Mettre à jour / ouvrir la PR `feature/delete-card` avec la suppression frontend + backend, puis attendre review.
- [ ] Merger la PR ouverte `feature/delete-card` après review (ne pas merger maintenant).

## À faire ensuite (mis à jour 2026-07-08)

- [ ] Dette documentée : la table `sessions` n'a pas de colonne `name`, alors que le cahier des charges (F04/US-04) exige un nom de session obligatoire à la création. Décision assumée de reporter.
- [ ] Tests manquants restants côté auth : `forgot.controller.ts`, `code.controller.ts`, `reset.controller.ts`, `delete.controller.ts` (identifiés en review du 2026-07-08, non traités — hors périmètre de ce ticket)
- [ ] **Dette d'architecture backend** : seuls `src/controllers/list.controller.ts` (`GET /session`) et `src/controllers/vote.controller.ts` (`POST .../vote`) suivent le pattern complet `controller → service → model`. Tous les autres controllers (`login`, `signup`, `forgot`, `code`, `reset`, `delete`, `profile`, `create`, `join`, `card`) font toujours du SQL inline. Généraliser le pattern est une refonte large, volontairement non faite.
- [ ] `validators/` (dossier prévu dans l'architecture cible) n'a jamais été créé — aucune librairie de validation (zod/joi/yup) côté backend.
- [ ] Modification d'une carte existante (US-07, B11) — jamais commencée, pas dans la checklist stricte du MVP.
- [ ] Responsive design (B16) — jamais vérifié explicitement sur mobile.
- [ ] `mail.controller.ts` et `test_transporter.js` (racine backend) — code mort, jamais branché à une route, à supprimer un jour.
- [ ] **`.env` backend manquant sur le disque** (effet de bord d'une purge d'historique Git antérieure) — à recréer depuis `.env.example` avec de vraies valeurs avant de pouvoir démarrer le serveur en local. Potentiellement bloquant pour une démo/soutenance.
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
