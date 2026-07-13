# Analyse d'écart Figma Make ↔ Code actuel

> Détail ligne par ligne, à utiliser pour prioriser le développement au lieu de corriger l'UI au hasard.
> Sources : `figma_make/src/app/**`, `retrospective_frontend/src/**`, `retrospective_backend/src/routes/**`.

| Zone | Attendu Figma | Actuel code | Écart | Priorité | Fichiers concernés |
|---|---|---|---|---|---|
| Accueil — compteur participants | Statique dans le mock (`"7 participants connectés"`, texte en dur assumé comme design) | `CONNECTED_PARTICIPANTS = 7` en dur, présenté comme donnée réelle | Valeur en dur non branchée à une vraie donnée, risque question jury | P0 | `retrospective_frontend/src/pages/home/home.tsx` |
| Accueil — formulaire "démarrage rapide" | Onglet "Créer une rétro" avec champs pseudo/mot de passe fonctionnels dans le mock (state local) | Champs visuellement présents mais non connectés à un vrai flux anonyme ; bouton redirige vers `/signup` ou `/session` | Formulaire partiellement décoratif, ambigu pour l'utilisateur | P0 | `retrospective_frontend/src/pages/home/components/HomeTabsCard.tsx` |
| Authentification (Connexion/Inscription/Mot de passe oublié) | Absente de la maquette Figma Make (pas de notion de compte) | Implémentée (JWT, bcrypt) | Ajout légitime hors Figma — à garder cohérent visuellement, pas un écart à corriger | — | `pages/auth/Login.tsx`, `Signup.tsx`, `Forgot.tsx` |
| Salle d'attente — liste des participants | `ParticipantsSidebar` avec avatars colorés, statut (online/away/offline), badge admin | Liste codée en dur avec un seul participant (l'utilisateur courant) | Aucun endpoint `GET /session/:id/participants`, table `session_user` non exposée | P0 | `pages/private/SessionDashboard.tsx` (commentaire TODO explicite ligne ~297), `pages/private/components/WaitingScreen.tsx`, backend `session.routes.ts` |
| Salle d'attente — code de session | Code à 6 caractères alphanumériques (`mockData.ts`) avec lien d'invitation `retroflow.app/join/...` | Code à 4 chiffres, pas de lien d'invitation | Divergence assumée dans `docs/TODO.md`, ne pas re-développer sans décision | P2 | `retrospective_backend/src/controllers/create.controller.ts`, `join.controller.ts` |
| Écriture — 3 colonnes | `WritingScreen.tsx`, catégories `positif`/`negatif`/`idee` | `RetroColumn.tsx` avec `continue`/`stop`/`start`, mêmes couleurs (vert/rouge/jaune) | Nommage interne différent mais UX équivalente, non bloquant | — | `pages/private/components/RetroColumn.tsx` |
| Vote — quota affiché | Barre "votes restants" visible en continu (`VoteScreen.tsx`) | Le quota (5 votes/session) n'est signalé qu'au moment du refus du 6e vote (toast d'erreur) | Manque un indicateur permanent | P1 | `pages/private/SessionDashboard.tsx`, `pages/private/components/RetroCardItem.tsx` |
| Vote — commentaires sur carte | `CommentsModal.tsx`, compteur de commentaires par carte | Absent | Hors périmètre MVP assumé (`docs/TODO.md`) | P2 | — (aucun fichier réel) |
| Discussion — chat de session | `DiscussionPanel.tsx`, panneau latéral avec messages non lus | Absent | Hors périmètre MVP assumé | P2 | — |
| Résultats | Cartes triées par votes décroissants, lecture seule | Identique (`resultsCards` triées côté frontend) | Conforme | — | `pages/private/SessionDashboard.tsx` |
| Plan d'action | `ActionScreen.tsx` — description, owner, priorité (high/medium/low), échéance | Absent, aucune route backend, aucune table | Fonctionnalité complète manquante | P2 | — |
| Résumé de session | `SummaryScreen.tsx` — durée, participants, nombre de commentaires, actions | Absent | Fonctionnalité complète manquante | P2 | — |
| Header / NavBar | `NavBar` du Shell : logo, bouton retour, icône discussion (badge non-lus), icône participants | `Header.tsx` : logo + liens auth/profil/déconnexion uniquement | Pas de bouton retour ni d'icônes discussion/participants (cohérent puisque ces features sont absentes) | P2 (lié aux écarts ci-dessus) | `retrospective_frontend/src/components/Header.tsx` |
| Timer d'étape | Non visible explicitement dans les screens fournis, mentionné dans `docs/TODO.md` comme item maquette | Absent | Hors périmètre MVP assumé | P2 | — |
| Style / tokens couleur | `theme.css` (variables shadcn génériques) + couleurs codées en dur dans les screens (`T.navy`, `T.green`, etc.) | `App.css` `@theme` avec `--color-navy`, `--color-green-figma`, etc. | Déjà porté et aligné (vérifié : mêmes valeurs hex `#0f172a`, `#16a34a`, `#dc2626`, `#d97706`) | — | `retrospective_frontend/src/App.css` |
| Toast / notifications | Non modélisé dans la maquette Figma Make (pas de composant toast dans `figma_make/src/app/components/ui.tsx`) | `ToastStyled.tsx` en `styled-components` avec fond blanc + Font Awesome via CDN, détonne du thème sombre | Incohérence de style interne au code (pas un écart Figma), documentée dans `docs/TODO.md` | P1 | `retrospective_frontend/src/components/styleComonent/ToastStyled.tsx`, `index.html` |
| URL API en dur | Non applicable (mock sans réseau) | `http://localhost:8000` codé en dur dans chaque page | Dette technique de déploiement, sans rapport direct avec Figma mais bloquante pour une démo hors localhost | P1 | Toutes les pages faisant un `fetch(...)` |

---

## Lecture de la priorisation

- **P0** = à traiter avant toute nouvelle refonte visuelle : ce sont des incohérences produit visibles immédiatement par un jury ou un utilisateur (données fausses affichées comme réelles, formulaire trompeur, liste de participants incomplète).
- **P1** = améliore l'expérience sans changer l'architecture ; faisable dans une PR ciblée.
- **P2** = fonctionnalités complètes de la maquette Figma Make (chat, commentaires, plan d'action, résumé) qui dépassent le périmètre MVP DWWM déjà défini dans `docs/TODO.md`. Ne pas les développer sans validation explicite — elles demandent de nouvelles tables, routes et écrans, donc plusieurs tickets suivant le workflow complet (règle 7 de `CLAUDE.md`).

Aucun écart de cette liste n'a été comblé dans ce document : il s'agit uniquement d'un état des lieux, conforme à la demande de ne pas coder à cette étape.
