# Journal des Décisions Techniques

> Chaque choix technique important est documenté ici avec sa justification.
> Format : Date — Décision — Pourquoi — Alternatives considérées

---

## 2026-06-26 — Stack technique

**Décision** : React + TypeScript + Vite pour le frontend, Node.js + Express + TypeScript pour le backend, MySQL pour la base de données.

**Pourquoi** : Stack moderne, couvrant les deux CCP du titre DWWM. TypeScript ajoute la sécurité du typage sans complexité excessive. MySQL est un SGBD relationnel standard en entreprise.

**Alternatives considérées** :
- Next.js → rejeté (trop opinionné, complexité SSR inutile pour ce projet)
- PostgreSQL → possible mais MySQL est plus courant en formation DWWM
- MongoDB → rejeté (données relationnelles, SQL est plus pertinent pour le jury)

---

## 2026-06-26 — Authentification JWT

**Décision** : Authentification stateless par JWT, sans refresh token pour la V1.

**Pourquoi** : Simple à implémenter et à expliquer. Le JWT contient l'identité de l'utilisateur, pas besoin de vérifier la BDD à chaque requête. Expiration à 24h acceptable pour un usage interne.

**Alternatives considérées** :
- Sessions en base de données → plus complexe, besoin de table de sessions
- Refresh tokens → trop complexe pour le MVP, peut être ajouté en V2

---

## 2026-06-26 — Pas d'ORM

**Décision** : Requêtes SQL directes avec le driver MySQL2, pas d'ORM.

**Pourquoi** : Les requêtes SQL sont lisibles, compréhensibles, et explicables à l'oral. Un ORM ajoute une couche d'abstraction que le jury pourrait questionner sans que le candidat maîtrise le SQL sous-jacent.

**Alternatives considérées** :
- Prisma → rejeté (génération de code, migrations complexes, difficile à expliquer)
- Sequelize → rejeté (API verbeuse, concepts ORM à maîtriser en plus)

---

## 2026-06-26 — Context API (pas de Redux)

**Décision** : Utiliser le Context API natif de React pour l'état global.

**Pourquoi** : Suffisant pour l'échelle de ce projet. Natif React, sans dépendance supplémentaire, compréhensible sans connaissance de Redux.

**Alternatives considérées** :
- Redux → trop complexe, boilerplate excessif pour ce projet
- Zustand → possible mais ajoute une dépendance sans valeur ajoutée significative

---

## 2026-07-09 — Syntaxe Zod v4 pour les validateurs

**Décision** : Migrer les validateurs backend (`src/validators/`) de la syntaxe Zod v3 (`required_error`, `errorMap`) vers le paramètre unifié `error` de Zod v4.

**Pourquoi** : Le projet installe Zod 4.4.3 mais les validateurs utilisaient la syntaxe v3, ce qui provoquait 17 erreurs `npx tsc --noEmit`. La syntaxe v4 est plus simple (un seul paramètre `error`) et supprime toute la dette TypeScript backend. Les messages en français sont conservés à l'identique et couverts par des tests.

**Alternatives considérées** :
- Rétrograder vers Zod 3 → rejeté (retour en arrière, dépendance vieillissante)
- Ignorer les erreurs tsc → rejeté (dette potentiellement bloquante pour la soutenance, tsc doit rester une vérification fiable)

---

## 2026-07-09 — Protection des routes privées avec un composant `RequireAuth`

**Décision** : Les routes privées (`/profile`, `/sessions`, `/session`, `/session/:id`) sont enveloppées dans un composant `RequireAuth` qui redirige vers `/login` si l'utilisateur n'est pas connecté.

**Pourquoi** : Les tests manuels du 2026-07-09 ont montré que `/profile` restait accessible (vide) après déconnexion. Un composant de garde unique est la solution React Router standard, simple à expliquer au jury : « si pas connecté, on redirige ».

**Alternatives considérées** :
- Redirection dans un `useEffect` de chaque page (existant sur `SessionDashboard`) → rejeté comme solution générale (duplication sur chaque page, la page s'affiche brièvement avant la redirection)
- Layout route parent avec `<Outlet />` → équivalent, mais le wrapper par route est plus explicite à l'oral

---

## 2026-07-10 — Retrait de `RequireAuth` sur `/session/:id` (accès invité)

**Décision** : `/session/:id` n'est plus protégée par `RequireAuth`. La page gère elle-même deux cas : facilitateur/utilisateur authentifié (accès direct) et visiteur non authentifié (modale de choix de pseudo, sans redirection).

**Pourquoi** : Un participant invité ouvrant le lien d'invitation dans une fenêtre privée n'a pas de JWT et était systématiquement redirigé vers `/login`, ce qui rendait le lien d'invitation inutilisable pour toute personne sans compte. C'est la cause racine du bug « le facilitateur ne voit jamais le participant ». Cette entrée **remplace partiellement** la décision du 2026-07-09 (« Protection des routes privées avec un composant RequireAuth ») pour cette route précise ; `/sessions` et `/session` restent protégées telles quelles.

**Alternatives considérées** :
- Garder `RequireAuth` et forcer une inscription avant de rejoindre → rejeté, contraire au besoin produit (participant sans compte)
- Route séparée `/session/:id/join` pour les invités → rejeté, complexité de routage inutile pour ce qui reste une seule page

---

## 2026-07-10 — Participants : table dédiée `session_participants`, pas de compte invité

**Décision** : Création d'une table `session_participants` (id, session_id, user_id nullable, guest_token nullable, display_name, role, status, joined_at, last_seen_at) qui est la source de vérité unique de la salle d'attente. Le facilitateur, les participants authentifiés et les invités y sont représentés de façon uniforme. Un invité reçoit un `guest_token` aléatoire (stocké côté client dans `localStorage`, isolé du contexte d'authentification) et n'a **aucune ligne dans `users`**.

**Pourquoi** : Une version précédente (même session de travail) faisait rejoindre les invités en créant un compte technique dans `users` avec un mot de passe aléatoire, pour réutiliser le système JWT existant. Cette approche avait deux défauts découverts lors du diagnostic : (1) elle viole l'exigence produit « ne pas transformer les invités en utilisateurs enregistrés » ; (2) l'unicité du pseudo était portée par la contrainte `UNIQUE` globale de `users.username`, donc un pseudo déjà pris **une seule fois dans l'historique de toute l'application** forçait un suffixe automatique — pas seulement dans la session courante. `session_participants` porte l'unicité du pseudo *par session* (`UNIQUE (session_id, display_name)`), ce qui est le comportement attendu.

**Alternatives considérées** :
- Continuer avec le compte technique invité → rejeté pour les raisons ci-dessus
- Réutiliser `session_user` (table existante liant `users` et `sessions`) → rejeté, cette table suppose un `user_id` non nul et sert un usage différent (historique « Mes sessions » d'un utilisateur inscrit), pas la présence temps réel

---

## 2026-07-10 — Synchronisation temps réel via Socket.IO

**Décision** : Un unique serveur Socket.IO (`src/realtime/socket.ts`) est attaché au même serveur HTTP qu'Express (`http.createServer` au lieu de `app.listen`). Le frontend ouvre un socket dédié par montage de `SessionDashboard` (fermé proprement au démontage). Événements : `session:join` (client → serveur), `session:participants-updated` et `session:started` (serveur → clients d'une room `session:{id}`). Le polling REST existant (4 s) est conservé comme filet de sécurité pour les utilisateurs authentifiés.

**Pourquoi** : `socket.io` et `socket.io-client` étaient déjà des dépendances du projet (présentes dans les deux `package.json`) mais jamais utilisées — c'est l'activation d'une infrastructure prévue, pas l'ajout d'une nouvelle techno. Un socket par montage (plutôt qu'un singleton partagé) gère naturellement le changement de session, la fermeture d'onglet et le double montage React (StrictMode) : chaque montage ouvre son propre socket, chaque démontage le ferme.

**Alternatives considérées** :
- Polling seul, sans WebSocket → rejeté explicitement par la consigne produit, latence perceptible (jusqu'à 4 s) pour voir un participant rejoindre
- Socket singleton partagé entre toutes les pages → rejeté, plus complexe à raisonner pour la gestion de la room courante et le nettoyage au changement de session

---

## 2026-07-10 — Capacité de session : 25 participants (facilitateur inclus)

**Décision** : La limite passe de 8 (valeur arbitraire de la maquette, jamais appliquée côté backend) à 25, facilitateur compris. Vérifiée côté backend (`assertRoomAvailable` dans `participant.service.ts`, réponse 403 « Cette session est complète. ») avant toute insertion dans `session_participants`.

**Pourquoi** : Exigence produit explicite. La vérification backend est nécessaire : le frontend ne masque pas un problème de capacité, un appel direct à l'API est également bloqué.

---

## 2026-07-10 — Format de rétrospective : sélection et persistance, pas de tableau dynamique

**Décision** : `sessions.format_name` (VARCHAR) et `sessions.format_columns` (JSON) stockent le format choisi. Le facilitateur choisit parmi 4 presets ou crée un format personnalisé (2 à 5 colonnes, modale dédiée). Le tableau d'écriture (`RetroColumn`, `retro_cards.column_type`) **continue d'utiliser ses 3 colonnes fixes `start/stop/continue`** : le format choisi n'est reflété que dans la salle d'attente pour l'instant.

**Pourquoi** : `retro_cards.column_type` est un ENUM à 3 valeurs, profondément couplé au tableau d'écriture, aux votes et aux composants `RetroColumn`/`RetroCardItem`. Rendre le tableau réellement dynamique (2 à 5 colonnes arbitraires) est une migration de schéma plus large, hors périmètre de la tâche « salle d'attente », et risquerait de déstabiliser un système de cartes/votes qui fonctionne. La consigne autorisait explicitement une version simple si la structure nécessaire n'existe pas encore.

**Alternatives considérées** :
- Migrer `retro_cards.column_type` en VARCHAR libre dès maintenant → rejeté, périmètre trop large pour cette tâche, à traiter séparément
- Ne pas persister le format du tout → rejeté, la consigne demande explicitement un enregistrement backend

---

## 2026-07-10 — Menu Profil déroulant remplace la page `/profile`

**Décision** : Suppression de `Profile.tsx` et de la route `/profile`. Le bouton « Profile » de la navbar devient un menu déroulant accessible (`ProfileMenu.tsx`, pattern WAI-ARIA "menu button") contenant Mes sessions, Rejoindre une session, Créer une rétrospective, Déconnexion. Les deux dernières entrées renvoient vers `/` avec un état de navigation (`location.state.tab`) pour présélectionner l'onglet correspondant sur la page d'accueil, réutilisant les formulaires déjà construits (`CreateSessionForm`, `JoinSessionForm`) plutôt que de dupliquer un flux.

**Pourquoi** : La page `/profile` ne contenait que 3 boutons de navigation, une page intermédiaire sans contenu propre. La consigne demandait explicitement son retrait au profit d'un menu.

---

## 2026-07-13 — Rejoindre une session invitée depuis le lien direct : afficher `JoinSessionModal` au lieu de rediriger

**Décision** : Dans `SessionDashboard.tsx`, un visiteur ni authentifié ni porteur d'une identité invitée pour la session courante voit désormais le formulaire de pseudo (`JoinSessionModal`, déjà écrit et testé isolément) rendu directement sur la page, au lieu d'être redirigé vers `/`. Même traitement quand un jeton invité stocké en `localStorage` s'avère invalide côté serveur (session expirée, jeton d'une autre session) : l'identité est effacée et le même formulaire réapparaît, sans navigation.

**Pourquoi** : C'était la cause racine du bug rapporté « le participant ne voit jamais l'écran d'écriture ». Le parcours qui passe par l'accueil (`JoinSessionForm`, code + pseudo) fonctionnait déjà correctement et stocke l'identité avant de naviguer vers `/session/:id`. Mais un participant qui ouvre directement le lien d'invitation partagé par le facilitateur (le cas d'usage réel le plus courant) arrive sur `/session/:id` sans être jamais passé par l'accueil : aucune identité en `localStorage`, pas de JWT. Le code redirigeait alors silencieusement vers `/`, un formulaire générique de création de compte, sans aucune indication qu'une session l'attendait — le participant ne pouvait tout simplement pas rejoindre. `JoinSessionModal.tsx` avait été construit plus tôt dans la session de travail (avec ses tests) précisément pour ce cas, mais n'avait jamais été importé ni affiché dans `SessionDashboard.tsx` : du code mort qui donnait l'illusion que le cas était couvert.

**Alternatives considérées** :
- Rediriger vers l'accueil avec le code de session pré-rempli → rejeté, complexité inutile (aller-retour de navigation) alors que la page de session connaît déjà son propre `sessionId` et peut afficher le formulaire sur place.
- Réutiliser `JoinSessionForm` (code + pseudo) à la place de `JoinSessionModal` (pseudo seul) → rejeté, redondant : le code de session est déjà la barrière franchie en arrivant sur `/session/:id`, redemander le code n'apporte rien.

---

## 2026-07-13 — Code de session affiché en permanence, pas seulement dans la salle d'attente

**Décision** : Un badge « Code : XXXX » est ajouté dans la barre d'outils des étapes écriture/vote/résultats de `SessionDashboard.tsx`, à côté du badge de rôle et du badge d'étape.

**Pourquoi** : Exigence produit explicite (« le code de session doit rester visible pendant toute la rétrospective »). Le code n'était affiché que dans `WaitingScreen`, donc invisible dès que le facilitateur lançait la rétro — un participant qui doit renvoyer le lien/code à un collègue en retard n'avait plus aucun moyen de le retrouver depuis l'écran d'écriture.

---

## 2026-07-13 — Audit de conformité aux skills : corrections mécaniques appliquées, changements de comportement écartés

**Décision** : Un audit du parcours participant contre les skills `.claude/skills/` a distingué deux catégories d'écarts : (1) des corrections mécaniques sans risque (validateur non branché, code mort, nom de fonction hérité, `SELECT *`), appliquées immédiatement ; (2) des écarts qui impliqueraient un changement de comportement produit ou visuel, volontairement non corrigés cette session.

**Pourquoi** : Cohérent avec la règle CLAUDE.md « un sujet à la fois » — un audit de conformité ne doit pas devenir l'occasion d'un chantier produit non validé.
- `guest_token` sans expiration propre (AUDIT-05) : le corriger implique de décider ce qu'il advient d'un invité sur une session expirée/fermée (blocage immédiat ? lecture seule ?) — une décision produit, pas une correction technique.
- Duplication de l'avatar entre `WaitingScreen` et `RetroCardItem` (AUDIT-06) : les deux implémentations utilisent des algorithmes de hash différents (par nom vs par id) ; les fusionner changerait la couleur assignée à chaque participant dans l'un des deux écrans, un changement visuel qui mérite une validation plutôt qu'un effet de bord d'un nettoyage de code.
- `RetroCard.authorId` désigne désormais un `session_participants.id` (pas un `users.id`) sans avoir été renommé : jugé défendable tel quel à l'oral (« l'auteur est identifié par l'id de sa ligne de participation ») ; un renommage toucherait ~8 fichiers (type, composants, fixtures de tests des deux côtés) pour un gain de clarté marginal.

**Alternatives considérées** :
- Tout corriger dans la foulée → rejeté, risque de mélanger correction de conformité et décision produit non validée par l'utilisateur.
- Ignorer silencieusement ces écarts → rejeté, contraire à la consigne explicite de ne jamais masquer un écart volontaire.

---

## 2026-07-13 — Revue d'architecture : alignement complet sur les skills DWWM

**Décision** : Refactorisation structurelle (sans nouvelle fonctionnalité) pour rendre le projet réellement fidèle aux skills `.claude/skills/`. Quatre chantiers :

1. **Frontend organisé par page** — `src/pages/private/` (nom hérité, incohérent avec la route `/session`) renommé `src/pages/session/`. Chaque page garde ses composants/hooks spécifiques dans son propre dossier (`components/`, `hooks/`) ; les composants réellement partagés restent dans `src/components/`. Conforme au skill `react` (« pages orchestrent, composants spécifiques dans le dossier de leur page »).

2. **Backend : un fichier par ressource** — les contrôleurs éclatés par action (7 fichiers auth : login/signup/profile/delete/forgot/code/reset ; 4 fichiers session : create/join/list/step) sont consolidés en `auth.controller.ts`, `passwordReset.controller.ts` et `session.controller.ts`. Résultat : 6 contrôleurs **1:1 avec les 6 services et les 6 modèles** (auth, passwordReset, session, participant, card, vote). Conforme au skill `express-nodejs` (« un fichier par ressource, suffixé `.controller.ts` »), et cohérent avec `card`/`vote`/`participant` déjà dans ce format.

3. **URL d'API centralisée** — les 13 occurrences de `http://localhost:8000` en dur (frontend) remplacées par un unique `src/lib/api.ts` (`API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000"`) + `.env.example`. Conforme au skill `projet-web-deploiement` (« aucune URL d'API en dur »).

4. **Suppression du `any` backend** — le type partagé `AuthRequest` (et son doublon dans `auth.middleware.ts`) utilisait `user?: any`. Introduction d'un type `AuthUser { userId, username }` et d'un helper `requireAuthUser(req)` qui garantit et type l'utilisateur authentifié. `user` reste **optionnel** au niveau du type (une `Request` Express de base n'a pas de `user` : le rendre obligatoire casse la compatibilité avec `RequestHandler`), et le helper lève une 401 si absent. Conforme au skill `typescript` (« aucun `any` »).
**Pourquoi** : Les nouveaux skills (cours d'Elyas) sont la référence du projet. L'audit a montré des écarts réels : nommage incohérent, contrôleurs fragmentés, URL en dur, `any`, code mort. Ces corrections sont **structurelles et à comportement constant** (aucune route, réponse ou règle métier modifiée) — vérifié par 185 tests backend + 109 tests frontend inchangés et un parcours réel (Docker + Playwright).

**Alternatives considérées** :
- Garder les contrôleurs par action (skill `express-dwwm` : « un contrôleur par action ») → écarté : contredit le skill `express-nodejs` (plus récent, sourcé cours) qui prime, et l'état mixte actuel (certaines ressources par fichier, d'autres par action) nuit à la cohérence, un critère DWWM clé.
- Rendre `AuthRequest.user` obligatoire → écarté : casse l'assignabilité aux `RequestHandler` d'Express (la `Request` de base n'a pas de `user`).
- Réécrire les formulaires `Login/Signup/SessionCreate` en React Hook Form (comme les formulaires d'accueil) → écarté cette fois : changement de comportement de formulaire, hors périmètre « structure », documenté en dette.

**Suppressions de code mort** : `App.tsx` (stub Vite jamais monté), `assets/Logo.tsx` (jamais importé), `context/theme/useTheme.ts` (aucun provider ni consommateur), `pages/home/components/HomeFeatureSection.tsx` (jamais importé), et le dossier mal nommé `components/styleComonent/` (→ `ToastStyled.tsx` déplacé dans `components/ui/`).


---

## 2026-07-20 — Remédiation d'une anomalie Git Flow détectée en cours de pipeline agent

**Décision** : Sur le pilote du nouveau pipeline d'agents (ticket `DEV-ENV-01`), `qa-tests` a détecté que `developer-fast` avait modifié `retrospective_backend/package.json` directement sur `dev`, sans créer de branche `feature/<ticket-id>` au préalable — violation du Git Flow défini dans `PROJECT_WORKFLOW.md`, non vérifiée par les 3 agents en amont (`analyst-ticket`, `briefing-agent`, `developer-fast`) malgré la consigne de délégation les y renvoyant. L'utilisateur a choisi de créer immédiatement `feature/DEV-ENV-01-hot-reload` depuis l'état actuel de `dev` (les modifications non commitées suivent la nouvelle branche sans perte), puis de terminer le pipeline (`reviewer-code`, `documentation-technique`, `commit-agent`, rapport d'évaluation du pipeline), sans merger et sans revenir sur `dev`, en attendant sa validation avant toute suite.

**Pourquoi** : ne pas perdre le travail déjà effectué.

**Alternatives considérées** :
- Arrêter le pilote et annuler le changement → écarté par le choix de l'utilisateur
- Continuer tel quel sur `dev` en acceptant l'écart pour ce pilote → écarté par le choix de l'utilisateur

---

## 2026-07-14 — Stabilisation de la fonctionnalité session

**Décision** : La fonctionnalité session est désormais considérée comme définitivement stabilisée. Toute nouvelle refactorisation de cette fonctionnalité est exclue, sauf en cas de bug avéré, de demande d'évolution fonctionnelle spécifique du client/enseignant, ou de problème de performance/qualité objectivement démontré et reproductible.

**Pourquoi** : Clôturer le chantier de refactorisation structurelle de la session après l'avoir réorganisée en une architecture claire (types ↑ services ↑ hooks ↑ components ↑ steps), testée (139 tests verts découpés par responsabilité) et mise en conformité a11y (dialogue accessible, focus trap, touche Échap, restauration du focus). Cela sécurise la base de code pour la soutenance et permet de focaliser l'effort sur les autres chantiers du Product Backlog.

---

## 2026-07-28 — Accès invité vs. accès par compte à l'historique des sessions

**Décision** : Un invité (sans compte) ne peut consulter une session que tant que son jeton d'invité reste valide, c'est-à-dire dans les 24h suivant sa jointure (`T-PART-02`), y compris en lecture seule sur une session close (`US-14`). Passé ce délai, l'accès est définitivement coupé — pas d'exception, pas de prolongation. Seul un utilisateur avec un compte conserve un accès permanent à tout l'historique des sessions auxquelles il a participé ou qu'il a créées, via « Mes sessions ».

**Pourquoi** : Clarifie `AUDIT-05` (`docs/TODO.md`), qui laissait ouverte la question du devenir d'un jeton invité sur une session très ancienne. Le comportement actuel du code (`assertGuestTokenNotExpired`, appelé sans condition de statut de session dans `participant.service.ts`) applique déjà cette règle — **aucune modification de code nécessaire**, décision purement déclarative qui ferme `AUDIT-05`.

**Alternatives considérées** :
- Laisser un jeton invité valide indéfiniment tant que la ligne `session_participants` existe → écarté explicitement par l'utilisateur : un invité sans compte ne doit pas pouvoir revenir sur une session au-delà de sa fenêtre de validité.

---

## 2026-07-29 — Déploiement VPS : même sous-domaine avec routage par chemin, alias réseau `retrospective_db`

**Décision** : Le projet est déployé sur le VPS Hetzner partagé (`167.233.194.26`), aux côtés de 3 autres projets. Frontend et backend sont servis sous le **même sous-domaine** `retrospective.elyasbenyoub.dev`, routés par chemin par le nginx partagé (`/auth/`, `/session/`, `/socket.io/` → backend ; `/` → frontend), plutôt que par ports séparés. Le service MySQL du `docker-compose.prod.yml` porte l'alias réseau Docker `retrospective_db`, déjà utilisé comme nom d'hôte de connexion par le backend.

**Pourquoi** : L'authentification de ce projet repose sur un cookie HttpOnly (contrairement aux 3 autres projets déjà déployés sur ce VPS, qui utilisent un token en localStorage) et le projet utilise Socket.IO pour le temps réel. Un cookie HttpOnly pose des complications CORS en cross-origin ; le servir sous la même origine que le frontend supprime le problème à la racine, au prix d'un routage par chemin plutôt que par port (modèle déjà éprouvé sur ce VPS pour La Loge). L'alias réseau `retrospective_db` garde une convention de nommage stable et lisible entre l'environnement Docker local et la production, sans dépendre d'une IP ou d'un nom de conteneur généré automatiquement.

**Alternatives considérées** :
- Frontend et backend sur deux sous-domaines/ports distincts (modèle `atelier_dein`/`mediatheque`) → rejeté, obligerait à configurer CORS cross-origin pour un cookie HttpOnly, plus complexe à expliquer et à sécuriser que le routage par chemin sous une même origine.
- Publier les ports de la base/backend/frontend sur l'hôte → rejeté, le modèle le plus récent de ce VPS (projet `marsai`) ne publie que 80/443 via le nginx partagé, cohérence retenue pour ce déploiement.

---

## 2026-07-30 — Préfixe `/api` pour toute l'API, déployé en 3 temps sans coupure

**Décision** : Toute l'API bascule sous un préfixe distinct `/api` (`server.ts` monte
`/api/auth`/`/api/session`, `API_BASE` frontend inclut `/api`), et le nginx du VPS
partagé fusionne ses deux blocs `location /auth/`/`location /session/` en un seul
`location /api/`. Le déploiement se fait en 3 temps pour éviter toute coupure : ajout
additif du bloc `/api/` sur le VPS (sans retirer les anciens) → merge/déploiement du
nouveau code → retrait des anciens blocs une fois le nouveau code confirmé stable.

**Pourquoi** : Corrige `BUG-SESSION-RELOAD-ROUTING-01` — le nginx du VPS partagé
(routage par chemin sous un même sous-domaine, voir décision `DEPLOY-VPS-01` du
2026-07-29) routait tout `/session/...` vers le backend, y compris les vraies
navigations navigateur, en collision directe avec la route SPA `/session/:id` du
frontend : un F5 sur cette page renvoyait le JSON brut de l'API au lieu de l'app
React. Un préfixe dédié (`/api`) lève l'ambiguïté à la racine, de façon durable :
aucune route frontend ne pourra plus jamais commencer par `/api`, contrairement à
`/session` qui reste un chemin métier légitime côté frontend.

**Alternatives considérées** :
- Contournement nginx basé sur l'en-tête `Accept` (JSON vs HTML) → rejeté, plus
  fragile (dépend de ce que le navigateur envoie réellement lors d'un F5, pas toujours
  fiable) et moins standard qu'un préfixe de chemin explicite, plus difficile à
  expliquer et à maintenir.
- Déployer nginx et code en une seule fois → rejeté, romprait le site le temps que les
  deux composants (nginx, backend/frontend) soient synchronisés ; le déploiement en 3
  temps (additif → code → nettoyage) garantit qu'à chaque étape l'ancien et le nouveau
  chemin restent tous deux valides jusqu'à confirmation de stabilité.

---

> Ajouter une entrée à chaque fois qu'une décision technique importante est prise.
