# Déploiement

> Document de référence pour déployer l'application. À compléter au fur et à mesure.

## Déclenchement du déploiement

Le déploiement ne se déclenche **que** depuis la branche `main` (production). `dev` et les branches `feature/*`/`fix/*` ne déclenchent jamais de déploiement — voir le workflow Git dans `docs/CONVENTIONS.md`.

## Environnements

| Environnement | Usage | URL |
|---|---|---|
| Development | Dev local | http://localhost:5173 (frontend), http://localhost:8000 (backend) |
| Production | À définir | À définir |

## Prérequis

- Node.js >= 18
- MySQL >= 8
- npm >= 9
- Docker Desktop ou Docker Engine avec Compose v2 pour l'environnement local conteneurisé

## Lancer en développement

### Option recommandée : backend + MySQL avec Docker

Depuis la racine du projet :

```bash
docker compose up --build
```

Services lancés :
- Backend : `http://localhost:8000`
- MySQL : port hôte `3308`, base `retrospective`

Le schéma local est initialisé automatiquement depuis
`retrospective_backend/sql/schema.sql` lors de la création initiale du volume
Docker `retrospective_mysql_data`.

Arrêter sans supprimer les données :

```bash
docker compose down
```

Réinitialiser volontairement la DB locale :

```bash
docker compose down -v
docker compose up --build
```

### Option manuelle Node/MySQL

```bash
# Backend
cd retrospective_backend
cp .env.example .env    # Configurer les variables
npm install
npm run dev             # Lance sur le port 8000

# Frontend (dans un autre terminal)
cd retrospective_frontend
npm install
npm run dev             # Lance sur le port 5173
```

## Initialiser la base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base et exécuter le schéma initial
CREATE DATABASE retrospective;
USE retrospective;
SOURCE retrospective_backend/sql/schema.sql;
```

## Variables d'environnement requises

### Backend
```env
DB_HOST=localhost
DB_PORT=3306 # 3308 si backend hors Docker + MySQL du docker-compose
DB_NAME=retrospective
DB_USER=retrospective_user
DB_PASSWORD=retrospective_password

JWT_SECRET=une_chaine_secrete_longue_et_aleatoire
JWT_EXPIRES_IN=24h

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=mot_de_passe_smtp
```

### Frontend
```env
VITE_API_URL=http://localhost:8000
```

## Build pour la production

```bash
# Frontend — génère le dossier dist/
cd frontend
npm run build

# Backend — compile TypeScript
cd backend
npm run build
```

## Déploiement production (à définir)

Options envisagées :
- VPS avec PM2 pour le backend Node.js
- Nginx pour servir le frontend et faire reverse proxy
- Base MySQL sur le même serveur ou service managé

> Cette section sera complétée avant la soutenance.
