# État du Projet

> Mettre à jour ce fichier avant toute modification importante.

## Date de dernière mise à jour

2026-07-19 (`MVP-COMMENTS-01 — Commentaires en ligne` finalisé : remplacement de la modale globale `CardCommentsModal` par un affichage et une gestion des commentaires directement en ligne sous le contenu de chaque carte (`CardCommentsSection`), façon Facebook/Discord. Utilisation d'un `SessionContext` React propre au niveau du dashboard pour propager les en-têtes et les identifiants de session sans prop-drilling. Nettoyage et suppression des fichiers de modale obsolètes. Adaptation complète des tests unitaires et E2E (Playwright) au nouveau comportement. 232 tests backend et 168 tests frontend au vert.)

2026-07-16 (`MVP-COMMENTS-01 — Commentaires de carte` implémenté pour de vrai : jusqu'ici la modal `CardCommentsModal` était un pur habillage désactivé sans aucune table ni route backend, malgré un statut "Terminé" obsolète dans le backlog. Nouvelle table `card_comments` (id, card_id, author_participant_id, content, created_at), modèle/service/contrôleur/routes dédiés (`GET/POST /session/:id/cards/:cardId/comments`, `DELETE .../comments/:commentId`), un participant peut consulter, ajouter et supprimer uniquement ses propres commentaires. Le nombre de commentaires est renvoyé avec chaque carte (`commentsCount`, sous-requête SQL sur le modèle des votes) et affiché sur `RetroCardItem`. Vérifié en conditions réelles (compte + session + carte + ajout + suppression) sur la stack Docker locale, pas seulement en tests mockés — un bug de redémarrage `ts-node-dev` a d'ailleurs été détecté à cette occasion et corrigé par un simple restart du conteneur. 252 tests backend, 168 tests frontend au vert.)

2026-07-16 (Nettoyage de branche : le travail de fonctionnalités (TIMER-01, reprise de session, fermeture de session) laissé non commité par une session Antigravity interrompue a été séparé de la réorganisation mécanique des tests/types qui s'y était mélangée sur `feature/TIMER-01`. Le code applicatif est commité seul sur `feature/TIMER-01` (232 tests backend, 166 tests frontend au vert), et la réorganisation — déplacement des tests dans des sous-dossiers `tests/`, extraction des types dans `types/*.types.ts`, remplacement de `FormContainer` par les primitives `Form`/`Card`/`Modal` — est finalisée et commitée séparément sur `chore/frontend-tests-types-structure` (211 tests frontend au vert). Au passage : suppression de logs de debug oubliés, correction d'un import de test à la casse invalide, finalisation d'une extraction de types Toast restée à moitié faite, et ajout de `test-results/` au `.gitignore`.)

2026-07-16 (Suppression complète de la limite de 25 participants par session et implémentation de la fermeture/terminaison de session. Le facilitateur dispose désormais d'un bouton "Terminer la session" dans sa barre d'actions à chaque étape. Les participants (invités et connectés) sont automatiquement redirigés vers l'accueil si la session est fermée (notifiée en direct via Socket.IO ou détectée par polling). Tous les tests unitaires et d'intégration backend (218 passés) et frontend (152 passés) sont au vert.)

2026-07-15 (Reprise de session via cookie HttpOnly et nettoyage automatique validé côté backend. Plus de confiance aveugle au sessionId du localStorage, l'API globale /session/resume/active vérifie la validité du cookie retro_resume (existence, état de session ouvert, correspondance du participant), nettoie le cookie si obsolète ou expiré, et met à jour le menu participant invité sans impacter les comptes connectés. 213 tests backend et 153 tests frontend au vert.)

2026-07-15 (`TIMER-01 — Timer universel synchronisé` implémenté, en attente de validation fonctionnelle : le backend devient la source de vérité du temps (colonnes step_duration_minutes et step_ends_at, échéance calculée par le serveur à chaque changement d'étape), durée saisie à la création (formulaires Home), modifiable en salle d'attente et en cours d'étape par le facilitateur (compteur cliquable, champ inline), diffusion immédiate par socket (session:timer-updated + échéance dans session:started), TimerChip recalcule le restant depuis l'échéance commune. 202 tests backend, 145 tests frontend, 23 E2E au vert.)

2026-07-15 (`AUTH-COOKIE-01 — Migration de l'authentification vers un cookie HttpOnly` terminé en 2 phases : le JWT est posé par le backend en cookie HttpOnly (plus de localStorage ni de header Authorization côté frontend), nouvelle route POST /auth/logout, tous les appels passent en credentials include, sockets authentifiés via le cookie du handshake, et correction du bug de déconnexion au rechargement (le contrôleur profile ne renvoyait pas l'enveloppe success/data attendue par le frontend). 194 tests backend, 140 tests frontend et 23 E2E Playwright au vert.)

2026-07-14 (`US-ARCHI-01 — Séparer complètement les parcours "Utilisateur connecté" et "Participant invité"` terminé : correction finale des redirections d'authentification, masquage de la navbar sur les pages de session, rendu universel de SessionContextBar sur toutes les étapes y compris WaitingStep pour l'accès au menu utilisateur, purge des résidus d'invités lors de la connexion, suppression du champ pseudo pour les connectés, 139 tests unitaires Vitest au vert, et réussite 23/23 de la suite E2E Playwright.)

2026-07-14 (Séparation stricte des parcours Utilisateur connecté vs Participant invité : suppression de la redirection automatique de resolveLandingRoute, masquage du Header global en session et intégration du ProfileMenu dans SessionContextBar pour éviter les doublons, et masquage dynamique du champ pseudo de JoinSessionForm pour les utilisateurs connectés rejoignant via /session/join.)

2026-07-14 (`MVP-WRITING-STATE-02 — Validation E2E des états de chargement et vides` terminé : création de session-writing-states.spec.ts pour valider l'affichage du texte de chargement initial et des EmptyStates associés aux 3 colonnes vides.)

2026-07-14 (`MVP-COMMENTS-02 — Validation E2E de la modal Commentaires` terminé : création de session-comments.spec.ts pour vérifier le focus trap à l'ouverture, l'état vide, les contrôles désactivés, la fermeture via Escape et la restauration du focus.)

2026-07-14 (`MVP-DISCUSSION-02 — Validation E2E du drawer Discussion` terminé : complétion de session-drawers.spec.ts pour vérifier le titre d'état vide, la désactivation des contrôles et la rouverture sans régression.)

2026-07-14 (`MVP-PARTICIPANTS-02 — Validation E2E du drawer Participants` terminé : complétion de session-drawers.spec.ts pour valider le badge Hôte, les rôles Facilitateur/Participant, et les statuts En ligne/Hors ligne.)

2026-07-14 (`MVP-E2E-02 — Validation E2E du parcours produit complet` terminé : création de session-full-journey.spec.ts couvrant l'inscription, la création de session, l'écriture, le vote et l'affichage final des résultats.)

2026-07-14 (`MVP-TRANSITION-02 — Validation E2E de l'enchaînement des étapes` terminé : création de session-transition.spec.ts couvrant le parcours complet waiting -> writing -> voting -> results sous le contrôle du facilitateur.)

2026-07-14 (`MVP-RESULTS-02 — Validation E2E de l'écran Résultats` terminé : création de session-results.spec.ts couvrant l'accès à l'étape, l'affichage des médailles du Top 3, le tri et le respect des libellés dynamiques du format.)

2026-07-14 (`MVP-VOTE-02 — Validation E2E de la salle de vote` terminé : création de session-voting.spec.ts couvrant le quota, les boutons de vote et la mise à jour dynamique de la page. Résolution d'un bug latent sur le mock de /auth/profile qui n'était pas correctement enveloppé pour requestApi, restaurant la totalité des tests Playwright au vert.)

2026-07-14 (`AUTH-02 — Audit et correction accessibilité` terminé : mise en accessibilité complète des formulaires du module Auth et Forgot. Centralisation de aria-invalid dans FormField.tsx, et ajout de role="alert" pour l'erreur globale et aria-busy pour l'attente réseau.)

2026-07-14 (`MVP-TIMER-01 — Rendre le timer d'étape fonctionnel` terminé : le composant TimerChip a été rendu dynamique en local via un intervalle dégressif réinitialisé à chaque transition d'étape.)

2026-07-14 (`AUTH-01 — Création de la couche authApi` terminé : extraction de l'intégralité des 5 requêtes fetch brutes du module Auth et du profil vers un service dédié authApi.ts s'appuyant sur requestApi générique. Suppression de la duplication des interfaces de types LoginValues et SignupValues.)

2026-07-14 (`ARCH-SESSION-09 — Accessibilité de CardCommentsModal` terminé : modal de commentaires mis en conformité a11y selon les standards W3C/WAI-ARIA et l'implémentation du Drawer. Ajout du focus trap, gestion de la touche Échap, restauration automatique du focus au démontage et correction de la sémantique de l'overlay de clic extérieur. Clôture définitive du chantier session par une décision d'architecture dans DECISIONS.md.)

2026-07-14 (`T-QUALITY-01 — Découpage des tests frontend` terminé : le fichier monolithique `SessionDashboard.test.tsx` de 1900+ lignes a été découpé par responsabilité en 6 fichiers de tests d'intégration ciblés. Les mocks et helpers de rendu communs ont été mutualisés dans le répertoire `src/pages/session/tests/sessionTestUtils.tsx`. La couverture de tests et le comportement d'intégration sont préservés avec 139 tests verts.)

2026-07-14 (`BACKLOG-STRUCTURE-01 — Hiérarchie du Product Backlog` : les tickets MVP sont rattachés à leurs User Stories parentes, la roadmap devient `Ordre d'implémentation MVP`, les anciens `T-SESSION-BAR-*` passent en historique technique, et les tickets actifs portent une priorité `P0/P1/P2`)

2026-07-14 (`BACKLOG-REALIGN-01 — Réalignement MVP produit` : Product Backlog réaligné avec l'état réel du produit ; les User Stories larges `US-07`, `US-08`, `US-09` et `US-10` repassent en partiellement terminées tant que les sous-fonctionnalités produit ne sont pas livrées et validées ; prochain ticket MVP identifié : `MVP-WRITING-01`)

2026-07-14 (`TODO-FORMAT-01 — Formats MVP 3 colonnes` terminé : les 6 formats validés en français sont la seule source de vérité, la création de session persiste le format choisi, la salle d'attente permet uniquement ces 6 formats, les écrans Écriture et Résultats affichent les libellés du format réel tout en conservant les clés techniques `start`/`stop`/`continue` pour les cartes, et les anciennes sessions sans format exploitable restent compatibles avec le format par défaut)

2026-07-14 (`TODO-DOCS-01 — Régénérer secrets` terminé : `docker-compose.yml` ne porte plus de valeur Gmail/JWT de production en dur, `.env.example` et docs sécurité/déploiement/jury documentent la génération hors dépôt avec `openssl rand -base64 48` et le stockage en variables d'environnement)

2026-07-13 (`T-SESSION-BAR-06 — Revue UI finale de l'écran Écriture` terminé : écran complet comparé au prototype sur desktop/mobile avec Playwright ; aucune correction fonctionnelle supplémentaire nécessaire après validation des composants précédents ; test ciblé, lint et TypeScript OK)

2026-07-13 (`T-SESSION-BAR-05 — Commentaires des cartes` terminé dans le périmètre UI : ouverture d'un modal depuis les cartes, état vide sans donnée fictive, aucun compteur de commentaires affiché faute de source réelle, saisie désactivée tant qu'aucune persistance n'est validée ; test ciblé, lint, TypeScript et vérifications Playwright desktop/mobile OK)

2026-07-13 (`T-SESSION-BAR-04 — DiscussionDrawer` terminé : panneau Discussion déclenché depuis `SessionContextBar`, état vide sans données fictives, zone de saisie désactivée tant qu'aucune persistance réelle n'est validée, fermeture bouton/Échap/clic extérieur, exclusivité avec ParticipantsDrawer ; test ciblé, lint, TypeScript et vérifications Playwright desktop/mobile OK)

2026-07-13 (`T-SESSION-BAR-03 — ParticipantsDrawer` terminé : panneau Participants déclenché depuis `SessionContextBar`, affichage des vraies données de session, distinction facilitateur/participant, fermeture par bouton, Échap et clic extérieur ; test ciblé, lint, TypeScript et vérifications Playwright desktop/mobile OK)

2026-07-13 (`T-SESSION-BAR-02 — SessionActionBar` terminé et validé utilisateur : seconde barre sous le header principal stabilisée avec compteur total en écriture, votes restants en vote, timer et bouton principal facilitateur ; test ciblé 35/35, lint et build frontend OK ; vérification Playwright locale avec API mockée, captures `test-results/screenshots/session-actionbar-writing.png` et `test-results/screenshots/session-actionbar-mobile.png`)

2026-07-13 (`T-SESSION-BAR-01 — SessionContextBar` terminé et validé utilisateur : barre de contexte isolée sous le header principal, déclencheurs Participants/Discussion rendus comme boutons accessibles, retrait du rôle de cette barre, tests ciblés 33/33, lint et build frontend OK ; validation visuelle confirmée)

2026-07-13 (recadrage backlog — arrêt des modifications directes de la navbar de session ; découpage du chantier sous le header principal en 6 tickets indépendants : `SessionContextBar`, `SessionActionBar`, `ParticipantsDrawer`, `DiscussionDrawer`, commentaires des cartes, revue UI finale. La navbar n'est pas validée comme terminée.)

2026-07-13 (passe de fidélité visuelle — affichage dynamique du quota de votes restants en continu sous forme de texte et de 5 pastilles dynamiques colorées/grisées d'après le prototype Figma, avec jointure SQL au chargement des cartes pour savoir si le participant connecté a déjà voté pour chaque carte)

2026-07-13 (passe de fidélité visuelle — page d'ÉCRITURE alignée sur le prototype Figma `WritingScreen` : layout sans hauteur fixe, EmptyState par colonne avec emojis, onglets mobiles, compteur de cartes global, intégration du `TimerChip` statique et du menu d'actions `…` ; correction du bouton de retour de `SessionList` pour casser la boucle de redirection automatique sur l'accueil)

2026-07-13 (passe de fidélité visuelle — page de RÉSULTATS refaite d'après le prototype Figma `ResultsScreen` : bande de statistiques, Top 3 avec médailles + barres de votes, 3 colonnes par catégorie avec cartes compactes)

2026-07-13 (revue d'architecture : alignement complet sur les skills DWWM — frontend par page, contrôleurs backend 1 fichier/ressource, URL API centralisée, suppression du `any`)

## État global

🟡 MVP produit en cours. Les fondations techniques sont solides (authentification, sessions, participants, cartes, votes, formats MVP à 3 colonnes, résultats partiels), mais le produit n'est pas encore terminé au sens utilisateur. Les écrans Écriture, Vote et Résultats contiennent encore des sous-fonctionnalités à livrer ou à valider : timer fonctionnel, commentaires réels, discussion réelle, UX Participants, design final des cartes, validation complète du vote, transitions d'étape, plan d'action, écran résumé et parcours Playwright complet. L'orchestrateur doit suivre le Product Backlog réaligné et ne plus considérer le MVP comme terminé tant que ces sous-tâches ne sont pas validées.

## Fonctionnalités livrées

| Fonctionnalité | Statut | Date |
|---|---|---|
| Fondation documentaire | ✅ Livré | 2026-06-26 |
| Authentification (inscription, connexion, JWT, mot de passe oublié) | ✅ Livré | 2026-07-07 |
| Gestion des sessions (créer/rejoindre par code) | ✅ Livré | 2026-07-07 |
| Lister ses sessions (`GET /session`, US-05) | ✅ Backend + page `SessionList.tsx` | 2026-07-08 |
| Page d'accueil (Home) | ✅ Livré (reconstruite depuis `figma_make.zip`) | 2026-07-07 |
| Tableau de rétrospective — 3 colonnes, ajout/modification de carte | 🟡 Partiel : création et édition présentes, design/actions/commentaires à finaliser | 2026-07-14 |
| Système de votes (backend + bouton frontend) | 🟡 Partiel : logique présente, salle de vote et validations E2E à finaliser | 2026-07-14 |
| Vue des résultats triée par votes (US-09) | 🟡 Partiel : tri/top/statistiques présents, revue finale et états limites à valider | 2026-07-14 |
| Fidélité visuelle page résultats (Top 3, stats, 3 colonnes catégories, cartes compactes) | 🟡 Développé, validation produit finale restante | 2026-07-14 |
| Rôle affiché sur le tableau (Facilitateur/Participant) | ✅ Livré | 2026-07-08 |
| Suppression de sa propre carte | ✅ Backend + frontend, PR #11 mergée dans `dev` | 2026-07-08 |
| Modification de sa propre carte | ✅ Backend + frontend, PR #13 mergée dans `dev` | 2026-07-08 |
| Responsive design basique | ✅ Livré, PR #12 mergée dans `dev` | 2026-07-08 |
| Réorganisation backend sous `src/` (routes/controllers/services/models/middlewares/utils/types) | ✅ Livré (déplacement structurel) | 2026-07-08 |
| Homogénéisation backend `controller → service → model → DB` | ✅ Livré, PR #15 mergée dans `dev` | 2026-07-08 |
| Messages d'erreur cohérents (B17) | ✅ Livré sur branche `polish/error-message-consistency` | 2026-07-08 |
| Migration Express 4 → 5 | ✅ Livré, sans changement fonctionnel | 2026-07-08 |
| Composants UI réutilisables (`FormField`, `Badge`) | ✅ Livré | 2026-07-08 |
| Nom de session obligatoire (F04/US-04) | ✅ BDD + backend (validation) + frontend (création, liste, dashboard) | 2026-07-08 |
| Validation des données backend (Zod) | ✅ Middlware et validateurs appliqués aux routes d'authentification, de sessions et de cartes | 2026-07-08 |
| Nettoyage de code mort backend | ✅ Fichiers `mail.controller.ts` et `test_transporter.js` supprimés | 2026-07-08 |
| Messages d'erreur cohérents (B17) | ✅ PR #16 mergée dans `dev` | 2026-07-08 |
| Fix bugs signup/UX (labels, bouton œil, erreur réseau) | ✅ PR #20 mergée dans `dev` | 2026-07-08 |
| Documentation de référence Figma Make (UI/UX) | ✅ PR #21 mergée dans `dev` | 2026-07-08 |
| Workflow d'étapes de session (waiting/writing/voting/results) + UI | ✅ Livré via PR #21 (`a189f3e`) | 2026-07-08 |
| Alignement UI sur les styles Figma Make | ✅ PR #22 mergée dans `dev` | 2026-07-08 |
| Réparation du middleware de validation backend | ✅ PR #23 mergée dans `dev` | 2026-07-08 |
| Docker Compose backend + MySQL (init auto `schema.sql`) | ✅ PR #24 mergée dans `dev` | 2026-07-08 |
| Dette TypeScript backend (`npx tsc --noEmit` sans erreur) | ✅ Validateurs migrés vers la syntaxe Zod v4 (`error`) + tests messages | 2026-07-09 |
| Parcours utilisateur complet vérifié en conditions réelles (Docker + Playwright, 2 utilisateurs) | ✅ Inscription → session → cartes → votes (limite) → résultats → déconnexion | 2026-07-09 |
| Protection des routes privées (`RequireAuth`) | ✅ `/sessions`, `/session` redirigent vers `/login` si non connecté. `/session/:id` ne l'est **plus** (voir salle d'attente ci-dessous) ; `/profile` a été supprimée | 2026-07-09, révisé 2026-07-10 |
| Salle d'attente : affichage du vrai code à 4 chiffres (au lieu de l'id) | ✅ Corrigé dans `SessionDashboard.tsx` | 2026-07-09 |
| Boutons de la page d'accueil branchés (création/rejoindre) | ✅ Redirigent vers les vrais parcours selon l'état de connexion | 2026-07-09 |
| Audit styles Tailwind/Figma | ✅ Tailwind v4 confirmé partout (tokens `@theme`), CSS mort supprimé, spin-card re-thémé aux couleurs Figma et limité au chargement, lien "Mot de passe oublié ?" aligné | 2026-07-09 |
| Parcours de création de compte + première rétro combiné sur l'accueil | ✅ `CreateAccountForm`/`CreateSessionForm`/`JoinSessionForm` (React Hook Form + Zod), connexion par email, redirection post-connexion selon sessions actives | 2026-07-09 |
| **Salle d'attente temps réel** | ✅ Table `session_participants` (source de vérité unique, facilitateur + invités), Socket.IO (`session:join`/`session:participants-updated`/`session:started`), plus de redirection `/login` pour un invité, modale de pseudo (RHF + Zod), pseudo conservé tel quel (unicité par session, erreur claire si pris), pas de doublon au refresh (jeton invité en `localStorage`, isolé de l'auth) | 2026-07-10 |
| Capacité de session illimitée (suppression de la limite de 25) | ✅ Plus aucune limite de participants côté backend et frontend | 2026-07-16 |
| Fermeture ou terminaison de session par le facilitateur | ✅ Bouton "Terminer la session", propagation Socket.IO/polling et redirection auto | 2026-07-16 |
| Format de rétrospective sélectionnable | ✅ 6 formats MVP français, exactement 3 colonnes, persistance `sessions.format_name`/`format_columns`, affichage cohérent en salle d'attente, écriture et résultats | 2026-07-14 |
| Cartes de participants accessibles/lisibles | ✅ Graisse modérée, badge « Facilitateur » (pas « Admin »), statut texte + couleur, focus visible, résumé unique dans la barre latérale (suppression des répétitions) | 2026-07-10 |
| Copie du code de session | ✅ Bouton dédié avec retour visuel, `aria-label`, API Clipboard | 2026-07-10 |
| Menu Profil déroulant accessible | ✅ Remplace la page `/profile` : clic, clic extérieur, Échap, navigation clavier, ARIA, focus rendu au bouton | 2026-07-10 |
| Participant invité peut écrire des cartes et voter | ✅ `retro_cards.author_participant_id`/`votes.participant_id` référencent `session_participants` (plus `users`) | 2026-07-13 |
| Parcours participant corrigé (jointure via lien d'invitation direct) | ✅ `JoinSessionModal` câblé dans `SessionDashboard.tsx` (existait mais n'était rendu nulle part), code de session affiché en permanence | 2026-07-13 |
| Revue d'architecture — conformité skills DWWM | ✅ Frontend organisé par page (`pages/session/`), contrôleurs backend consolidés 1:1 par ressource, URL API centralisée (`lib/api.ts`), `any` supprimé (`AuthUser` + `requireAuthUser`), code mort supprimé. Comportement constant : 185 tests back + 109 front verts, parcours réel vérifié | 2026-07-13 |

## Récapitulatif de la journée du 2026-07-08

### PR mergées dans `dev` (dans l'ordre)
1. **#3** `refactor/session-service-model` — amélioration du middleware d'erreur centralisé (`AppError`, `errorHandler` distingue erreurs prévues/imprévues, stack masquée en prod)
2. **#4** `refactor/backend-architecture` — réorganisation complète du backend sous `src/` en 7 étapes (types, utils, routes, middlewares, controllers, services, models) + nettoyage + doc
3. **#5** `refactor/express5` — migration Express 4.22 → 5.2.1 (+ `@types/express` 5.0.6), zéro changement fonctionnel, vérifié par tests unitaires **et** un vrai démarrage serveur + requêtes HTTP
4. **#6** `feature/voting-backend` — `POST /session/:sessionId/cards/:cardId/vote`, pattern controller→service→model, règles métier (1 vote/carte/utilisateur, limite de 5 votes/session)
5. **#7** `feature/vote-ui` — bouton "Voter" + compteur sur chaque carte, toast d'erreur
6. **#8** `refactor/frontend-ui-components` — composant `FormField` (déduplique 12 blocs label+input+erreur sur 4 pages), suppression de 2 fonctions dupliquées
7. **#9** `feature/results-view` — vue "Résultats" triée par votes décroissant (US-09), réutilise `RetroColumn` (formulaire d'ajout rendu optionnel)
8. **#10** `feature/session-role-badge` — badge de rôle sur le tableau, réutilise `GET /session` existant, introduit le composant `Badge`
9. **#11** `feature/delete-card` — suppression complète de sa propre carte (backend + frontend)
10. **#12** `feature/responsive-mvp` — responsive basique du MVP
11. **#13** `feature/edit-card` — modification de sa propre carte
12. **#14** `refactor/backend-layer-audit` — règles backend non négociables + audit
13. **#15** `refactor/backend-layer-homogenization` — homogénéisation backend en quatre lots

### Dernière PR mergée
- **#15 `refactor/backend-layer-homogenization`** — controllers backend homogènes, services métier, models SQL. Backend : 25 fichiers, 126 tests verts, TypeScript propre.

### Décisions d'architecture prises aujourd'hui
- Le pattern `controller → service → model → DB` + `AppError`/`errorHandler` centralisé est désormais **obligatoire et non négociable** pour tout nouveau code backend.
- Les contrôleurs ne doivent plus importer `db`, appeler `db.execute`, contenir du SQL brut, porter des validations métier/droits, utiliser `bcrypt`/`jwt`, générer des tokens, accéder au filesystem, appeler directement un provider externe, ou faire du `try/catch` manuel si `AppError` + `errorHandler` conviennent.
- Audit du 2026-07-08 : violations historiques corrigées par PR #15 ; les controllers applicatifs respectent maintenant le pattern cible.
- Le backend est passé en **Express 5** (`^5.2.1`) — `asyncHandler` conservé volontairement (pas encore exploité pour son bénéfice natif Express 5, mais reste utile/cohérent).
- Suppression de carte : les votes n'ont pas de suppression en cascade en base → suppression explicite des votes avant la carte dans le contrôleur (pas de transaction SQL formelle, cohérent avec la simplicité du projet).
- Rôle affiché en réutilisant l'endpoint `GET /session` existant plutôt que de créer un nouvel endpoint dédié à une session — évite la sur-ingénierie.

### Nouveaux composants UI créés et règles de réutilisation
- **`components/ui/FormField.tsx`** — label + Input + message d'erreur, état de bordure gris/vert/rouge optionnel (`showValidState`). Remplace la duplication dans `Login.tsx`, `Signup.tsx`, `Forgot.tsx`, `Profile.tsx`.
- **`components/ui/Badge.tsx`** — pastille générique (`text-xs font-mono ... bg-white/5 rounded`). Utilisée pour : le compteur de `RetroColumn`, le statut de `SessionList`, le rôle de `SessionDashboard`.
- **Règle adoptée** (voir aussi `docs/CONVENTIONS.md` à compléter si besoin) : avant toute nouvelle fonctionnalité UI, analyser `components/ui/` existant, ne créer un nouveau composant générique que si une **vraie duplication** (2-3 occurrences quasi identiques) est identifiée ; sinon le composant reste spécifique à sa page/feature (`pages/.../components/`).

## État du backend

- **Framework** : Express **5.2.1**, `@types/express` 5.0.6.
- **Architecture** : `retrospective_backend/src/{routes,controllers,services,models,middlewares,validators,utils,types,realtime}`. Depuis la revue du 2026-07-13, les **6 contrôleurs sont 1:1 avec les 6 services et les 6 modèles** : `auth`, `passwordReset`, `session`, `participant`, `card`, `vote` (fini les contrôleurs éclatés par action). Voir `docs/technical/ARCHITECTURE.md`.
- **Typage** : plus aucun `any` dans le code source. Le type partagé `AuthRequest` (dans `src/types`) porte `user?: AuthUser` ; le helper `src/utils/authUser.ts#requireAuthUser` garantit et type l'utilisateur authentifié.
- **SQL** : plus aucun `SELECT *` dans les modèles (colonnes explicites partout).
- **Gestion d'erreurs** : `AppError` + `errorHandler` centralisé + `asyncHandler`.
- **Temps réel** : Socket.IO attaché au même serveur HTTP qu'Express (`server.ts` utilise `http.createServer` + `initSocket`). CORS partagé entre Express et Socket.IO via `src/utils/corsOrigin.ts`.
- **Tests** : backend 185/185 passés (2026-07-13), `npx tsc --noEmit` sans erreur ; frontend 109/109 passés, lint clean, build Vite OK.

## État du frontend

- **Organisation par page** : `src/pages/{home,auth,session}/`, chaque page avec ses `components/` (et `hooks/` pour `session/`) spécifiques ; composants partagés dans `src/components/` (+ `components/ui/`). L'ancien `pages/private/` est renommé `pages/session/` (cohérent avec la route `/session/:id`).
- **URL d'API** : centralisée dans `src/lib/api.ts` (`API_BASE`, surchargée par `VITE_API_URL`) — plus aucune URL en dur.

## Ce qui est en cours

- `BACKLOG-REALIGN-01` a réaligné le backlog avec l'état produit réel : les blocs `US-07`, `US-08`, `US-09` et `US-10` ne sont plus considérés terminés tant que leurs sous-fonctionnalités MVP ne sont pas livrées et validées.
- La zone sous le header principal a une base UI validée, mais plusieurs comportements produit restent partiels : Participants, Discussion et Commentaires ne doivent plus être considérés terminés au sens MVP complet.
- Le ticket prioritaire suivant est `MVP-WRITING-01 — Finaliser le design des cartes et des actions Modifier/Supprimer sur l'écran Écriture`.

## Prochaine étape

**MVP-WRITING-01 — Finaliser le design des cartes et des actions Modifier/Supprimer sur l'écran Écriture.**

Cette tâche est la première sous-tâche MVP après réalignement. Elle doit rester limitée à l'écran Écriture et ne pas lancer Timer, Discussion, Commentaires, Vote, Résultats, Plan d'action ou Résumé.

## Dette technique restante

### Non bloquant, peut attendre
- Responsive avancé — le responsive basique MVP est livré ; il peut rester du polish visuel fin hors périmètre.
- Compteur "7 participants connectés" en dur sur l'accueil (`HomeHero`) — supprimé lors d'une tâche précédente puis code source à revérifier si réintroduit ; à confirmer qu'aucune valeur fictive ne subsiste avant la soutenance.

### Potentiellement bloquant pour la soutenance (à ne pas oublier)
- En mode Docker Compose, les variables backend locales sont fournies par
  `docker-compose.yml` et la base est initialisée automatiquement. Pour un
  lancement backend manuel hors Docker, recréer `retrospective_backend/.env`
  depuis `.env.example` reste nécessaire.
- Secrets (`JWT_SECRET`, `GMAIL_APP_PASSWORD`) — procédure de rotation documentée ; les valeurs réelles doivent rester hors Git et être configurées dans l'environnement cible.
- Protection de branche GitHub (`main`/`dev`) — commandes fournies précédemment, pas encore confirmées actives (à revérifier : `gh api repos/.../branches/main/protection`).
- **Migrations SQL à appliquer manuellement sur toute base existante** : `retrospective_backend/sql/create_session_participants.sql` et `alter_sessions_add_format.sql` sont déjà fusionnées dans `schema.sql` pour une base neuve, mais une base Docker existante doit les exécuter une fois manuellement (déjà fait sur la base de dev locale le 2026-07-10).

## Blocages / Risques

Aucun blocage empêchant de reprendre le travail demain. Les points "potentiellement bloquant" ci-dessus concernent la démonstration/soutenance, pas le développement.

## Notes

Ce fichier est la référence centrale de l'avancement du projet. Il doit rester à jour pour que le jury puisse voir la progression du travail.
