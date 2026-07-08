# Changelog

Toutes les modifications notables du projet sont documentées ici.
Format : `## [version ou date] — Description`

---

## [2026-07-08] — Suppression de sa propre carte

### Ajouté
- Bouton "Supprimer" sur les cartes de rétrospective, visible uniquement pour l'auteur connecté.
- Appel frontend `DELETE /session/:sessionId/cards/:cardId` avec rafraîchissement des cartes après succès.
- Toast d'erreur en cas de refus backend ou d'erreur réseau.
- Tests frontend couvrant l'affichage conditionnel, la suppression réussie et l'erreur de suppression.

### Vérifié
- Frontend : `npm run test` → 26/26, `npm run build` OK, `npm run lint` OK.
- Backend : `npm run test` → 58/58, `npx tsc --noEmit` OK.

---

## [2026-06-26] — Fondation documentaire

### Ajouté
- Structure complète de documentation `docs/`
- Agents IA spécialisés dans `.claude/agents/`
- Skills par domaine dans `.claude/skills/`
- Fichier `CLAUDE.md` avec les règles du projet
- `docs/PROJECT_STATE.md` pour suivre l'avancement
- `docs/CONVENTIONS.md` avec les conventions de code
- `docs/jury/` avec les documents pour la soutenance DWWM
- `docs/technical/` avec la documentation technique à compléter
- `docs/backlog/` pour la gestion des fonctionnalités

### Notes
Fondation uniquement — aucun code applicatif modifié.

---

## À venir

Les prochaines entrées seront ajoutées au fur et à mesure des livraisons.
