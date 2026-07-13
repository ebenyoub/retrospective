# Architecture Technique

> À compléter après analyse du code existant.

## Vue d'ensemble

```
retrospective/
├── frontend/          # Application React
│   └── src/
│       ├── authentication/    # Login, Register
│       ├── components/        # Composants réutilisables
│       ├── context/           # Context API (état global)
│       ├── hooks/             # Hooks customs
│       └── pages/             # Pages / routes
│
├── retrospective_backend/   # API Express
│   ├── src/
│   │   ├── routes/            # Déclaration des routes (auth.routes.ts, session.routes.ts)
│   │   ├── controllers/       # HTTP uniquement (req/res), pas de SQL
│   │   ├── services/          # Logique métier (session.service.ts, participant.service.ts)
│   │   ├── models/            # Accès MySQL direct (db.ts, session.model.ts, participant.model.ts)
│   │   ├── middlewares/       # auth.middleware.ts, validate.middleware.ts (Zod)
│   │   ├── validators/        # Schémas Zod par ressource (session, card, participant)
│   │   ├── realtime/          # Socket.IO (socket.ts) — salle d'attente + changement d'étape en direct
│   │   ├── utils/             # logger, AppError, asyncHandler, errorHandler, sessionActor, corsOrigin
│   │   └── types/             # Types partagés (AuthRequest, etc.)
│   ├── authentication/utils/  # transporter.ts, types.ts — spécifique au domaine auth, pas déplacé
│   └── server.ts              # Assemble les routes + middleware d'erreur, point d'entrée
│
└── docs/              # Documentation
```

**État réel (2026-07-08, après PR #15)** : le pattern `controller → service → model` est une règle d'architecture **non négociable**. Les controllers applicatifs ne contiennent plus d'accès DB direct, de SQL, de `bcrypt`, de `jwt`, de génération de token ou d'appel direct à un provider externe.

## Frontend

**Framework** : React 18 + TypeScript
**Build** : Vite
**État global** : Context API
**Appels API** : Fetch (à confirmer)
**Routing** : React Router (à confirmer)

### Flux de données typique

```
Page → Hook custom → Fetch API → Backend
           ↕
        Context (état global)
```

### Composants principaux

> À compléter après analyse du code existant.

## Backend

**Runtime** : Node.js
**Framework** : Express **5** (`^5.2.1`, migré depuis 4.22.2 le 2026-07-08, `refactor/express5`) — zéro changement de code applicatif, `asyncHandler` conservé volontairement pour cohérence
**Auth** : JWT (jsonwebtoken)
**Hachage** : bcrypt
**Email** : nodemailer
**BDD** : MySQL (driver direct, pas d'ORM)

### Flux d'une requête

```
Client → server.ts → src/routes/*.routes.ts → src/middlewares/auth.middleware.ts
   → src/controllers/*.controller.ts → src/services/*.service.ts
   → src/models/*.ts → MySQL → réponse JSON
```

### Règle backend obligatoire

Le backend doit respecter strictement les responsabilités suivantes :

| Couche | Responsabilité autorisée | Interdit |
|---|---|---|
| `routes/` | Déclarer le chemin, les middlewares, le contrôleur, `asyncHandler` si nécessaire | Logique métier, accès DB, SQL |
| `controllers/` | Lire `req`, appeler un service, retourner `res` | `db`, `db.execute`, SQL brut, logique métier, droits, validations métier, `bcrypt`, `jwt`, génération de token, accès filesystem, appel direct à un provider externe, `try/catch` manuel quand `AppError` + `errorHandler` suffisent |
| `services/` | Logique métier, validations métier, droits, orchestration, `AppError` 4xx | SQL brut, `db.execute` |
| `models/` | Accès MySQL direct, `db.execute`, SQL, mapping bas niveau | Règles métier, droits utilisateur |
| `tests/` | Tester controller/service/model séparément quand pertinent | Tester une autre couche par effet de bord si une séparation existe |

Toute nouvelle route ou modification substantielle d'une route existante doit suivre ce pattern. Un contrôleur ne doit pas importer `src/models/db` directement. Le model est le seul endroit autorisé à importer `db`, appeler `db.execute` et contenir des requêtes SQL. Les dépendances sensibles comme `bcrypt`, `jsonwebtoken`, la génération de token, le filesystem ou les providers externes doivent être orchestrés par un service ou un adaptateur appelé par un service, jamais par un contrôleur.

### Gestion des erreurs

`src/utils/errorHandler.ts` (middleware centralisé) + `src/utils/asyncHandler.ts` (wrapper pour transmettre les rejets de promesse au middleware d'erreur, conservé après la migration Express 5 par cohérence) + `src/utils/AppError.ts` (erreur typée avec `statusCode`/`code`/`details`). Le pattern cible est : le service lève une `AppError`, la route utilise `asyncHandler`, et `errorHandler` produit la réponse HTTP.

### Routes principales

`src/routes/auth.routes.ts` (montée sur `/auth`, 7 routes) et `src/routes/session.routes.ts` (montée sur `/session`). Les routes qui reçoivent un body passent désormais par le middleware `validate(schema)` (Zod) avant le contrôleur :

```ts
router.get('/', auth, asyncHandler(listSessions));
router.post('/create-session', auth, validate(createSessionSchema), asyncHandler(createSession));
router.post('/join', auth, validate(joinSessionSchema), asyncHandler(joinSession));

// Session (lecture publique : un invité doit pouvoir lire nom/code/format avant de rejoindre)
router.get('/:sessionId', asyncHandler(getSession));
router.patch('/:sessionId/step', auth, validate(updateSessionStepSchema), asyncHandler(updateSessionStep));
router.patch('/:sessionId/format', auth, validate(updateSessionFormatSchema), asyncHandler(updateSessionFormat));

// Salle d'attente : le code à 4 chiffres reste la vraie barrière, pas de middleware `auth`
// (un invité sans compte doit pouvoir rejoindre et lister les participants).
router.post('/join-guest', validate(guestJoinByCodeSchema), asyncHandler(guestJoinByCode));
router.get('/:sessionId/participants', asyncHandler(listParticipants));
router.post('/:sessionId/participants/self', auth, asyncHandler(joinAsSelf));
router.post('/:sessionId/participants/guest-join', validate(guestJoinSchema), asyncHandler(guestJoin));
router.post('/:sessionId/participants/resume', validate(resumeGuestSchema), asyncHandler(resumeGuest));
router.delete('/:sessionId/participants/:participantId', validate(leaveParticipantSchema), asyncHandler(removeParticipant));

// Cartes et votes : author_participant_id / participant_id référencent session_participants,
// pas users — un invité peut donc écrire des cartes et voter sans compte.
router.post('/:sessionId/cards', validate(createCardSchema), asyncHandler(createCard));
router.get('/:sessionId/cards', asyncHandler(getCards));
router.patch('/:sessionId/cards/:cardId', validate(updateCardSchema), asyncHandler(updateCard));
router.delete('/:sessionId/cards/:cardId', asyncHandler(deleteCard));
router.post('/:sessionId/cards/:cardId/vote', asyncHandler(voteForCard));
```

L'identité de l'auteur d'une action carte/vote (`participantId`) est résolue par `src/utils/sessionActor.ts` : JWT pour un utilisateur authentifié (facilitateur ou participant avec compte), en-têtes `x-participant-id`/`x-guest-token` pour un invité — jamais les deux à la fois.

Détail complet dans `docs/technical/API.md` (à vérifier/actualiser séparément, encore partiellement à jour sur ce point).

### Temps réel (Socket.IO)

Un unique serveur Socket.IO (`src/realtime/socket.ts`) est attaché au même serveur HTTP qu'Express (`http.createServer` dans `server.ts`, au lieu de `app.listen`), avec la même règle CORS (`src/utils/corsOrigin.ts`, partagée avec Express pour ne jamais avoir deux définitions divergentes de "quelle origine est autorisée").

- `session:join` (client → serveur) : un socket rejoint la room `session:{id}` après vérification qu'il connaît soit un JWT valide, soit le `guestToken` du participant qu'il prétend représenter.
- `session:participants-updated` (serveur → room) : diffusé à chaque jointure/départ/changement de statut.
- `session:started` (serveur → room) : diffusé quand le facilitateur change l'étape de la session (`PATCH /:sessionId/step`), fait passer les participants de la salle d'attente à l'écran d'écriture.
- Le frontend garde un polling REST de secours (`GET /session/:id` toutes les 4s) pour ne jamais dépendre uniquement du WebSocket.

### Audit de conformité backend — 2026-07-08

#### Conforme

| Fichier | Statut | Notes |
|---|---|---|
| `src/controllers/list.controller.ts` | ✅ Conforme | Controller minimal, appelle `session.service.ts` |
| `src/services/session.service.ts` | ✅ Conforme | Orchestration + mapping, appelle `session.model.ts` |
| `src/models/session.model.ts` | ✅ Conforme | SQL uniquement dans le model |
| `src/controllers/vote.controller.ts` | ✅ Conforme | Controller minimal, appelle `vote.service.ts` |
| `src/services/vote.service.ts` | ✅ Conforme | Règles métier + `AppError`, appelle `vote.model.ts` |
| `src/models/vote.model.ts` | ✅ Conforme | SQL uniquement dans le model |
| `src/controllers/card.controller.ts` | ✅ Conforme | Controller minimal, appelle `card.service.ts` |
| `src/services/card.service.ts` | ✅ Conforme | Validation contenu + auteur + mapping cartes + `AppError` |
| `src/models/card.model.ts` | ✅ Conforme | SQL uniquement dans le model |
| `src/controllers/create.controller.ts` / `join.controller.ts` | ✅ Conforme | Controllers minimaux, appellent `session.service.ts` |
| `src/controllers/login.controller.ts` / `signup.controller.ts` / `delete.controller.ts` / `profile.controller.ts` | ✅ Conforme | Controllers minimaux, appellent `auth.service.ts` |
| `src/services/auth.service.ts` | ✅ Conforme | Validation auth, `bcrypt`, JWT, profil, suppression compte |
| `src/models/auth.model.ts` | ✅ Conforme | SQL utilisateur uniquement |
| `src/controllers/forgot.controller.ts` / `code.controller.ts` / `reset.controller.ts` | ✅ Conforme | Controllers minimaux, appellent `passwordReset.service.ts` |
| `src/services/passwordReset.service.ts` | ✅ Conforme | Token temporaire, email, bcrypt, validations reset |
| `src/models/passwordReset.model.ts` | ✅ Conforme | SQL reset password uniquement |

#### Non conforme

Aucune violation connue dans les controllers applicatifs après PR #15.

#### Lots de réparation réalisés

1. **Lot cartes** : `createCard`, `getCards`, `deleteCard` déplacés vers `card.service.ts`.
2. **Lot session create/join** : `create.controller.ts` et `join.controller.ts` refactorés vers `session.service.ts` / `session.model.ts`.
3. **Lot auth login/signup/profile/delete** : `auth.service.ts` et `auth.model.ts` ajoutés.
4. **Lot password reset** : `passwordReset.service.ts` et `passwordReset.model.ts` ajoutés.

#### Résultat des recherches d'audit

- Imports directs de `db` dans `src/controllers` : aucun détecté.
- `db.execute` dans `src/controllers` : aucun détecté.
- SQL brut dans `src/controllers` : aucun détecté.
- `bcrypt`, `jwt`, génération de token ou provider externe direct dans `src/controllers` : aucun détecté.
- `routes/` : pas d'accès DB détecté ; rôle limité au wiring route + middleware + controller.

## Base de données

**SGBD** : MySQL
**Schéma** : Voir `docs/technical/DATABASE.md`

## Sécurité

- Mots de passe hashés avec bcrypt (salt rounds : 10)
- Authentification par JWT (token dans les headers)
- Participant invité : `guest_token` aléatoire (pas un compte), jamais renvoyé dans les diffusions Socket.IO (`ParticipantSummary` ne l'expose pas), vérifié à chaque action carte/vote via `sessionActor.ts`
- Requêtes SQL paramétrées (pas d'injection possible)
- Variables d'environnement pour les secrets
- CORS configuré côté backend, règle partagée Express/Socket.IO (`src/utils/corsOrigin.ts`)

**Dette connue (non bloquante)** : un `guest_token` n'a pas de durée de vie propre — il reste valide tant que la ligne `session_participants` existe, même après l'expiration (`sessions.expires_at`) ou la clôture de la session. Voir `TODO.md`.

## Variables d'environnement

### Backend (`.env`)
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=retrospective
DB_USER=root
DB_PASSWORD=

JWT_SECRET=
JWT_EXPIRES_IN=24h

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3000
```
