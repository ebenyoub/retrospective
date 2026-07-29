# Backlog d'idées

Ce document contient les fonctionnalités, User Stories et améliorations proposées pendant le développement mais non encore validées.

Seules les tâches validées par le Product Owner sont autorisées dans PRODUCT_BACKLOG.md.

## À valider

Chaque nouvelle proposition devra contenir :

- Identifiant provisoire
- Titre
- Origine (analyse, revue, Figma, utilisateur...)
- Description
- Motivation
- Dépendances éventuelles
- Impact estimé (S / M / L)
- Statut : À valider

### DEV-ENV-01 — Fiabiliser le hot reload backend Docker

- Identifiant provisoire : DEV-ENV-01
- Titre : Fiabiliser le hot reload backend Docker
- Origine : Découvert pendant TODO-FORMAT-01
- Description : Le backend Docker nécessite parfois un redémarrage manuel (`docker restart retrospective-backend`) car `ts-node-dev` ne détecte pas toujours les modifications des fichiers montés.
- Motivation : Rendre le hot reload fiable en environnement Docker pour éviter de tester un ancien état du backend pendant le développement.
- Dépendances éventuelles : Vérifier la configuration de `ts-node-dev`, envisager le mode polling si nécessaire, comparer avec `tsx watch` ou `nodemon` si plus adapté.
- Impact estimé : S
- Statut : ✅ Terminé (2026-07-29) — flag `--poll` ajouté au script `dev` (`retrospective_backend/package.json`). Une première tentative avait été validée le 2026-07-20 mais son commit s'est perdu dans une dérive de pipeline agent, jamais mergée dans `dev` ; retrouvée et refaite proprement. Vérifié en conditions réelles sur le conteneur Docker local : édition de `server.ts` → `[INFO] Restarting: /app/server.ts has been modified` en logs, sans redémarrage manuel, à deux reprises.
