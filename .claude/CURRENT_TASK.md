# Ticket actuel

**CI-E2E-01 — Ajouter les tests E2E au CI GitHub Actions** (terminé, en attente de commit)

# Objectif

Suite directe de `E2E-VOTING-01` : la régression `US-17`/hostname (18 tests E2E sur 26 cassés) était restée invisible plusieurs jours faute de couverture CI. Recommandation soumise à l'utilisateur et acceptée.

# Branche

`feature/CI-E2E-01-playwright` (= `dev` + le nouveau job CI, pas encore commité).

# Travail terminé

- Nouveau job `e2e` dans `.github/workflows/ci.yml` : `npm install`, `npx playwright install --with-deps chromium`, `npx playwright test`.
- Vérifié en conditions réelles qu'aucun service backend/DB n'est nécessaire : conteneurs `retrospective-backend`/`retrospective-db` arrêtés en local, suite E2E rejouée (26/26 toujours au vert) — chaque spec moque intégralement ses appels API.
- Rapport HTML Playwright envoyé en artefact CI (7 jours) uniquement en cas d'échec.
- `docs/PROJECT_STATE.md` mis à jour.

# Travail restant

- Commit unique, PR vers `dev` — **vérifier que le nouveau job `e2e` tourne réellement au vert dans le vrai CI GitHub Actions** avant de merger (pas seulement testé en local).

# Fichiers concernés

- `.github/workflows/ci.yml`
- `docs/PROJECT_STATE.md`

# Tests requis

`npx playwright test` en local (déjà fait, 26/26). Le vrai test de ce ticket est l'exécution réelle du nouveau job dans GitHub Actions.

# Prochaine action unique

Committer, ouvrir la PR, surveiller que le nouveau job `e2e` passe réellement en CI (pas juste les jobs `frontend`/`backend` existants), puis merger.
