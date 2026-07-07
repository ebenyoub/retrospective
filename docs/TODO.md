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

## À faire ensuite (mis à jour 2026-07-08)

- [ ] Système de votes — pas commencé, prochaine tâche
- [ ] Dette documentée : la table `sessions` n'a pas de colonne `name`, alors que le cahier des charges (F04/US-04) exige un nom de session obligatoire à la création. Décision prise le 2026-07-08 : hors périmètre de `feature/auth-session`, à traiter dans un ticket dédié si besoin.
- [ ] Tests manquants restants côté auth : `forgot.controller.ts`, `code.controller.ts`, `reset.controller.ts`, `delete.controller.ts` (identifiés en review du 2026-07-08, non traités — hors périmètre de ce ticket)

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
