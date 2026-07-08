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

**État réel (2026-07-08, fin de journée)** : deux routes suivent entièrement le pattern `controller → service → model` : `GET /session` (liste) et `POST /session/:sessionId/cards/:cardId/vote` (vote). Tous les autres controllers (`auth`, `create`, `join`, `card` create/get/delete) sont **déplacés physiquement** sous `src/controllers/` mais **contiennent toujours du SQL inline** — le déplacement de fichiers et le refactor de logique sont deux choses distinctes, volontairement séparées. Voir `docs/TODO.md` pour la dette restante.

Le endpoint `DELETE /session/:sessionId/cards/:cardId` (suppression de carte, `card.controller.ts`) est livré côté backend sur `feature/delete-card`. Le frontend consomme cet endpoint depuis `SessionDashboard.tsx` avec un bouton visible uniquement pour l'auteur de la carte.

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
   → src/controllers/*.controller.ts → (session/list et vote uniquement) src/services/*.service.ts
   → src/models/*.ts → MySQL → réponse JSON
```

Pour tous les domaines sauf `session/list` et `vote`, le contrôleur fait encore directement l'accès SQL — le schéma ci-dessus représente la cible, pas encore la réalité partout.

### Gestion des erreurs

`src/utils/errorHandler.ts` (middleware centralisé) + `src/utils/asyncHandler.ts` (wrapper pour transmettre les rejets de promesse au middleware d'erreur, conservé après la migration Express 5 par cohérence) + `src/utils/AppError.ts` (erreur typée avec `statusCode`/`code`/`details`). Branché sur `GET /session` et `POST .../vote`.

### Routes principales

`src/routes/auth.routes.ts` (montée sur `/auth`, 7 routes) et `src/routes/session.routes.ts` (montée sur `/session`) :

```ts
router.get('/', auth, asyncHandler(listSessions));
router.post('/create-session', auth, createSession);
router.post('/join', auth, joinSession);
router.post('/:sessionId/cards', auth, createCard);
router.get('/:sessionId/cards', auth, getCards);
router.delete('/:sessionId/cards/:cardId', auth, deleteCard);
router.post('/:sessionId/cards/:cardId/vote', auth, asyncHandler(voteForCard));
```

Détail complet dans `docs/technical/API.md` (à vérifier/actualiser séparément).

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
