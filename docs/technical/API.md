# Documentation API

Toutes les requêtes de l'API s'effectuent sur le serveur backend à l'adresse suivante :
* **Base URL** : `http://localhost:3000` (ou le port configuré dans le fichier `.env`).
* **Format des données** : `application/json` (requiert le header `Content-Type: application/json` pour les requêtes avec corps).

---

## Mécanismes d'Authentification

L'accès aux différentes ressources de l'API dépend du type de participant :

### 1. Utilisateurs Inscrits (Facilitateurs / Participants connectés)
Ils s'identifient via un jeton JWT classique passé dans les headers HTTP :
```http
Authorization: Bearer <JWT_token>
```

### 2. Participants Invités (sans compte utilisateur)
Ils s'identifient en transmettant à la fois leur identifiant numérique de participant et leur jeton d'invité éphémère dans les headers HTTP :
```http
x-participant-id: <id_participant>
x-guest-token: <guest_token>
```

---

## 1. Module Authentification (`/auth`)

### Inscription
Inscrit un nouveau compte facilitateur.
* **Route** : `POST /auth/signup`
* **Body** :
  ```json
  {
    "username": "MonPseudo",
    "email": "user@example.com",
    "password": "monmotdepasse"
  }
  ```
* **Réponse 201** :
  ```json
  {
    "success": true,
    "message": "Utilisateur créé avec succès.",
    "data": { "userId": 1 }
  }
  ```
* **Erreurs** :
  * `400` : Email ou nom d'utilisateur déjà pris, ou format invalide.

---

### Connexion
Connecte un utilisateur et renvoie son token JWT.
* **Route** : `POST /auth/login`
* **Body** :
  ```json
  {
    "email": "user@example.com",
    "password": "monmotdepasse"
  }
  ```
* **Réponse 200** :
  ```json
  {
    "success": true,
    "message": "Connexion réussie.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userId": 1,
      "username": "MonPseudo",
      "email": "user@example.com"
    }
  }
  ```
* **Erreurs** :
  * `401` : Identifiants incorrects.

---

### Profil Connecté
Récupère les informations du profil de l'utilisateur connecté.
* **Route** : `GET /auth/profile`
* **Headers requis** : `Authorization: Bearer <token>`
* **Réponse 200** :
  ```json
  {
    "userId": 1,
    "username": "MonPseudo",
    "email": "user@example.com"
  }
  ```

---

### Réinitialisation de Mot de Passe
Permet à un utilisateur ayant oublié son mot de passe de générer un code temporaire pour le modifier.
1. **Demande de réinitialisation** : `POST /auth/forgot`
   * Body : `{ "email": "user@example.com" }`
   * Réponse `200` : Code généré (renvoyé dans la console en environnement de dev).
2. **Vérification du code** : `POST /auth/verify-code`
   * Body : `{ "email": "user@example.com", "code": "123456" }`
   * Réponse `200` : Code validé.
3. **Mise à jour du mot de passe** : `PATCH /auth/reset-password`
   * Body : `{ "email": "user@example.com", "code": "123456", "password": "nouveauPassword" }`
   * Réponse `200` : Mot de passe réinitialisé.

---

### Suppression du Compte
Supprime définitivement le compte utilisateur et propage la suppression sur toutes ses sessions (via `ON DELETE CASCADE`).
* **Route** : `DELETE /auth/delete`
* **Headers requis** : `Authorization: Bearer <token>`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "message": "Compte utilisateur supprimé avec succès."
  }
  ```

---

## 2. Module Sessions (`/session`)

### Liste des Sessions
Liste l'historique des sessions créées par le facilitateur connecté.
* **Route** : `GET /session`
* **Headers requis** : `Authorization: Bearer <token>`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Rétrospectives Sprint 1",
        "code": "A1B2",
        "status": "open",
        "expiresAt": "2026-07-20T10:00:00Z",
        "createdAt": "2026-07-13T12:00:00Z",
        "role": "facilitator"
      }
    ]
  }
  ```

---

### Création de Session
Crée une nouvelle session de rétrospective. Clôture automatiquement les anciennes sessions ouvertes du propriétaire.
* **Route** : `POST /session/create-session`
* **Headers requis** : `Authorization: Bearer <token>`
* **Body** :
  ```json
  {
    "name": "Sprint 2 Retro"
  }
  ```
* **Réponse 201** :
  ```json
  {
    "success": true,
    "message": "Session créée.",
    "data": {
      "sessionId": 2,
      "code": "X9Y8"
    }
  }
  ```

---

### Récupération de Session
Récupère les détails structurels d'une session (accessible publiquement pour afficher le formulaire de pseudo).
* **Route** : `GET /session/:sessionId`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "name": "Sprint 2 Retro",
      "code": "X9Y8",
      "ownerId": 1,
      "status": "open",
      "step": "waiting",
      "formatName": "Start / Stop / Continue",
      "formatColumns": ["Start", "Stop", "Continue"],
      "createdAt": "2026-07-13T12:00:00.000Z",
      "expiresAt": "2026-07-14T12:00:00.000Z"
    }
  }
  ```

---

### Transition d'Étape
Bascule l'état d'avancement de la rétrospective (réservé au facilitateur).
* **Route** : `PATCH /session/:sessionId/step`
* **Headers requis** : `Authorization: Bearer <token>` (doit être le facilitateur)
* **Body** :
  ```json
  {
    "step": "writing"
  }
  ```
  *(Valeurs autorisées : `'waiting'`, `'writing'`, `'voting'`, `'results'`)*
* **Réponse 200** :
  ```json
  {
    "success": true,
    "message": "Étape mise à jour."
  }
  ```

---

### Modification du Format
Met à jour le nom du format et les colonnes de la rétrospective (réservé au facilitateur).
* **Route** : `PATCH /session/:sessionId/format`
* **Headers requis** : `Authorization: Bearer <token>`
* **Body** :
  ```json
  {
    "formatName": "Keep / Drop / Try",
    "formatColumns": ["Keep", "Drop", "Try"]
  }
  ```
* **Réponse 200** :
  ```json
  {
    "success": true,
    "message": "Format de la session mis à jour."
  }
  ```

---

## 3. Module Participants (`/session/:sessionId/participants`)

### Rejoindre par Code (Visiteur / Invité)
Vérifie qu'un code de session existe et qu'elle est ouverte, puis retourne ses détails pour permettre la saisie du pseudo.
* **Route** : `POST /session/join-guest`
* **Body** : `{ "code": "X9Y8" }`
* **Réponse 200** : Détails de la session.

---

### Rejoindre en tant que Soi (Utilisateur Connecté)
Enregistre un facilitateur ou un utilisateur connecté dans la liste des participants de la session en cours.
* **Route** : `POST /session/:sessionId/participants/self`
* **Headers requis** : `Authorization: Bearer <token>`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "data": { "id": 14, "role": "facilitator" }
  }
  ```

---

### Rejoindre en tant qu'Invité (Saisie du Pseudo)
Enregistre un visiteur anonyme dans la salle d'attente et lui génère un jeton temporaire d'invité.
* **Route** : `POST /session/:sessionId/participants/guest-join`
* **Body** :
  ```json
  {
    "displayName": "Sarah"
  }
  ```
* **Réponse 200** :
  ```json
  {
    "success": true,
    "data": {
      "id": 15,
      "guestToken": "tKn_93a17e..."
    }
  }
  ```

---

### Reconnexion d'un Invité
Restaurer la session de participation d'un invité après rafraîchissement de sa page.
* **Route** : `POST /session/:sessionId/participants/resume`
* **Body** : `{ "guestToken": "tKn_93a17e..." }`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "data": { "id": 15, "role": "participant" }
  }
  ```

---

### Quitter la Session
Retire un participant de la liste de la session (facilitateur ou invité).
* **Route** : `DELETE /session/:sessionId/participants/:participantId`
* **Headers (si connecté)** : `Authorization: Bearer <token>`
* **Body (si invité)** : `{ "guestToken": "tKn_93a17e..." }`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "message": "Vous avez quitté la session."
  }
  ```

---

## 4. Module Cartes et Votes (`/session/:sessionId/cards`)

### Lister les Cartes
Récupère les cartes d'une session. Durant l'étape `writing`, les cartes des autres participants sont masquées pour éviter les biais.
* **Route** : `GET /session/:sessionId/cards`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 4,
        "sessionId": 2,
        "authorId": 14,
        "authorName": "MonPseudo",
        "columnType": "start",
        "content": "Faire des daily plus courts",
        "createdAt": "2026-07-13T12:05:00Z",
        "votesCount": 2
      }
    ]
  }
  ```

---

### Créer une Carte
Ajoute une carte sur le tableau.
* **Route** : `POST /session/:sessionId/cards`
* **Headers / Tokens requis** : Authentification requis (JWT ou Invité)
* **Body** :
  ```json
  {
    "content": "Améliorer les revues de code",
    "columnType": "start"
  }
  ```
  *(Valeurs autorisées pour `columnType` : `'start'`, `'stop'`, `'continue'`)*
* **Réponse 201** :
  ```json
  {
    "success": true,
    "message": "Carte ajoutée.",
    "data": { "cardId": 4 }
  }
  ```

---

### Modifier une Carte
Met à jour le texte d'une de ses cartes (bloqué si l'utilisateur n'est pas l'auteur).
* **Route** : `PATCH /session/:sessionId/cards/:cardId`
* **Body** : `{ "content": "Texte modifié" }`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "message": "Carte modifiée."
  }
  ```

---

### Supprimer une Carte
Supprime une de ses cartes (bloqué si l'utilisateur n'est pas l'auteur).
* **Route** : `DELETE /session/:sessionId/cards/:cardId`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "message": "Carte supprimée."
  }
  ```

---

### Voter pour une Carte
Enregistre un vote pour une carte donnée (limité à 5 votes max par participant et par session).
* **Route** : `POST /session/:sessionId/cards/:cardId/vote`
* **Réponse 200** :
  ```json
  {
    "success": true,
    "message": "Vote enregistré."
  }
  ```
