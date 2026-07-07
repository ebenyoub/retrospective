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
├── backend/           # API Express
│   └── src/
│       ├── authentication/    # Contrôleurs auth
│       ├── controllers/       # Contrôleurs métier
│       └── session/           # Gestion des sessions
│
└── docs/              # Documentation
```

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
**Framework** : Express + TypeScript
**Auth** : JWT (jsonwebtoken)
**Hachage** : bcrypt
**Email** : nodemailer
**BDD** : MySQL (driver direct, pas d'ORM)

### Flux d'une requête

```
Client → Route Express → Middleware Auth → Contrôleur → Base de données → Réponse JSON
```

### Routes principales

> À compléter dans `docs/technical/API.md`

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
