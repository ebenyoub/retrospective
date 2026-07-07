# Déploiement

> Document de référence pour déployer l'application. À compléter au fur et à mesure.

## Déclenchement du déploiement

Le déploiement ne se déclenche **que** depuis la branche `main` (production). `dev` et les branches `feature/*`/`fix/*` ne déclenchent jamais de déploiement — voir le workflow Git dans `docs/CONVENTIONS.md`.

## Environnements

| Environnement | Usage | URL |
|---|---|---|
| Development | Dev local | http://localhost:5173 (frontend), http://localhost:3000 (backend) |
| Production | À définir | À définir |

## Prérequis

- Node.js >= 18
- MySQL >= 8
- npm >= 9

## Lancer en développement

```bash
# Backend
cd backend
cp .env.example .env    # Configurer les variables
npm install
npm run dev             # Lance sur le port 3000

# Frontend (dans un autre terminal)
cd frontend
cp .env.example .env    # Configurer VITE_API_URL
npm install
npm run dev             # Lance sur le port 5173
```

## Initialiser la base de données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base et exécuter les migrations
CREATE DATABASE retrospective;
USE retrospective;
SOURCE backend/src/database/migrations/001_initial.sql;
```

## Variables d'environnement requises

### Backend
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=retrospective
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

JWT_SECRET=une_chaine_secrete_longue_et_aleatoire
JWT_EXPIRES_IN=24h

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=mot_de_passe_smtp
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
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
