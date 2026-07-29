# Déploiement

> Document de référence pour déployer l'application. À compléter au fur et à mesure.

## Déclenchement du déploiement

Le déploiement ne se déclenche **que** depuis la branche `main` (production). `dev` et les branches `feature/*`/`fix/*` ne déclenchent jamais de déploiement — voir le workflow Git dans `docs/CONVENTIONS.md`.

## Environnements

| Environnement | Usage | URL |
|---|---|---|
| Development | Dev local | http://localhost:5173 (frontend), http://localhost:8000 (backend) |
| Production | VPS Hetzner partagé | https://retrospective.elyasbenyoub.dev |

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

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=mot_de_passe_smtp_brevo
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM="Range Ta Chambre <no-reply@rangetachambre.com>"
```

### Génération et rotation des secrets

Les valeurs `JWT_SECRET`, `SMTP_PASS` et `EMAIL_PROVIDER_API_KEY` ne doivent jamais être
committées avec leurs vraies valeurs.

Pour préparer un environnement de démonstration ou de production :

```bash
openssl rand -base64 48
```

Utiliser la valeur obtenue comme `JWT_SECRET` dans l'environnement cible. Le
mot de passe SMTP Brevo doit être généré depuis le compte Brevo et configuré
uniquement dans l'environnement cible.
compte Google, puis stocké uniquement dans `.env` ou dans les variables
d'environnement du serveur.

En local Docker Compose, `JWT_SECRET` peut être fourni depuis l'environnement :

```bash
JWT_SECRET="$(openssl rand -base64 48)" docker compose up --build
```

Alternative plus pratique pour un usage répété : copier `.env.example` (racine
du projet) en `.env` et y renseigner `JWT_SECRET` — Docker Compose charge
automatiquement ce fichier, aucun préfixe de commande à retaper à chaque
lancement. `docker-compose.yml` ne fournit **aucune valeur par défaut** pour
`JWT_SECRET` (un secret par défaut codé en dur dans un fichier suivi par Git
serait public) : sans l'une de ces deux méthodes, le backend démarre mais
toute tentative de connexion/inscription échoue en 500 (`jsonwebtoken` refuse
de signer avec un secret vide).

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

## Déploiement production

Le projet est déployé sur un VPS Hetzner partagé (`167.233.194.26`), aux côtés de 3
autres projets (portfolio, la-loge, atelier_dein, marsai). Convention commune à ce VPS :
chaque projet vit dans `/srv/apps/<projet>/`, un unique conteneur nginx partagé
(réseau Docker externe `web`) fait office de reverse proxy pour tous les projets, avec
une configuration centralisée dans `/srv/infrastructure/nginx/conf.d/main.conf` (un
bloc `server{}` par projet dans ce même fichier, jamais un fichier séparé). Le
certificat utilisé est un certificat Cloudflare Origin wildcard déjà en place
(`*.elyasbenyoub.dev`) — aucun certificat propre à ce projet n'est généré.

### Sous-domaine et routage

Sous-domaine : `retrospective.elyasbenyoub.dev` (DNS créé côté Cloudflare par
l'utilisateur, hors du périmètre de déploiement).

Contrairement à `atelier_dein`/`mediatheque` (frontend et backend sur des ports
séparés), frontend et backend de ce projet sont servis **sous le même sous-domaine**,
routés par chemin :
- `/auth/`, `/session/`, `/socket.io/` → backend (conteneur `retrospective-backend-1`)
- `/` → frontend (conteneur `retrospective-frontend-1`)

Ce choix (identique à La Loge) est nécessaire car l'authentification repose sur un
cookie HttpOnly : le cookie ne pose aucun problème CORS cross-origin tant que
frontend et backend partagent la même origine.

Particularité propre à ce projet (aucun des 3 autres n'utilise de WebSocket) : le
bloc `/socket.io/` porte les en-têtes `proxy_http_version 1.1`,
`proxy_set_header Upgrade $http_upgrade` et `proxy_set_header Connection "upgrade"`,
indispensables au bon fonctionnement de Socket.IO derrière nginx.

Le contenu exact du bloc nginx à ajouter (à la suite des blocs existants) dans
`/srv/infrastructure/nginx/conf.d/main.conf` est documenté dans
`docs/technical/nginx-retrospective.conf`.

### Modèle de conteneurs

Aucun port n'est publié sur l'hôte pour la base de données, le backend ou le
frontend (modèle le plus récent utilisé sur ce VPS, projet `marsai`) : seul le
conteneur nginx partagé publie les ports 80/443.

### Déploiement continu

`.github/workflows/deploy.yml` se déclenche uniquement sur push vers `main` :
rsync du code vers le VPS, puis par SSH `docker compose -f docker-compose.prod.yml
build --no-cache && up -d`, `docker image prune -f`, et rechargement de nginx
(`docker exec nginx nginx -t && nginx -s reload`). Secrets GitHub requis sur le
dépôt : `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

Le tout premier déploiement est réalisé manuellement (création du volume Docker
externe, `.env` réel sur le VPS, rsync initial, `docker compose up`, ajout du bloc
nginx avec sauvegarde préalable de `main.conf` dans `conf.d/backups/`, `nginx -t`
puis `nginx -s reload`) : la CI ne fait ensuite que rejouer les mêmes étapes de
build/up à chaque push sur `main`.
