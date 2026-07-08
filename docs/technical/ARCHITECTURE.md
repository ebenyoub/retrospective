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
│   │   ├── services/          # Logique métier (session.service.ts)
│   │   ├── models/            # Accès MySQL direct (db.ts, session.model.ts)
│   │   ├── middlewares/       # auth.middleware.ts
│   │   ├── utils/             # logger, AppError, asyncHandler, errorHandler
│   │   └── types/             # Types partagés (AuthRequest, etc.)
│   ├── authentication/utils/  # transporter.ts, types.ts — spécifique au domaine auth, pas déplacé
│   └── server.ts              # Assemble les routes + middleware d'erreur, point d'entrée
│
└── docs/              # Documentation
```

**État réel (2026-07-08, audit backend)** : le pattern `controller → service → model` est maintenant une règle d'architecture **non négociable** pour tout nouveau code backend. Les routes conformes entièrement sont : `GET /session`, `POST /session/:sessionId/cards/:cardId/vote` et `PATCH /session/:sessionId/cards/:cardId`. Plusieurs contrôleurs historiques restent non conformes et sont listés dans `docs/TODO.md`.

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

`src/routes/auth.routes.ts` (montée sur `/auth`, 7 routes) et `src/routes/session.routes.ts` (montée sur `/session`) :

```ts
router.get('/', auth, asyncHandler(listSessions));
router.post('/create-session', auth, createSession);
router.post('/join', auth, joinSession);
router.post('/:sessionId/cards', auth, createCard);
router.get('/:sessionId/cards', auth, getCards);
router.patch('/:sessionId/cards/:cardId', auth, asyncHandler(updateCard));
router.delete('/:sessionId/cards/:cardId', auth, deleteCard);
router.post('/:sessionId/cards/:cardId/vote', auth, asyncHandler(voteForCard));
```

Détail complet dans `docs/technical/API.md` (à vérifier/actualiser séparément).

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
| `src/controllers/card.controller.ts` — `updateCard` | ✅ Conforme | Controller minimal pour `PATCH`, appelle `card.service.ts` |
| `src/services/card.service.ts` — `updateCard` | ✅ Conforme | Validation contenu + auteur + `AppError` |
| `src/models/card.model.ts` — `findCardOwner` / `updateCardContent` | ✅ Conforme | SQL uniquement dans le model |

#### Non conforme

| Fichier | Gravité | Violation | Correction proposée |
|---|---|---|---|
| `src/controllers/card.controller.ts` — `createCard`, `getCards`, `deleteCard` | Moyenne | Controller appelle directement `card.model.ts` et contient logique métier/try-catch | Créer `card.service.ts` pour create/list/delete, déplacer validations/droits/404 vers service, route avec `asyncHandler` |
| `src/controllers/create.controller.ts` | Haute | Importe `db`, SQL inline, logique expiration/session ouverte dans controller | Créer `sessionCreate.service.ts` + `sessionCreate.model.ts`, lever `AppError` |
| `src/controllers/join.controller.ts` | Haute | Importe `db`, SQL inline, logique métier join/doublon dans controller | Créer `joinSession.service.ts` + model dédié ou compléter `session.model.ts` |
| `src/controllers/login.controller.ts` | Haute | Importe `db`, SQL inline, vérification `bcrypt`, génération `jwt`/token dans controller | Créer `auth.service.ts` + `auth.model.ts`; controller minimal |
| `src/controllers/signup.controller.ts` | Haute | Importe `db`, SQL inline, hash `bcrypt`, génération `jwt`/token dans controller | Créer `auth.service.ts` + `auth.model.ts`; gérer doublons via `AppError` |
| `src/controllers/profile.controller.ts` | Faible | Pas d'accès DB, mais pas de service dédié ; logique triviale dans controller | Option A : accepter comme exception documentée ; option B : créer `profile.service.ts` si la logique grossit |
| `src/controllers/forgot.controller.ts` | Moyenne | Importe `db`, SQL inline, génération token/email et appel direct au provider mail dans controller | Créer `passwordReset.service.ts` + model; isoler transport email derrière service/adaptateur |
| `src/controllers/code.controller.ts` | Moyenne | Importe `db`, SQL inline, vérification token/code et usage `jwt` dans controller | Déplacer lookup token + validation dans service |
| `src/controllers/reset.controller.ts` | Moyenne | Importe `db`, SQL inline, hash `bcrypt`/reset/delete token dans controller | Déplacer reset password dans service/model |
| `src/controllers/delete.controller.ts` | Moyenne | Importe `db`, SQL inline suppression utilisateur | Déplacer suppression compte dans service/model |

#### Lots de réparation recommandés

1. **Lot cartes** : finir `card.controller.ts` en déplaçant `createCard`, `getCards`, `deleteCard` vers `card.service.ts`. Petit à moyen, limité au domaine cartes.
2. **Lot session create/join** : refactorer `create.controller.ts` et `join.controller.ts`. Moyen, logique métier session à tester séparément.
3. **Lot auth login/signup/profile/delete** : refactorer l'auth de base. Moyen à large, sensible car JWT/bcrypt/génération de token.
4. **Lot password reset** : refactorer `forgot/code/reset`. Moyen, sensible car email/token temporaire/provider mail.

#### Résultat des recherches d'audit

- Imports directs de `db` dans `src/controllers` : `login`, `signup`, `forgot`, `code`, `reset`, `delete`, `create`, `join`.
- `db.execute` dans `src/controllers` : mêmes fichiers que ci-dessus.
- SQL brut dans `src/controllers` : mêmes fichiers que ci-dessus.
- `card.controller.ts` : aucun import `db` et aucun `db.execute`, mais `create/get/delete` appellent encore le model directement au lieu d'un service.
- `routes/` : pas d'accès DB détecté ; rôle limité au wiring route + middleware + controller.

## Base de données

**SGBD** : MySQL
**Schéma** : Voir `docs/technical/DATABASE.md`

## Sécurité

- Mots de passe hashés avec bcrypt (salt rounds : 10)
- Authentification par JWT (token dans les headers)
- Requêtes SQL paramétrées (pas d'injection possible)
- Variables d'environnement pour les secrets
- CORS configuré côté backend

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
