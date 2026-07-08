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

`src/routes/auth.routes.ts` (montée sur `/auth`, 7 routes) et `src/routes/session.routes.ts` (montée sur `/session`) :

```ts
router.get('/', auth, asyncHandler(listSessions));
router.post('/create-session', auth, asyncHandler(createSession));
router.post('/join', auth, asyncHandler(joinSession));
router.post('/:sessionId/cards', auth, asyncHandler(createCard));
router.get('/:sessionId/cards', auth, asyncHandler(getCards));
router.patch('/:sessionId/cards/:cardId', auth, asyncHandler(updateCard));
router.delete('/:sessionId/cards/:cardId', auth, asyncHandler(deleteCard));
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
