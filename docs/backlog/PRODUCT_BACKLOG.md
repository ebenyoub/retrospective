# Product Backlog

> Liste priorisée de toutes les fonctionnalités à développer.
> Ordre = priorité. On commence par le haut.

## Légende

| Statut | Signification |
|---|---|
| ⬜ À faire | Pas encore démarré |
| 🔵 En cours | En développement |
| ✅ Terminé | Livré et testé |
| ❌ Annulé | Hors scope |

---

## Priorité 1 — Fondation (CCP1 + CCP2)

| ID | Fonctionnalité | Complexité | Statut | US liée |
|---|---|---|---|---|
| B01 | Inscription utilisateur | Faible | ✅ | US-01 |
| B02 | Connexion + JWT | Faible | ✅ | US-02 |
| B03 | Déconnexion | Très faible | ✅ | US-03 |
| B04 | Middleware auth (routes protégées) | Faible | ✅ | — |
| B05 | Schéma BDD initial (users, sessions, cards, votes) | Moyenne | ✅ | — |

## Priorité 2 — Sessions (CCP1 + CCP2)

| ID | Fonctionnalité | Complexité | Statut | US liée |
|---|---|---|---|---|
| B06 | Créer une session | Faible | ✅ | US-04 |
| B07 | Lister ses sessions | Faible | ✅ | US-05 |
| B08 | Rejoindre une session | Moyenne | ✅ | US-06 |
| B09 | Vue détail d'une session | Faible | ✅ | — |

## Priorité 3 — Rétrospective (CCP1 + CCP2)

| ID | Fonctionnalité | Complexité | Statut | US liée |
|---|---|---|---|---|
| B10 | Ajouter une carte | Faible | ✅ | US-07 |
| B11 | Modifier sa carte | Faible | ✅ | US-07 |
| B12 | Supprimer sa carte | Très faible | ✅ | US-07 |
| B13 | Voir les cartes des autres | Faible | ✅ | US-07 |

## Priorité 4 — Votes (CCP1 + CCP2)

| ID | Fonctionnalité | Complexité | Statut | US liée |
|---|---|---|---|---|
| B14 | Voter pour une carte | Moyenne | ✅ | US-08 |
| B15 | Vue résultats triés par votes | Faible | ✅ | US-09 |

## Priorité 5 — Polish MVP

| ID | Fonctionnalité | Complexité | Statut |
|---|---|---|---|
| B16 | Responsive design basique | Faible | ✅ |
| B17 | Messages d'erreur cohérents | Très faible | ✅ |
| B18 | États de chargement (loading) | Très faible | ✅ |

## Hors scope V1

| ID | Fonctionnalité | Raison |
|---|---|---|
| B19 | Invitations par email | Complexité nodemailer + UX |
| B20 | Temps réel (WebSocket) | Complexité technique non justifiée pour MVP |
| B21 | Export résultats | Hors périmètre jury |
