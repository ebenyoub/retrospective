# Backlog produit — Alignement Figma Make

> Analyse comparative entre la maquette `figma_make/` (export Figma Make, mock statique en mémoire) et le code réel (`retrospective_frontend/`, `retrospective_backend/`).
> Objectif : arrêter les corrections visuelles ponctuelles et travailler écran par écran, avec des critères d'acceptation clairs.
> Aucune fonctionnalité n'a été inventée : tout ce qui suit provient de la lecture directe de `figma_make/src/app/screens/`, `figma_make/src/app/App.tsx`, `figma_make/src/app/types.ts`, des pages réelles et des routes backend (`session.routes.ts`, `auth.routes.ts`).

## Sources analysées

- Maquette : `figma_make/src/app/screens/*.tsx` (HomeScreen, WaitingScreen, WritingScreen, VoteScreen, ResultsScreen, ActionScreen, SummaryScreen), `figma_make/src/app/App.tsx` (state machine des écrans), `figma_make/src/app/types.ts`, `figma_make/src/app/components/` (Shell, DiscussionPanel, CommentsModal), `figma_make/src/styles/theme.css`.
- Code réel : `retrospective_frontend/src/main.tsx` (routing réel), `pages/home/home.tsx`, `pages/auth/{Login,Signup,Forgot}.tsx`, `pages/private/{Profile,SessionCreate,SessionList,SessionDashboard}.tsx`, `pages/private/components/{RetroColumn,RetroCardItem,RetroAddCardForm,WaitingScreen}.tsx`, `components/Header.tsx`, `App.css`.
- Backend : `retrospective_backend/src/routes/{auth,session}.routes.ts` (source de vérité des fonctionnalités réellement disponibles).
- Suivi projet existant : `docs/TODO.md` et `docs/PROJECT_STATE.md` (l'audit du 2026-07-09 y documente déjà une partie des écarts ci-dessous — ce document les structure et les complète en vue Figma → code).

**Point important** : `figma_make/` est un prototype Figma Make autonome (état React local, données mockées dans `mockData.ts`, pas d'appel réseau). Il ne représente pas un design system figé mais une démonstration de parcours et de style visuel. Rien à importer manque côté accès Figma — l'export est complet et lisible directement en code.

---

## Écrans attendus côté Figma (7 écrans + shell)

| # | Écran Figma | Fichier source | Rôle dans le parcours |
|---|---|---|---|
| 1 | Accueil (Home) | `screens/HomeScreen.tsx` | Créer une rétro ou rejoindre par code, avant toute session |
| 2 | Salle d'attente (Waiting) | `screens/WaitingScreen.tsx` | Les participants arrivent, le facilitateur démarre |
| 3 | Écriture (Writing) | `screens/WritingScreen.tsx` | Ajout de cartes dans 3 colonnes (positif/négatif/idée) |
| 4 | Vote (Vote) | `screens/VoteScreen.tsx` | Chaque participant distribue un nombre limité de votes |
| 5 | Résultats (Results) | `screens/ResultsScreen.tsx` | Cartes triées par votes décroissants |
| 6 | Plan d'action (Action) | `screens/ActionScreen.tsx` | Création d'actions (owner, priorité, échéance) |
| 7 | Résumé (Summary) | `screens/SummaryScreen.tsx` | Bilan de fin de session (durée, participants, actions) |
| — | Shell (NavBar + panneaux) | `components/Shell.tsx` | Barre de navigation persistante + panneau participants + discussion |

Écrans **absents de la maquette Figma Make** mais nécessaires au produit réel (authentification) : Connexion, Inscription, Mot de passe oublié, Profil, Liste des sessions. Ces écrans sont un ajout du code réel car le prototype Figma Make ne gère pas de compte utilisateur (il simule un participant unique "Moi").

---

## Parcours utilisateurs attendus

### Visiteur (non connecté)
1. Arrive sur `/` (Accueil).
2. Voit le pitch produit + un choix "Créer une rétro" / "Rejoindre".
3. Doit créer un compte ou se connecter pour aller plus loin (le code réel exige un compte — la maquette Figma, elle, ne demande qu'un pseudo local, sans notion de compte persistant).

### Utilisateur connecté (pas encore dans une session)
1. Se connecte via `/login` ou crée un compte via `/signup`.
2. Arrive sur `/profile` : bienvenue + 3 actions (rejoindre par code, créer une rétro, voir mes sessions).
3. Peut consulter `/sessions` (liste de ses sessions passées/en cours avec rôle affiché).

### Participant (dans une session, rôle non-facilitateur)
1. Rejoint via code à 4 chiffres → `/session/:id`.
2. Salle d'attente : voit les participants connectés, attend le démarrage par le facilitateur.
3. Écriture : ajoute des cartes dans les 3 colonnes.
4. Vote : distribue ses votes (limité), ne peut pas changer d'étape.
5. Résultats : consulte les cartes triées, ne peut pas passer à l'étape suivante.
6. Ne voit pas de bouton de transition d'étape (réservé au facilitateur).

### Facilitateur (créateur de la session)
1. Crée la session (`/session`) → reçoit un code à partager.
2. Salle d'attente : bouton "Démarrer" pour lancer l'écriture.
3. Contrôle les transitions d'étape (écriture → vote → résultats) via des boutons dédiés.
4. Dans la maquette Figma : peut aussi lancer l'étape "Plan d'action" et "Résumé" — **non implémenté côté backend/frontend réel** (le workflow réel s'arrête à `results`).

---

## Composants UI attendus (Figma Make)

| Composant Figma | Équivalent réel | État |
|---|---|---|
| `NavBar` (logo, retour, discussion, participants) | `components/Header.tsx` | Partiel : pas de bouton retour ni discussion/participants |
| `ParticipantsSidebar` | — | Absent (voir `TODO-SESSION-01` dans `docs/TODO.md`) |
| `DiscussionPanel` (chat de session) | — | Absent, hors périmètre MVP assumé |
| `CommentsModal` (commentaires sur une carte) | — | Absent, hors périmètre MVP assumé |
| Carte de colonne (`Card` avec vote, commentaires) | `RetroCardItem.tsx` | Partiel : vote oui, commentaires non |
| Formulaire d'ajout de carte | `RetroAddCardForm.tsx` | Conforme |
| Colonne de rétro (3 catégories) | `RetroColumn.tsx` | Conforme (couleurs et libellés alignés) |
| Écran de vote avec compteur "votes restants" | `VoteScreen.tsx` | Absent côté réel (le compteur n'apparaît qu'au refus du 6e vote) |
| `ActionScreen` (plan d'action) | — | Absent, aucune route backend |
| `SummaryScreen` (bilan) | — | Absent, aucune route backend |

---

## Fonctionnalités attendues (issu de la maquette) vs code actuel

| Fonctionnalité | Figma Make | Code réel | Statut |
|---|---|---|---|
| Créer une session avec nom | Oui | Oui (`POST /session/create-session`) | ✅ |
| Rejoindre par code | Oui (code à 6 caractères alphanumériques dans le mock) | Oui, code à 4 chiffres (`POST /session/join`) | ⚠️ Format différent, assumé (documenté dans `docs/TODO.md`) |
| Liste des participants en temps réel | Oui, avec avatars et statut (online/away/offline) | Non — seul l'utilisateur courant est affiché | ❌ Backend manquant |
| Ajout de carte (3 colonnes) | Oui | Oui (`POST /session/:id/cards`) | ✅ |
| Vote avec quota | Oui (5 votes) | Oui (5 votes/session, backend) | ✅ |
| Compteur de votes restants visible en continu | Oui | Non (seulement au refus) | ❌ |
| Commentaires sur une carte | Oui (`CommentsModal`) | Non | ❌ Hors périmètre MVP assumé |
| Chat de discussion pendant la session | Oui (`DiscussionPanel`) | Non | ❌ Hors périmètre MVP assumé |
| Résultats triés par votes | Oui | Oui (`resultsCards` trié côté frontend) | ✅ |
| Plan d'action (owner, priorité, échéance) | Oui (`ActionScreen`) | Non | ❌ Aucune table/route backend |
| Résumé de fin de session | Oui (`SummaryScreen`) | Non | ❌ Aucune route backend |
| Authentification (compte, JWT) | Non (pseudo local uniquement) | Oui | ✅ Ajout légitime du code réel, hors scope Figma |

---

## Critères d'acceptation par écran

### Accueil (`/`)
- CA1 : la page affiche un choix clair entre "Créer une rétro" et "Rejoindre".
- CA2 : un visiteur non connecté cliquant sur ces actions est redirigé vers `/signup` ou `/login` (comportement déjà correct dans `home.tsx`).
- CA3 : aucune donnée en dur ne doit être présentée comme réelle sans note explicite (ex. compteur de participants connectés — actuellement `CONNECTED_PARTICIPANTS = 7` en dur, cf. `TODO-HOME-01`).
- CA4 : le style (couleurs navy/green-figma, typographie Inter) correspond aux tokens définis dans `App.css` `@theme`, déjà alignés sur `figma_make/src/styles/theme.css`.

### Connexion (`/login`)
- CA1 : formulaire pseudo + mot de passe, validation avant envoi.
- CA2 : erreurs API affichées via toast, message réseau générique en cas d'échec fetch.
- CA3 : liens vers inscription, mot de passe oublié, retour accueil.
- CA4 : aucun écran équivalent dans la maquette Figma Make — le style doit rester cohérent avec le reste de l'app (dark navy, mêmes composants `FormField`/`FormContainer`/`Button`) sans copier un écran qui n'existe pas.

### Inscription (`/signup`)
- CA1 : formulaire pseudo + email + mot de passe + confirmation, validations cohérentes (mot de passe ≥ 6 caractères).
- CA2 : succès → connexion automatique + toast de succès.
- CA3 : mêmes contraintes de cohérence visuelle que Connexion (CA4 ci-dessus).

### Salle d'attente (`/session/:id`, étape `waiting`)
- CA1 : affiche le nom et le code de la session.
- CA2 : liste les participants connectés (actuellement limité à l'utilisateur courant, cf. écart P0 ci-dessous).
- CA3 : le facilitateur voit un bouton "Démarrer", les autres participants ne le voient pas.
- CA4 : cohérent avec `figma_make/src/app/screens/WaitingScreen.tsx` pour la disposition (liste participants + statut).

### Écriture / Vote / Résultats (`/session/:id`)
- CA1 : 3 colonnes avec couleurs distinctes (vert/rouge/jaune), conformes aux tokens `--color-green-figma`, `--color-red-figma`, `--color-yellow-figma`.
- CA2 : ajout de carte possible uniquement à l'étape `writing`.
- CA3 : vote possible uniquement à l'étape `voting`, quota affiché en continu (écart à corriger, priorité P1).
- CA4 : résultats triés par votes décroissants, lecture seule.
- CA5 : seul le facilitateur voit les boutons de transition d'étape.

---

## Écarts entre Figma et le code actuel (résumé)

Voir `docs/figma-gap-analysis.md` pour le détail avec fichiers concernés. Les catégories d'écart :
1. **Fonctionnalités absentes côté backend** (participants temps réel, commentaires, chat, plan d'action, résumé).
2. **UX incomplète** (compteur de votes restants, valeurs en dur type "7 participants").
3. **Divergences volontaires et déjà assumées** (code de session 4 chiffres vs 6 caractères, pas de lien d'invitation, pas de timer d'étape) — ces choix sont documentés dans `docs/TODO.md` comme hors périmètre MVP DWWM, à ne pas re-développer sans décision explicite.
4. **Écrans additionnels légitimes** (authentification complète) qui n'existent pas dans le prototype Figma Make car celui-ci ne gère pas de compte.

---

## Priorités

- **P0** — Bloque la cohérence produit ou la crédibilité devant le jury :
  - Formulaire "démarrage rapide" de l'accueil partiellement décoratif (`TODO-HOME-02`).
  - Compteur de participants en dur (`TODO-HOME-01`).
  - Absence de liste de participants réelle en salle d'attente (`TODO-SESSION-01`).
- **P1** — Amélioration UX notable, faisable dans le temps DWWM restant :
  - Compteur "X votes restants" affiché en continu pendant le vote.
  - Toast homogène (`ToastStyled.tsx` hors Tailwind, à trancher).
  - URL API en dur (`VITE_API_URL`), bonne pratique de déploiement.
- **P2** — Fonctionnalités de la maquette non couvertes, à assumer à l'oral ou à traiter après soutenance :
  - Chat de discussion, commentaires sur carte, plan d'action, écran résumé, avatars/statuts participants, lien d'invitation, timer d'étape.

---

## Plan de refonte page par page (proposé, à valider avant tout code)

1. **Accueil + Connexion + Inscription** (première PR proposée, voir plus bas) — nettoyage des écarts P0 visuels et UX sans toucher au backend.
2. **Salle d'attente** — après décision sur `GET /session/:id/participants` (backend), refonte de l'affichage participants.
3. **Tableau (Écriture/Vote/Résultats)** — ajout du compteur de votes restants (P1), pas de changement structurel.
4. **Décision produit** sur le périmètre P2 (chat, commentaires, plan d'action, résumé) : à trancher avec le jury/tuteur avant tout développement, car cela dépasse le périmètre DWWM initial documenté dans `docs/TODO.md`.

Chaque étape suit le cycle du projet : `analyse → proposition → validation → développement → test → documentation` (règle 7 de `CLAUDE.md`), un sujet à la fois (règle 8).
