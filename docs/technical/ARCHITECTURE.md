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

**État réel (2026-07-08)** : seul le domaine `session` a été entièrement migré vers le pattern `controller → service → model` (route `GET /session`). Tous les autres controllers (`auth`, `create`, `join`, `card`) ont été **déplacés physiquement** sous `src/controllers/` mais **contiennent toujours du SQL inline** — le déplacement de fichiers (ce ticket) et le refactor de logique (futur ticket) sont deux choses distinctes. Voir `docs/TODO.md` pour la dette restante.

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
**Framework** : Express **4** (`^4.19.2`) — pas Express 5, malgré des demandes formulées en ce sens ; voir `docs/TODO.md`
**Auth** : JWT (jsonwebtoken)
**Hachage** : bcrypt
**Email** : nodemailer
**BDD** : MySQL (driver direct, pas d'ORM)

### Flux d'une requête

```
Client → server.ts → src/routes/*.routes.ts → src/middlewares/auth.middleware.ts
   → src/controllers/*.controller.ts → (session uniquement) src/services/session.service.ts
   → src/models/*.ts → MySQL → réponse JSON
```

Pour tous les domaines sauf `session` (lecture des sessions), le contrôleur fait encore directement l'accès SQL — le schéma ci-dessus représente la cible, pas encore la réalité partout.

### Gestion des erreurs

`src/utils/errorHandler.ts` (middleware centralisé) + `src/utils/asyncHandler.ts` (wrapper Express 4 pour transmettre les rejets de promesse) + `src/utils/AppError.ts` (erreur typée avec `statusCode`/`code`/`details`). Uniquement branché sur `GET /session` pour l'instant.

### Routes principales

`src/routes/auth.routes.ts` (montée sur `/auth`) et `src/routes/session.routes.ts` (montée sur `/session`). Détail des routes dans `docs/technical/API.md` (à vérifier/actualiser séparément).

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
