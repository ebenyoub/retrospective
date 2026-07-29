# Sprint Backlog

> Tickets du sprint en cours. Un seul sprint actif à la fois.
> Ne pas démarrer un nouveau ticket avant d'avoir terminé et testé le précédent.

## Sprint actuel : Sprint 0 — Analyse et mise en place

**Objectif** : Analyser l'existant, configurer l'environnement, définir le schéma BDD.

**Période** : À définir

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| S0-01 | Analyser le code frontend existant | ⬜ | Lister ce qui est déjà développé |
| S0-02 | Analyser le code backend existant | ⬜ | Lister les routes et contrôleurs existants |
| S0-03 | Documenter l'architecture actuelle | ⬜ | Remplir `docs/technical/ARCHITECTURE.md` |
| S0-04 | Documenter le schéma BDD actuel | ⬜ | Remplir `docs/technical/DATABASE.md` |
| S0-05 | Vérifier que le projet démarre | ⬜ | Frontend + backend en dev |

---

## Sprint 1 — Boucle de travail + page d'accueil (frontend)

**Objectif** : fiabiliser la boucle Backlog → tâche → code → test/build → review diff → docs → commit, et livrer la page Home depuis la maquette Figma.

**Période** : 2026-07-07

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| S1-01 | Corriger les imports à casse invalide (build cassé) | ✅ | `main.tsx`, `ToastNotification.tsx` |
| S1-02 | Créer `src/pages/home/` depuis `figma_make.zip` | ✅ | `home.tsx` + 3 composants dans `components/` |
| S1-03 | Frontmatter YAML sur les 8 agents `.claude/agents/` | ✅ | Rend les agents réellement sélectionnables |
| S1-04 | Règles "périmètre par tâche" + "review = diff seul" | ✅ | Ajoutées dans `CLAUDE.md` |
| S1-05 | Installer Vitest + script `test` (frontend) | ✅ | `npm run test` → 4/4 passés |
| S1-06 | Premier test sur `useFormValidation.ts` | ✅ | `src/hooks/useFormValidation.test.ts` |

| S1-07 | Test Vitest sur `HomeTabsCard.tsx` | ✅ | Nécessité d'un alias `@` et d'un setup `cleanup()` dans `vitest.config.ts` |
| S1-08 | Premier test backend sur `auth.middleware.ts` | ✅ | Vitest (pas Supertest — test unitaire direct de la fonction middleware, plus simple) |
| S1-09 | Test backend sur `login.controller.ts` | ✅ | `db.execute` et `bcrypt.compare` mockés avec `vi.mock` |
| S1-10 | Test backend sur `signup.controller.ts` | ✅ | `db.execute` et `bcrypt.hash` mockés ; doublon pseudo/email testé via le vrai statut du contrôleur (500, pas 409 — pas de vérif explicite dans le code) |
| S1-11 | Test backend sur `profile.controller.ts` | ✅ | Fonction pure, aucun mock nécessaire |

**Preuve de validation (2026-07-07)** :
- Frontend : `npm run test` (8 passés, inchangé) et `npm run build` (succès)
- Backend : `npm run test` (11 passés : 3 `auth.middleware` + 4 `login.controller` + 3 `signup.controller` + 1 `profile.controller`). Pas de script `build` dans `retrospective_backend/package.json`.

**Phase "tests unitaires minimum" : terminée.** Les fonctions critiques (middleware d'auth, connexion, inscription, profil, formulaires clés du frontend) ont un filet de test. On arrête ici la boucle de tests unitaires — pas d'ajout supplémentaire tant qu'une nouvelle fonctionnalité produit ne l'exige.

---

## Sprint 2 — Tableau de rétrospective : ajout de carte (backend)

**Objectif** : première brique du cœur métier — permettre d'ajouter une carte dans une session.

**Période** : 2026-07-07

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| S2-01 | Table SQL `retro_cards` | ✅ | `retrospective_backend/sql/create_retro_cards.sql` — pas de système de migration existant, script simple à exécuter manuellement |
| S2-02 | Endpoint `POST /session/:sessionId/cards` | ✅ | `session/card.controller.ts`, protégé par `auth`, colonnes `start/stop/continue` |
| S2-03 | Tests du endpoint | ✅ | sans token (délègue à `auth.middleware`), contenu vide → 400, session inexistante → 404, création → 201 |
| S2-04 | Endpoint `GET /session/:sessionId/cards` | ✅ | Tri `created_at ASC`, mapping snake_case → camelCase (`sessionId`, `authorId`, `columnType`, `createdAt`) |
| S2-05 | Tests du endpoint GET | ✅ | sans token, session inexistante → 404, session sans carte → 200 + `[]`, session avec cartes → 200 + cartes mappées |

**Preuve de validation** : `npm run test` (backend) → 19 passés (15 précédents + 4 nouveaux). Pas de script `build` backend.

---

## Sprint 3 — Tableau de rétrospective : premier écran (frontend)

**Objectif** : afficher les 3 colonnes (start/stop/continue) et charger les cartes existantes sur `SessionDashboard.tsx`.

**Période** : 2026-07-07

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| S3-01 | `RetroCardItem.tsx` + `RetroColumn.tsx` (`pages/private/components/`) | ✅ | Design repris de `WritingScreen.tsx` (figma_make.zip) : grille 3 colonnes, pastille couleur, compteur, bordure gauche colorée, état vide |
| S3-02 | `SessionDashboard.tsx` : fetch `GET /session/:sessionId/cards` + répartition par colonne | ✅ | Fetch inline (pas de couche `services/`, cohérent avec le reste du projet qui n'en a pas) |
| S3-03 | Tests du composant | ✅ | 3 colonnes affichées, état vide (3x), cartes reçues dans la bonne colonne |

**Preuve de validation (2026-07-07)** :
- Frontend : `npm run test` → 11 passés (8 précédents + 3 nouveaux) ; `npm run build` → succès
- Backend : `npm run test` → 19 passés, inchangé (aucune modification backend dans ce sprint)

---

## Sprint 4 — Tableau de rétrospective : ajout de carte (frontend)

**Objectif** : permettre d'écrire une carte depuis chaque colonne (start/stop/continue) de `SessionDashboard.tsx`.

**Période** : 2026-07-07

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| S4-01 | `RetroAddCardForm.tsx` (`pages/private/components/`) | ✅ | Premier formulaire du projet avec React Hook Form + Zod (nouvelle convention pour tous les formulaires) ; `zod` et `@hookform/resolvers` ajoutés aux dépendances |
| S4-02 | `RetroColumn.tsx` : intégration du formulaire par colonne | ✅ | Placement repris de `AddCardInput` dans `WritingScreen.tsx` (figma_make.zip) |
| S4-03 | `SessionDashboard.tsx` : `handleAddCard` (POST + refetch) | ✅ | `fetchCards` extrait en fonction réutilisable (`useCallback`) ; pas de reconstruction locale de carte, on refetch après le POST (le backend ne renvoie que `cardId`) |
| S4-04 | Tests du formulaire | ✅ | formulaire visible dans les 3 colonnes, contenu vide refusé par Zod (aucun appel réseau supplémentaire), ajout réussi affiché dans la bonne colonne |

**Preuve de validation (2026-07-07)** :
- Frontend : `npm run test` → 14 passés (11 précédents + 3 nouveaux) ; `npm run build` → succès
- Backend : non concerné (aucune modification), dernière exécution connue 19/19 passés

**Prochaine tâche proposée** : système de votes (backend puis frontend), dernière brique du cœur métier MVP avant les rôles facilitateur/participant.

---

## Sprint 5 — `feature/auth-session` : combler les trous auth/session

**Objectif** : couvrir US-05 ("lister ses sessions"), combler les trous de tests sur les contrôleurs de session déjà en prod, corriger un `any` résiduel.

**Période** : 2026-07-08

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| S5-01 | Correction `(req as any).user` → `AuthRequest` dans `create.controller.ts` | ✅ | Alignement avec le pattern déjà utilisé dans `join.controller.ts` |
| S5-02 | Tests `create.controller.ts` / `join.controller.ts` | ✅ | Aucun test n'existait sur ces fichiers pourtant en prod |
| S5-03 | Endpoint `GET /session` (US-05) | ✅ | `session/list.controller.ts` — UNION SQL owner/participant, rôle `facilitator`/`participant`, tri `created_at DESC` |
| S5-04 | Page `SessionList.tsx` + lien depuis `Profile.tsx` | ✅ | Réutilise `Container`/`Button` existants |
| S5-05 | Tests associés (backend + frontend) | ✅ | |

**Décision d'architecture (validée avec l'utilisateur)** : la table `sessions` n'a pas de colonne `name` alors que le cahier des charges (F04/US-04) l'exige. Non traité dans ce ticket — dette documentée, voir section "Dette technique" plus bas.

**Preuve de validation (2026-07-08)** :
- Backend : `npm run test` → 29 passés (19 précédents + 10 nouveaux)
- Frontend : `npm run test` → 17 passés (14 précédents + 3 nouveaux) ; `npm run build` → succès ; `npm run lint` → aucune erreur

**Prochaine tâche proposée** : système de votes (backend puis frontend) — inchangé, cœur métier MVP restant.

---

## Sprint 6 — Cœur métier MVP : votes, résultats, rôles, delete-card, Express 5

**Objectif** : livrer les dernières briques du cœur métier (votes, vue résultats, rôle affiché), migrer Express 5, déduplicater l'UI frontend, démarrer la suppression de carte.

**Période** : 2026-07-08

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| S6-01 | Amélioration middleware d'erreur (`AppError`, `errorHandler`) | ✅ | PR #3, `refactor/session-service-model` |
| S6-02 | Réorganisation backend sous `src/` (7 étapes) | ✅ | PR #4, `refactor/backend-architecture` |
| S6-03 | Migration Express 4 → 5 | ✅ | PR #5, `refactor/express5`, zéro changement fonctionnel |
| S6-04 | Système de votes — backend | ✅ | PR #6, `feature/voting-backend`, pattern controller→service→model, limite 5 votes/session |
| S6-05 | Système de votes — frontend | ✅ | PR #7, `feature/vote-ui`, bouton + compteur sur `RetroCardItem.tsx` |
| S6-06 | Composant `FormField` (dédup formulaires) | ✅ | PR #8, `refactor/frontend-ui-components` |
| S6-07 | Vue résultats triée par votes (US-09) | ✅ | PR #9, `feature/results-view` |
| S6-08 | Badge de rôle facilitateur/participant | ✅ | PR #10, `feature/session-role-badge`, composant `Badge` créé |
| S6-09 | Suppression de carte — backend | ✅ | `feature/delete-card`, `DELETE /session/:sessionId/cards/:cardId`, PR **non mergée** |
| S6-10 | Suppression de carte — frontend | ✅ | Bouton auteur uniquement, `DELETE`, refetch, toast erreur |

**Preuve de validation (2026-07-08)** :
- Backend : 58/58 tests passés (dernière exécution, ticket delete-card), `npx tsc --noEmit` propre à chaque étape
- Frontend : 26/26 tests passés (après suppression frontend), `npm run build` et `npm run lint` propres

**Prochaine tâche proposée** : B16, responsive design basique du tableau, après revue/merge de `feature/delete-card`.

---

## Sprint 7 — Polish MVP responsive

**Objectif** : rendre les vues MVP lisibles sur mobile/tablette sans refonte visuelle.

**Période** : 2026-07-08

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| S7-01 | Formulaires auth/profil fluides sur mobile | ✅ | `FormContainer` passe en `w-full max-w-md min-w-0`, `SpinContainer` borné |
| S7-02 | Header et menu profil adaptatifs | ✅ | wrap des boutons, espacements réduits sur mobile |
| S7-03 | Dashboard responsive | ✅ | en-tête empilé sur mobile, bouton plein largeur, grille 1/2/3 colonnes |
| S7-04 | Liste de sessions responsive | ✅ | cartes empilées sur mobile, badge conservé sans débordement |

**Preuve de validation (2026-07-08)** :
- Frontend : `npm run lint`, `npm run test` (26/26), `npm run build`
- Vérification locale : serveur Vite + captures Playwright CLI sur Home mobile 390px, Login mobile 390px, Home tablette 768px

---

## Sprint 8 — Modification de carte

**Objectif** : permettre à l'auteur de modifier le contenu de sa propre carte.

**Période** : 2026-07-08

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| S8-01 | Endpoint backend `PATCH /session/:sessionId/cards/:cardId` | ✅ | 400 contenu vide, 404 carte introuvable, 403 si pas auteur |
| S8-02 | Mode édition frontend auteur uniquement | ✅ | bouton "Modifier", textarea inline, annulation sans appel réseau |
| S8-03 | Tests backend/frontend | ✅ | backend 62/62, frontend 31/31 |

**Preuve de validation (2026-07-08)** :
- Backend : `npm run test`, `npx tsc --noEmit`
- Frontend : `npm run test`, `npm run build`, `npm run lint`

---

## Sprint 9 — Polish messages d'erreur

**Objectif** : rendre les messages d'erreur frontend cohérents et exploiter les messages API quand ils existent.

**Période** : 2026-07-08

| ID | Tâche | Statut | Notes |
|---|---|---|
| S9-01 | Helper `apiError` frontend | ✅ | Extraction du message API, fallback par défaut, fallback réseau |
| S9-02 | Login/Signup/Forgot/Profile | ✅ | Messages réseau harmonisés, `Signup` appelle réellement `validateAll()` |
| S9-03 | SessionList/SessionDashboard | ✅ | Erreurs API visibles pour chargement sessions et actions cartes |
| S9-04 | Tests et validation | ✅ | Frontend 37/37, lint OK, build OK |

---

## Template sprint suivant

```markdown
## Sprint X — [Nom du sprint]

**Objectif** : [Ce qu'on veut avoir à la fin du sprint]

**Période** : Du [date] au [date]

| ID | Tâche | Statut | Notes |
|---|---|---|---|
| SX-01 | ... | ⬜ | ... |
```

---

## Définition de "terminé"

Un ticket est terminé quand :
- [ ] La fonctionnalité fonctionne comme décrit dans la User Story
- [ ] Le cas d'erreur principal est géré
- [ ] Le code est relu (au moins une relecture rapide)
- [ ] `docs/PROJECT_STATE.md` est mis à jour
- [ ] `docs/CHANGELOG.md` a une entrée
