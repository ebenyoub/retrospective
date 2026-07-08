# Rétrospective — Application Web Agile

## Présentation

Application web permettant à des équipes agiles de conduire des rétrospectives structurées. Les participants peuvent ajouter des cartes (positif, négatif, à améliorer), voter sur les sujets et discuter des actions à mener.

Projet réalisé dans le cadre du titre professionnel **Développeur Web et Web Mobile (DWWM)**.

## Stack technique

| Côté | Technologie |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Base de données | MySQL |
| Authentification | JWT + bcrypt |
| Emails | nodemailer |

## Fonctionnalités principales

- Inscription et connexion sécurisées
- Création et gestion de sessions de rétrospective
- Ajout de cartes par catégorie
- Système de votes
- Rôles : facilitateur et participant
- Interface temps réel (si implémentée)

## Lancer le projet

### Backend + base de données avec Docker

Depuis la racine du projet :

```bash
docker compose up --build
```

Le backend écoute sur `http://localhost:8000`.
MySQL est initialisé automatiquement avec `retrospective_backend/sql/schema.sql`
et conserve ses données dans le volume Docker `retrospective_mysql_data`.

Arrêter sans supprimer les données :

```bash
docker compose down
```

Réinitialiser volontairement la base :

```bash
docker compose down -v
docker compose up --build
```

### Backend sans Docker

```bash
cd retrospective_backend
npm install
npm run dev
```

### Frontend
```bash
cd retrospective_frontend
npm install
npm run dev
```

## Documentation

Toute la documentation est dans le dossier `docs/` :

- `docs/PROJECT_STATE.md` — état d'avancement
- `docs/CONVENTIONS.md` — conventions de code
- `docs/technical/` — documentation technique
- `docs/jury/` — documents pour la soutenance DWWM
- `docs/project/` — cahier des charges et fonctionnalités

## Titre professionnel visé

DWWM — Développeur Web et Web Mobile
Référentiel : voir `docs/jury/REFERENTIEL_DWWM.md`
