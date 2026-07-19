# TODO

> Tickets simples et tâches en attente. Les gros sujets sont dans `docs/backlog/PRODUCT_BACKLOG.md`.

## À faire maintenant

- [ ] **MVP-WRITING-01 — Finaliser le design des cartes et des actions Modifier/Supprimer sur l'écran Écriture** : première tâche MVP après `BACKLOG-REALIGN-01`. Rester strictement sur les cartes et leurs actions visuelles/fonctionnelles ; ne pas démarrer timer, discussion, commentaires, vote, résultats, plan d'action ou résumé.
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
- [x] **Reprise de session par Cookie HttpOnly** : Validation sécurisée du cookie retro_resume côté backend, nettoyage automatique sur session close/inexistante, bouton d'accueil dynamique, et étanchéité du menu participant invité.
- [x] **B-SIGNUP-01 — Validator mot de passe incohérent** : règle `<= 6` avec message "3 caractères" → corrigé en `< 6` + message "6 caractères minimum" (`Signup.tsx`).
- [x] **B-AUTH-01 — Logout incomplet** : `token`, `userId`, `username`, `email` pas remis à zéro dans le state React lors du logout → nettoyage complet dans `logout()` (`AuthContext.tsx`).
- [x] **UX-HOME-01 — Champs décoratifs sans indication** : le formulaire "Créer une rétro" de la home page utilise des champs non fonctionnels → ajout d'une note "Un compte est requis" sous le bouton (`HomeTabsCard.tsx`).

### Tickets créés (non bloquants — à faire après soutenance)
- [x] **TODO-HOME-01 — Compteur "7 participants" en dur** : badge supprimé de l'accueil (`HomeHero`), aucune donnée fictive affichée comme réelle. Résolu.
- [x] **TODO-HOME-02 — Formulaire "quick start" home page** : remplacé par le vrai flux `CreateAccountForm` (compte + rétro en un seul envoi, React Hook Form + Zod). Résolu.
- [x] **TODO-URL-01 — API base URL en dur (`http://localhost:8000`)** : résolu le 2026-07-13 — centralisé dans `src/lib/api.ts` (`API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000"`) + `.env.example`. Plus aucune URL en dur dans le code source.
- [x] **TODO-AUTH-02 — Pas de redirection post-login vers la page d'origine** : après connexion, redirection selon les sessions actives (une seule → dedans, plusieurs → Mes sessions, aucune → accueil) via `resolveLandingRoute`. Résolu le 2026-07-09.
- [x] **TODO-DOCS-01 — Régénérer secrets** : `JWT_SECRET` et `GMAIL_APP_PASSWORD` ne sont plus codés en dur dans `docker-compose.yml` ; procédure de génération/rotation documentée pour la soutenance et la production.
- [x] **TODO-SESSION-01 — Liste des participants absente** : `GET /session/:id/participants` + table `session_participants` + Socket.IO. Résolu le 2026-07-10 (voir `docs/decisions/DECISIONS.md`).

## Tickets issus de l'audit styles Tailwind/Figma du 2026-07-09

- [ ] **Toast en styled-components avec fond blanc** (`ToastStyled.tsx` + icônes Font Awesome via CDN dans `index.html`) : seul composant hors Tailwind, style clair qui détonne sur le thème sombre Figma. Décider : réécrire le toast en Tailwind avec les tokens du thème (et retirer `styled-components` + le CDN Font Awesome), ou l'assumer tel quel devant le jury.
- [ ] **Compteur de votes restants absent** : la maquette Figma affiche "5 votes restants" pendant la phase de vote ; l'application n'informe l'utilisateur qu'au moment du refus du 6e vote. Amélioration UX à chiffrer.
- [x] **Liste des participants avec avatars** : implémentée le 2026-07-10 (temps réel, avatars à initiales, statut, rôle).
- [ ] **Éléments maquette encore hors périmètre MVP** (à assumer à l'oral, pas à corriger) : chat "Discussion", timer d'étape, code à 6 caractères (le MVP utilise 4 chiffres).

## Tickets issus de la salle d'attente temps réel (2026-07-10)

- [x] **TODO-PARTICIPANT-01 — Participant invité limité à la salle d'attente** : résolu — `retro_cards.author_participant_id`/`votes.participant_id` référencent `session_participants` (plus `users.id`), un invité peut écrire des cartes et voter une fois la rétro lancée.
- [x] **TODO-FORMAT-01 — Format de rétrospective non reflété sur le tableau d'écriture** : résolu — le MVP propose exactement 6 formats français à 3 colonnes, le format choisi est persisté (`sessions.format_name`/`format_columns`), la salle d'attente ne propose plus d'ancien format personnalisé, et les écrans Écriture/Résultats affichent les libellés du format réel tout en conservant les clés techniques `start`/`stop`/`continue` pour les cartes.
- [ ] **TODO-CLEANUP-01 — Comptes techniques invités de l'ancienne implémentation** : avant l'introduction de `session_participants`, une version précédente créait un compte réel dans `users` pour chaque invité (pseudo suivi d'un email `@guest.local`). Ces lignes historiques (créées lors de sessions de test) peuvent être nettoyées en base de dev ; sans impact fonctionnel.

## Tickets issus de la correction du parcours participant (2026-07-13)

- [x] **BUG-PARTICIPANT-01 — Lien d'invitation direct inutilisable** : un participant ouvrant `/session/:id` sans passer par l'accueil (pas de compte, pas d'identité invitée stockée) était silencieusement renvoyé vers `/` au lieu de se voir proposer un pseudo pour cette session — il ne rejoignait donc jamais la salle d'attente ni l'écran d'écriture. Cause : `JoinSessionModal.tsx` existait (avec ses propres tests) mais n'était jamais rendu dans `SessionDashboard.tsx`. Corrigé : le composant est affiché à la place de la redirection, y compris quand un jeton invité stocké est devenu invalide.
- [x] **BUG-PARTICIPANT-02 — Code de session masqué après le démarrage** : le code à 4 chiffres n'était visible que dans la salle d'attente ; disparaissait dès le passage à l'étape écriture/vote/résultats. Ajout d'un badge « Code : XXXX » permanent dans la barre d'outils de ces trois étapes.

## Tickets issus de l'alignement Figma & Navigation (2026-07-13)

- [x] **BUG-NAV-01 — Navigation en boucle sur Mes sessions** : la redirection automatique vers la session active s'activait lors du clic sur le bouton *Retour*. Corrigé en passant `tab: 'join'` au state de navigation pour marquer une intention explicite et désactiver le rebond.
- [x] **BUG-PARTICIPANT-03 — Ajout de cartes impossible** : correction de la synchronisation de l'identité de l'invité après refresh et validation du flux d'ajout.
- [x] **TODO-FIGMA-03 — Chronomètre (TimerChip) absent** : intégration de la puce de chronomètre d'étape statique (`"05:00"` à l'écriture, `"04:30"` au vote) dans la sub-toolbar.
- [x] **TODO-FIGMA-04 — Bouton d'actions `…` absent** : intégration du menu d'actions de session `…` à l'écriture et au vote pour permettre la sortie de session des participants à tout moment.
- [x] **TODO-FIGMA-05 — Alignement complet de l'écran d'Écriture** : intégration du composant `EmptyState` avec emojis, layout vertical fluide, onglets mobiles mis en conformité.
- [x] **TODO-UX-02 — Compteur de votes restants en continu** : afficher le nombre de votes restants pendant la phase de vote au lieu de ne lever l'erreur qu'au 6e vote (Priorité P0 / MVP).
- [ ] **TODO-UI-02 — Refonte du système de Toast en Tailwind** : supprimer styled-components et le CDN Font Awesome pour unifier le design avec les tokens Figma (Priorité P2 / Évolution).

## Découpage navbar de session sous le header principal (2026-07-13)

- [x] **T-SESSION-BAR-01 — SessionContextBar** : terminé et validé utilisateur. Première barre sous le header principal : retour, breadcrumb, nom de session, `StepIndicator`, code, déclencheurs Participants/Discussion. Aucun compteur, timer ou bouton principal dans cette barre.
- [x] **T-SESSION-BAR-02 — SessionActionBar** : terminé et validé utilisateur. Seconde barre uniquement après validation de `SessionContextBar` : compteur total de cartes ou votes restants, timer, bouton principal, sans troisième barre.
- [x] **T-SESSION-BAR-03 — ParticipantsDrawer** : terminé. Panneau Participants déclenché depuis `SessionContextBar`, avec vraies données.
- [x] **T-SESSION-BAR-04 — DiscussionDrawer** : terminé. Panneau Discussion déclenché depuis `SessionContextBar`, périmètre données borné sans backend.
- [x] **T-SESSION-BAR-05 — Commentaires des cartes** : UI livrée le 2026-07-14 sans persistance ; persistance réelle ajoutée le 2026-07-16 via `MVP-COMMENTS-01` (table `card_comments`, routes dédiées).
- [x] **T-SESSION-BAR-06 — Revue UI finale écran Écriture** : terminé. Comparaison globale au prototype après validation des composants précédents.

## Tickets issus de l'audit de conformité skills (2026-07-13)

- [x] **AUDIT-01 — Validateur invité orphelin** : `leaveParticipantSchema` (Zod) existait mais n'était branché sur aucune route — `DELETE /:sessionId/participants/:participantId` n'avait aucune validation d'entrée. Corrigé : `validate(leaveParticipantSchema)` ajouté sur la route.
- [x] **AUDIT-02 — Code mort dans `RetroCardItem`** : fallback `authorName` (+ `useAuth`) inatteignable car le backend renvoie toujours `authorName` (jointure SQL obligatoire). Supprimé, fixtures de test corrigées en conséquence.
- [x] **AUDIT-03 — Nom de fonction hérité de l'ancien modèle** : `countVotesByUserInSession` prenait déjà un `participantId` depuis la migration vers `session_participants`. Renommé en `countVotesByParticipantInSession`.
- [x] **AUDIT-04 — `SELECT *` dans `participant.model.ts`** : remplacé par une liste de colonnes explicite (`PARTICIPANT_COLUMNS`), cohérent avec `card.model.ts`/`vote.model.ts` du même chantier.
- [ ] **AUDIT-05 — `guest_token` sans expiration propre** : un jeton invité reste valide indéfiniment tant que la ligne `session_participants` existe, même après `sessions.expires_at`/`status='closed'`. Non corrigé cette session (changement de comportement produit à valider : que doit-il se passer pour un invité sur une session expirée/fermée ?). Voir `docs/technical/ARCHITECTURE.md`.
- [ ] **AUDIT-06 — Avatar dupliqué entre salle d'attente et cartes** : `WaitingScreen.tsx` (hash sur le nom) et `RetroCardItem.tsx` (hash sur l'id) réimplémentent chacun un avatar à initiales avec des algorithmes de couleur différents. Mutualisation possible dans `components/ui/`, non faite cette session pour éviter un changement visuel non validé (les couleurs assignées à chaque participant changeraient).
- [x] **AUDIT-07 — Documentation technique incomplète** : `docs/technical/ARCHITECTURE.md` a été mis à jour (participants, Socket.IO, routes, arborescence par page, contrôleurs consolidés), et `docs/technical/API.md` et `docs/technical/DATABASE.md` ont été mis à jour pour documenter la table `session_participants` et les routes `/participants/*`..

## Tickets issus de la revue d'architecture (2026-07-13)

- [x] **ARCHI-01 — Frontend organisé par page** : `src/pages/private/` renommé `src/pages/session/` (nom cohérent avec la route). Composants/hooks spécifiques dans le dossier de la page, partagés dans `src/components/`.
- [x] **ARCHI-02 — Contrôleurs backend 1 fichier/ressource** : auth (7 fichiers) → `auth.controller.ts` + `passwordReset.controller.ts` ; session (4 fichiers) → `session.controller.ts`. 6 contrôleurs 1:1 avec services et modèles.
- [x] **ARCHI-03 — URL API centralisée** : `src/lib/api.ts` + `.env.example` (voir TODO-URL-01).
- [x] **ARCHI-04 — Suppression du `any` backend** : `AuthUser` + helper `requireAuthUser`, doublon d'interface `AuthRequest` supprimé.
- [x] **ARCHI-05 — `SELECT *` restants** : `session.model.ts`, `auth.model.ts`, `passwordReset.model.ts` passés en colonnes explicites.
- [x] **ARCHI-06 — Code mort supprimé** : `App.tsx`, `assets/Logo.tsx`, `context/theme/useTheme.ts`, `HomeFeatureSection.tsx`, dossier `styleComonent/`.
- [ ] **ARCHI-07 — Formulaires `Login/Signup/SessionCreate` en `useFormValidation` (manuel)** : le skill `react` préconise React Hook Form (déjà utilisé par les formulaires d'accueil). Migration non faite cette revue (changement de comportement de formulaire, hors périmètre « structure »). À planifier.
- [ ] **ARCHI-08 — Toast en styled-components** : `ToastStyled.tsx` (déplacé dans `components/ui/`) reste hors Tailwind (fond blanc, `styled-components` + CDN Font Awesome). Réécriture Tailwind = changement visuel, à décider (voir aussi le ticket styles Tailwind/Figma plus haut).
- [ ] **ARCHI-09 — `signup` renvoie 200 + message "Connexion réussie."** : le skill `express-nodejs` préconise 201 pour un POST créant une ressource, et le message devrait refléter l'inscription. Non corrigé (changement de comportement/copy). À décider.

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
- [x] Secrets (`JWT_SECRET`, `GMAIL_APP_PASSWORD`) à régénérer — procédure documentée ; les vraies valeurs doivent rester hors Git et être configurées dans l'environnement cible.

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
