---
name: projet-web-deploiement
description: Initialisation de projet, outils de qualité de code, internationalisation, envoi d'emails, upload de fichiers, Docker et déploiement, tels qu'enseignés dans la formation d'Elyas (cours 34-Initialisation, 35-i18n, 36-Envoi email, 38-Upload S3, 51-Docker, 52-Déploiement - la-plateforme.io). À consulter avant de démarrer un nouveau projet (structure, ESLint/Prettier, workflow Git), d'ajouter des fonctionnalités transverses (traduction, email, upload de fichiers), de dockeriser une application, ou de préparer un déploiement.
---

# Initialisation projet, services et déploiement

Cours sources : 34-Initialisation projet Web, 35-i18n, 36-Envoi email Express, 38-Upload Scaleway S3, 51-Docker, 52-Déploiement.

## Initialisation de projet (cours 34)
### Workflow Git d'équipe (imposé)
- Branches : `main` (production) / `staging` (pré-production) / `dev` (intégration des features, branche de travail commune) / `feat/*` (une branche par fonctionnalité).
- Règles GitHub : protéger `main`, empêcher le merge sur `dev` sans 2 validations (review).

### Base de données
- Schéma strictement identique entre collègues (noms, types, relations).
- Utilisateur MySQL **dédié** à l'application, jamais `root`, droits limités au strict nécessaire.

### Checklist init backend (Express)
Arborescence MVC claire, variables d'environnement, fichiers sensibles dans `.gitignore`, connexion BDD, CORS configurés, linter+formatter, une route de test qui répond.

### Checklist init frontend (React)
Arborescence claire, variables d'environnement (**aucune URL d'API en dur**), `.gitignore`, linter+formatter, variables de style globales (couleurs/typo/espacements cohérents avec la charte).

### ESLint + Prettier (mis en place dès l'initialisation)
**Projet React** (Vite inclut déjà ESLint) :
```bash
npm install -D eslint eslint-plugin-react prettier eslint-config-prettier
```
**Projet Express** :
```bash
npm install -D prettier eslint-config-prettier
npm init @eslint/config@latest
```
⚠️ **Incohérence relevée entre deux cours** : le cours 34 (initialisation) montre une config ESLint Express en `sourceType: 'commonjs'`, alors que le cours 41 (JS moderne) préconise `"type": "module"` + `import`/`export` comme cible finale pour tout le code Express (voir skill `express-nodejs`). En cas de doute sur un projet réel, suivre le cours 41 (présenté explicitement comme la pratique professionnelle) et adapter `sourceType: 'module'` dans `eslint.config.js` plutôt que reproduire l'exemple `commonjs` du cours 34 tel quel.
`.prettierrc.json` commun aux deux projets :
```json
{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "es5", "printWidth": 80, "arrowParens": "avoid" }
```
Scripts `package.json` : `"lint": "eslint .", "lint:fix": "eslint . --fix", "format": "prettier --write \"...\""`.

## Internationalisation — i18n (cours 35)
- Ne jamais coder un texte en dur dans les composants → l'extraire dans des fichiers de traduction (un par langue).
- `npm install react-i18next i18next`.
- `src/i18n.js` :
  ```js
  import i18n from 'i18next';
  import { initReactI18next } from 'react-i18next';
  i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, fr: { translation: fr } },
    lng: 'fr', fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  });
  ```
  Importé dans `main.jsx` (`import "./i18n";`).
- Fichiers de traduction dans `src/locales/` (`en.json`, `fr.json`...), **mêmes clés**, valeurs traduites.
- Usage : `const { t } = useTranslation(); ... {t("title")}`.
- Changer de langue : `const { i18n } = useTranslation(); i18n.changeLanguage("en");` — tous les composants utilisant `t()` se re-render automatiquement.

## Envoi d'emails (cours 36)
Deux approches enseignées, dans cet ordre progressif :
1. **Nodemailer** (`npm install nodemailer`) — SMTP direct (ex. Gmail avec mot de passe d'application), simple, adapté aux tests/petits projets, mais pas de suivi des envois.
2. **Mailjet** (`npm install node-mailjet`) — service d'email transactionnel via API HTTP, **solution ciblée pour la production** (suivi/statistiques, meilleure délivrabilité).

Architecture identique dans les deux cas (cohérente avec le MVC Express) : `emailRouter` (`POST /emails/send`) → `emailController` (délègue) → `emailService` (logique d'envoi). Identifiants toujours dans `.env`.

```js
// emailService.js (Mailjet)
export const sendEmail = async ({ to, subject, text, html }) =>
  mailjet.post("send", { version: "v3.1" }).request({
    Messages: [{ From: { Email: process.env.MAILJET_SENDER, Name: "Mon App" }, To: [{ Email: to }], Subject: subject, TextPart: text, HTMLPart: html }],
  });
```
En pratique, l'envoi d'email s'intègre directement dans une feature existante (ex. `sendWelcomeEmail()` appelée depuis `authController` après inscription) plutôt que via une route dédiée systématique.

## Upload de fichiers (cours 38)
- Stockage **objet** (S3-compatible) retenu pour la production, plutôt que le disque local ou un BLOB en base.
- Flux : React (`<input type="file">` + `FormData`) → Express (**Multer**) → Scaleway (S3) → URL publique → enregistrement de l'URL en BDD (MySQL).

```jsx
// React
<input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
// à l'envoi : FormData, PAS de header Content-Type (le navigateur le gère)
const formData = new FormData();
formData.append("image", image);
fetch(url, { method: "POST", body: formData });
```
```js
// Express — routes/*.routes.js
router.post("/", upload.fields([{ name: "image", maxCount: 1 }]), create);
// upload.single("image") si un seul fichier
```
```js
// uploadService.js — nom de fichier TOUJOURS régénéré (jamais le nom original, sécurité + anti-collision)
const safeName = `${crypto.randomUUID()}.${ext}`;
await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: file.buffer, ContentType: file.mimetype, ACL: "public-read" }));
return `${endpoint}/${bucket}/${key}`;
```
`npm install multer @aws-sdk/client-s3` ; identifiants Scaleway dans `.env`.

## Docker (cours 51)
- Une **image** = modèle prêt à l'emploi (build via `Dockerfile` ou pull depuis Docker Hub). Un **conteneur** = instance en cours d'exécution d'une image. Un **volume** = stockage persistant (les données d'un conteneur sont perdues à sa suppression sans volume). Un **network** = interconnexion entre conteneurs.
- Une "app" dockerisée = un seul programme (soit le front, soit le back).
- Plusieurs apps liées (front + back + BDD) → **Docker Compose** (`docker-compose.yml`) orchestre la création des conteneurs/réseaux/volumes.
- Réutiliser les images existantes du Docker Hub, notamment pour les BDD.

```dockerfile
FROM node:ubuntu
WORKDIR /app
COPY package.json package.json
RUN npm i
COPY src src
COPY tsconfig.json tsconfig.json
CMD npm start
```
**Règle d'optimisation du cache imposée** : `package.json` + `npm i` doivent être les **premières couches**, avant de copier le code source — si seul le code change, le cache de `npm i` est réutilisé et le build est bien plus rapide.

## Déploiement (cours 52)
- Serveur = machine avec IP publique, allumée en continu, qui reçoit/répond aux requêtes HTTP.
- Nom de domaine (loué chez un registrar : OVH, Gandi...) relié à une IP via le **DNS**.
- **HTTPS obligatoire** en production : certificat SSL, généré gratuitement via **Let's Encrypt**.
- CI/CD : **Intégration Continue** (compilation, tests automatisés, rapports de qualité à chaque changement) + **Déploiement Continu** (préparation des artefacts + déploiement automatique après validation).
- Plateformes de déploiement managé (pas de serveur à configurer, adaptées aux projets petits/moyens) :
  - Applications : Render, Netlify (front statique), Vercel (React/Next.js), Railway, Clever Cloud (hébergeur français).
  - Bases de données managées : Aiven, PlanetScale.

## Checklist avant d'initialiser ou déployer un projet
- [ ] Workflow de branches Git défini (`main`/`staging`/`dev`/`feat/*`) avant d'écrire du code métier ?
- [ ] ESLint + Prettier configurés dès l'init, sur front et back ?
- [ ] Aucune URL d'API ni identifiant en dur — tout passe par `.env` ?
- [ ] Utilisateur BDD dédié, jamais `root` ?
- [ ] Fichiers uploadés renommés (UUID), jamais le nom original conservé tel quel ?
- [ ] `package.json`/`npm i` en première couche dans le `Dockerfile` ?
