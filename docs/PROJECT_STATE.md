# État du Projet

> Mettre à jour ce fichier avant toute modification importante.

## Date de dernière mise à jour

2026-07-13 (correction du parcours participant : jointure par lien d'invitation direct, code de session visible en permanence)

## État global

🟢 MVP prêt côté fonctionnalités principales. Le parcours participant complet (code + pseudo → salle d'attente → écriture) est désormais **fonctionnel de bout en bout, y compris via le lien d'invitation direct** : un participant qui ouvre `/session/:id` sans être passé par l'accueil se voit maintenant proposer le formulaire de pseudo sur place au lieu d'être renvoyé vers l'accueil (bug corrigé le 2026-07-13, voir décisions). La salle d'attente est **synchronisée en temps réel** entre facilitateur et participants (Socket.IO), avec une vraie source de vérité backend (table `session_participants`) : un participant invité rejoint sans créer de compte, avec son pseudo conservé tel quel (unicité vérifiée par session, pas de suffixe automatique), peut écrire des cartes et voter (cartes/votes rattachés à `session_participants.id`, plus à `users.id`). Capacité de session portée à 25 personnes (backend + frontend). Le facilitateur peut choisir un format de rétrospective (presets + format personnalisé). Le code de session reste affiché en permanence (salle d'attente + écriture/vote/résultats). Le menu « Profil » est devenu un menu déroulant accessible, la page `/profile` a été supprimée. L'UI reste alignée sur la maquette Figma Make. Le backend est homogénéisé sur le pattern `controller → service → model → DB`, compile sans erreur TypeScript (`npx tsc --noEmit`) et se lance avec MySQL via Docker Compose.

## Fonctionnalités livrées

| Fonctionnalité | Statut | Date |
|---|---|---|
| Fondation documentaire | ✅ Livré | 2026-06-26 |
| Authentification (inscription, connexion, JWT, mot de passe oublié) | ✅ Livré | 2026-07-07 |
| Gestion des sessions (créer/rejoindre par code) | ✅ Livré | 2026-07-07 |
| Lister ses sessions (`GET /session`, US-05) | ✅ Backend + page `SessionList.tsx` | 2026-07-08 |
| Page d'accueil (Home) | ✅ Livré (reconstruite depuis `figma_make.zip`) | 2026-07-07 |
| Tableau de rétrospective — 3 colonnes, ajout/modification de carte | ✅ Livré | 2026-07-08 |
| Système de votes (backend + bouton frontend) | ✅ Livré | 2026-07-08 |
| Vue des résultats triée par votes (US-09) | ✅ Livré | 2026-07-08 |
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
| Capacité de session portée à 25 (facilitateur inclus) | ✅ Vérifiée backend (`participant.service.ts`) et frontend, phrase dynamique sous la liste, message clair si complète | 2026-07-10 |
| Format de rétrospective sélectionnable | ✅ 4 presets + format personnalisé (2 à 5 colonnes, modale), persistance `sessions.format_name`/`format_columns`, réservé au facilitateur (vérifié backend) | 2026-07-10 |
| Cartes de participants accessibles/lisibles | ✅ Graisse modérée, badge « Facilitateur » (pas « Admin »), statut texte + couleur, focus visible, résumé unique dans la barre latérale (suppression des répétitions) | 2026-07-10 |
| Copie du code de session | ✅ Bouton dédié avec retour visuel, `aria-label`, API Clipboard | 2026-07-10 |
| Menu Profil déroulant accessible | ✅ Remplace la page `/profile` : clic, clic extérieur, Échap, navigation clavier, ARIA, focus rendu au bouton | 2026-07-10 |
| Participant invité peut écrire des cartes et voter | ✅ `retro_cards.author_participant_id`/`votes.participant_id` référencent `session_participants` (plus `users`) | 2026-07-13 |
| Parcours participant corrigé (jointure via lien d'invitation direct) | ✅ `JoinSessionModal` câblé dans `SessionDashboard.tsx` (existait mais n'était rendu nulle part), code de session affiché en permanence | 2026-07-13 |

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
- **Architecture** : `retrospective_backend/src/{routes,controllers,services,models,middlewares,utils,types,realtime}` — nouveau dossier `realtime/` pour Socket.IO. Voir `docs/technical/ARCHITECTURE.md` pour le détail.
- **Gestion d'erreurs** : `AppError` + `errorHandler` centralisé + `asyncHandler`.
- **Temps réel** : Socket.IO attaché au même serveur HTTP qu'Express (`server.ts` utilise désormais `http.createServer` + `initSocket`). CORS partagé entre Express et Socket.IO via `src/utils/corsOrigin.ts` (une seule définition de « quelle origine est autorisée »).
- **Tests** : backend 185/185 passés (2026-07-13), `npx tsc --noEmit` sans erreur ; frontend 109/109 passés, lint clean, build Vite OK.

## Ce qui est en cours

- Rien en cours. Correction du parcours participant (jointure par lien direct) vérifiée en conditions réelles le 2026-07-13 (Docker Compose + Playwright, facilitateur + invité). Tests, lint, build (frontend + backend) vérifiés le 2026-07-13. Pas encore commité (attente de validation).

## Prochaine étape

**Finalisation soutenance.**
- Parcours facilitateur + participant invité vérifié en conditions réelles le 2026-07-13 (Docker Compose + Playwright, 2 contextes navigateur), **y compris l'ouverture directe du lien d'invitation** (sans passer par l'accueil) : création de compte + rétro, invitation, jointure sans compte, synchronisation temps réel, écriture de carte, lancement de la rétro synchronisé, code de session visible en permanence.
- Restent : régénération des secrets, documents jury (`docs/jury/`).

## Dette technique restante

### Non bloquant, peut attendre
- Responsive avancé — le responsive basique MVP est livré ; il peut rester du polish visuel fin hors périmètre.
- **Format de rétrospective non reflété sur le tableau d'écriture** : le format choisi (presets ou personnalisé) est persisté et visible dans la salle d'attente, mais `RetroColumn`/`retro_cards.column_type` restent figés sur 3 colonnes `start/stop/continue`. Voir décision du 2026-07-10.
- Compteur "7 participants connectés" en dur sur l'accueil (`HomeHero`) — supprimé lors d'une tâche précédente puis code source à revérifier si réintroduit ; à confirmer qu'aucune valeur fictive ne subsiste avant la soutenance.

### Potentiellement bloquant pour la soutenance (à ne pas oublier)
- En mode Docker Compose, les variables backend locales sont fournies par
  `docker-compose.yml` et la base est initialisée automatiquement. Pour un
  lancement backend manuel hors Docker, recréer `retrospective_backend/.env`
  depuis `.env.example` reste nécessaire.
- Secrets (`JWT_SECRET`, `GMAIL_APP_PASSWORD`) à régénérer — ils ont existé en clair dans un historique Git local avant purge, à considérer comme compromis.
- Protection de branche GitHub (`main`/`dev`) — commandes fournies précédemment, pas encore confirmées actives (à revérifier : `gh api repos/.../branches/main/protection`).
- **Migrations SQL à appliquer manuellement sur toute base existante** : `retrospective_backend/sql/create_session_participants.sql` et `alter_sessions_add_format.sql` sont déjà fusionnées dans `schema.sql` pour une base neuve, mais une base Docker existante doit les exécuter une fois manuellement (déjà fait sur la base de dev locale le 2026-07-10).

## Blocages / Risques

Aucun blocage empêchant de reprendre le travail demain. Les points "potentiellement bloquant" ci-dessus concernent la démonstration/soutenance, pas le développement.

## Notes

Ce fichier est la référence centrale de l'avancement du projet. Il doit rester à jour pour que le jury puisse voir la progression du travail.
