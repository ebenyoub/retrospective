# État du Projet

> Mettre à jour ce fichier avant toute modification importante.

## Date de dernière mise à jour

2026-07-07

## État global

🟡 En cours — Authentification et sessions déjà codées côté backend/frontend (voir audit du 2026-07-07). Page d'accueil (Home) reconstruite depuis la maquette Figma. Boucle de travail (agents + tests + review) mise en place côté frontend.

## Fonctionnalités livrées

| Fonctionnalité | Statut | Date |
|---|---|---|
| Fondation documentaire | ✅ Livré | 2026-06-26 |
| Authentification (base) | ✅ Livré (code existant, audité) | 2026-07-07 |
| Gestion des sessions (créer/rejoindre par code) | ✅ Livré (code existant, audité) | 2026-07-07 |
| Page d'accueil (Home) | 🟡 Partiel — UI présentationnelle, pas encore branchée au backend | 2026-07-07 |
| Boucle agents/tests/review (frontend) | ✅ Livré | 2026-07-07 |
| Tableau rétrospective | ⬜ À faire | — |
| Cartes rétrospective | ⬜ À faire | — |
| Votes | ⬜ À faire | — |
| Rôles (facilitateur/participant) | ⬜ À faire | — |

## Fonctionnalités livrées

| Fonctionnalité | Statut | Date |
|---|---|---|
| Ajouter une carte (`POST /session/:sessionId/cards`) | ✅ Backend + formulaire frontend | 2026-07-07 |
| Lister les cartes (`GET /session/:sessionId/cards`) | ✅ Backend + affichage frontend | 2026-07-07 |
| Tableau de rétrospective — affichage 3 colonnes + ajout de carte (`SessionDashboard.tsx`) | 🟡 Lecture + écriture, pas de vote | 2026-07-07 |

## Ce qui est en cours

- Tableau de rétrospective : lecture ET ajout de cartes fonctionnels (backend + frontend, formulaire React Hook Form + Zod). Il manque le système de votes.
- Nouvelle convention de projet : tout formulaire doit utiliser React Hook Form + Zod (plus de validation maison pour les nouveaux formulaires).

## Prochaine étape

- Système de votes (backend puis frontend), dernière brique du cœur métier MVP avant les rôles facilitateur/participant.

## Preuves de validation (2026-07-07)

- Frontend : `npm run test` → 14 tests passés (11 précédents + 3 sur le formulaire d'ajout de carte) ; `npm run build` → succès
- Backend : non concerné par cette tâche (aucune modification) ; dernière exécution connue 19/19 passés

## Blocages / Risques

Aucun pour le moment.

## Notes

Ce fichier est la référence centrale de l'avancement du projet. Il doit rester à jour pour que le jury puisse voir la progression du travail.
