# Documentation API

> Base URL : `http://localhost:3000/api` (dev)

## Authentification

Les routes protégées nécessitent un header :
```
Authorization: Bearer <token>
```

---

## Auth

### POST /api/auth/register
Inscription d'un nouvel utilisateur.

**Body**
```json
{
  "email": "user@example.com",
  "password": "monmotdepasse",
  "username": "MonPseudo"
}
```

**Réponses**
- `201` — Utilisateur créé
- `400` — Données invalides (email déjà utilisé, mot de passe trop court)
- `500` — Erreur serveur

---

### POST /api/auth/login
Connexion et obtention du token JWT.

**Body**
```json
{
  "email": "user@example.com",
  "password": "monmotdepasse"
}
```

**Réponse 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "MonPseudo"
  }
}
```

**Réponses d'erreur**
- `400` — Données invalides
- `401` — Identifiants incorrects
- `500` — Erreur serveur

---

## Sessions

> Routes protégées — token requis.

### GET /api/sessions
Liste des sessions de l'utilisateur connecté.

**Réponse 200**
```json
[
  {
    "id": 1,
    "name": "Sprint 5 Retro",
    "status": "active",
    "created_at": "2026-06-26T10:00:00.000Z",
    "role": "facilitator"
  }
]
```

---

### POST /api/sessions
Créer une nouvelle session.

**Body**
```json
{
  "name": "Sprint 6 Retro"
}
```

**Réponse 201**
```json
{
  "message": "Session créée",
  "id": 2
}
```

---

### GET /api/sessions/:id
Détail d'une session avec ses cartes.

**Réponse 200**
```json
{
  "id": 1,
  "name": "Sprint 5 Retro",
  "status": "active",
  "cards": []
}
```

**Réponses d'erreur**
- `403` — Accès refusé (non participant)
- `404` — Session introuvable

---

## Cartes

> Routes protégées — token requis.

### POST /api/sessions/:sessionId/cards
Ajouter une carte dans une session.

**Body**
```json
{
  "content": "Le daily standup était trop long",
  "column": "problem"
}
```
Colonnes possibles : `good`, `problem`, `improve`

**Réponse 201**
```json
{
  "message": "Carte ajoutée",
  "id": 10
}
```

---

### DELETE /api/cards/:id
Supprimer sa propre carte.

**Réponse 200**
```json
{
  "message": "Carte supprimée"
}
```

**Réponses d'erreur**
- `403` — L'utilisateur n'est pas l'auteur de la carte
- `404` — Carte introuvable

---

### PATCH /session/:sessionId/cards/:cardId
Modifier sa propre carte.

**Body**
```json
{
  "content": "Contenu modifié"
}
```

**Réponse 200**
```json
{
  "success": true,
  "message": "Carte modifiée."
}
```

**Réponses d'erreur**
- `400` — Contenu vide
- `403` — L'utilisateur n'est pas l'auteur de la carte
- `404` — Carte introuvable

---

## Votes

> Routes protégées — token requis.

### POST /api/cards/:id/vote
Voter pour une carte.

**Réponse 200**
```json
{
  "message": "Vote enregistré"
}
```

**Réponses d'erreur**
- `400` — Vote déjà existant ou limite atteinte
- `404` — Carte introuvable

---

> Ce document est à compléter au fur et à mesure du développement des routes.
