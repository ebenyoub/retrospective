# Ticket actuel

**BUG-FORGOT-PASSWORD-01 — `/auth/forgot` renvoie systématiquement 500** (terminé, en attente de commit)

# Objectif

Corriger un bug réel et actif : le parcours "mot de passe oublié" plante systématiquement, retrouvé lors d'une revue des idées sauvegardées (`docs/backlog/BACKLOG_IDEAS.md`) et de l'historique du projet demandée par l'utilisateur.

# Branche

`feature/BUG-FORGOT-PASSWORD-01` (= `dev` + le correctif, pas encore commité).

# Contexte — revue des choses en attente (2026-07-29)

L'utilisateur a demandé de retrouver les idées sauvegardées et les points en attente. Trois trouvés :
1. **Ce bug** (le plus sérieux, traité immédiatement) — `/auth/forgot` casse en 500 sur toute base initialisée depuis `schema.sql`.
2. `DEV-ENV-01` (`BACKLOG_IDEAS.md`) — hot reload Docker, idée validée le 2026-07-20 mais orpheline d'un commit jamais mergé dans `dev`. Toujours "À valider" dans le fichier. Pas encore traité.
3. Flakiness E2E connue sur `e2e/session-voting.spec.ts` (non bloquante). Pas encore traitée.

# Travail terminé

- Diagnostic : `passwordReset.model.ts` interroge une table `password` absente de `schema.sql` depuis toujours — découvert le 2026-07-20 (`T-ARCHI-01`), jamais corrigé depuis (le ticket qui a suivi, `T-AUTH-FORGOT-BREVO-01`, n'a testé que le transport SMTP, pas contre une vraie base).
- Correctif : table `password` ajoutée à `schema.sql` (nouvelles installations) + script `alter_create_password.sql` (bases déjà initialisées, appliqué manuellement sur `retrospective-db` local).
- Vérifié en conditions réelles contre le backend Docker (pas seulement les tests, qui mockent `db.execute` et n'auraient rien détecté) : avant → `Table 'retrospective.password' doesn't exist` en logs ; après → insertion SQL réussie, `POST /auth/verify-code` renvoie une réponse métier propre (400) au lieu d'un 500.
- 329/329 tests backend (inchangé), `tsc --noEmit` propre.
- `docs/PROJECT_STATE.md` et `docs/backlog/PRODUCT_BACKLOG.md` mis à jour (`BUG-FORGOT-PASSWORD-01` ✅ Terminé).

# Travail restant

- Commit unique pour ce correctif.
- Décider si on traite aussi `DEV-ENV-01` et/ou la flakiness `session-voting.spec.ts` dans la foulée.

# Fichiers concernés

- `retrospective_backend/sql/schema.sql`
- `retrospective_backend/sql/alter_create_password.sql` (nouveau)
- `docs/PROJECT_STATE.md`
- `docs/backlog/PRODUCT_BACKLOG.md`

# Tests requis

`npx vitest run` (backend), `npx tsc --noEmit` (backend), vérification manuelle contre le backend Docker réel (déjà faite). Au vert.

# Prochaine action unique

Committer, proposer une PR vers `dev`, puis décider avec l'utilisateur de la suite (`DEV-ENV-01` ou flakiness E2E).
