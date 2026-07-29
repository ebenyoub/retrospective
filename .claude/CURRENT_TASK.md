# Ticket actuel

**DEV-ENV-01 — Fiabiliser le hot reload backend Docker** (terminé, en attente de commit)

# Objectif

Refaire un correctif déjà validé une première fois le 2026-07-20 mais perdu (commit jamais mergé dans `dev`, dérive de pipeline agent) : `ts-node-dev` ne détectait pas toujours les modifications de fichiers sur bind mount Docker, redémarrage manuel fréquent en développement.

# Branche

`feature/DEV-ENV-01-hot-reload` (= `dev` + le correctif, pas encore commité).

# Contexte — revue des choses en attente (2026-07-29)

Deuxième des deux points retrouvés lors de la revue de `docs/backlog/BACKLOG_IDEAS.md`/historique demandée par l'utilisateur (le premier était `BUG-FORGOT-PASSWORD-01`, déjà commité/mergé, PR #40). Reste un troisième point non traité : flakiness E2E connue sur `e2e/session-voting.spec.ts`.

# Travail terminé

- Flag `--poll` ajouté au script `dev` de `retrospective_backend/package.json`.
- Vérifié en conditions réelles sur le conteneur Docker local (`retrospective-backend`) : après redémarrage du conteneur pour charger le nouveau script, `server.ts` édité deux fois sans jamais faire `docker restart` manuellement — logs `[INFO] Restarting: /app/server.ts has been modified` à chaque fois, serveur repassé sain ensuite.
- 329/329 tests backend (inchangé), `tsc --noEmit` propre.
- `docs/backlog/BACKLOG_IDEAS.md`, `docs/backlog/PRODUCT_BACKLOG.md`, `docs/PROJECT_STATE.md` mis à jour.

# Travail restant

- Commit unique pour ce correctif.
- Décider avec l'utilisateur si on traite aussi la flakiness `session-voting.spec.ts`, ou si on s'arrête là.

# Fichiers concernés

- `retrospective_backend/package.json`
- `docs/backlog/BACKLOG_IDEAS.md`
- `docs/backlog/PRODUCT_BACKLOG.md`
- `docs/PROJECT_STATE.md`

# Tests requis

`npx vitest run` (backend), `npx tsc --noEmit` (backend), vérification manuelle du hot reload contre le conteneur Docker réel (déjà faite). Au vert.

# Prochaine action unique

Committer, proposer une PR vers `dev`, puis demander à l'utilisateur s'il veut traiter la flakiness `session-voting.spec.ts` ou s'arrêter là.
