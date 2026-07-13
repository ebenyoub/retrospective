# Base de Données

Le schéma local de référence est versionné dans [schema.sql](file:///Users/ebenyoub/Developer/retrospective/retrospective_backend/sql/schema.sql).

Avec Docker Compose, ce fichier est monté dans `/docker-entrypoint-initdb.d` et MySQL l'exécute automatiquement lors de la création initiale du volume `retrospective_mysql_data`.

---

## Schéma Physique de Référence (MySQL)

### 1. Table `users`
Stocke les comptes des utilisateurs inscrits (facilitateurs).
```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  hash_password VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_users_username (username),
  UNIQUE KEY unique_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Table `sessions`
Stocke les réunions de rétrospective créées par les facilitateurs.
```sql
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(4) NOT NULL,
  owner_id INT NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  step ENUM('waiting', 'writing', 'voting', 'results') NOT NULL DEFAULT 'waiting',
  format_name VARCHAR(60) NOT NULL DEFAULT 'Start / Stop / Continue',
  format_columns JSON NOT NULL DEFAULT (JSON_ARRAY('Start', 'Stop', 'Continue')),
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_owner
    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_sessions_owner (owner_id),
  INDEX idx_sessions_code (code),
  INDEX idx_sessions_status_expires (status, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Table `session_user`
Table d'association legacy stockant l'historique d'appartenance des utilisateurs inscrits à des sessions.
```sql
CREATE TABLE IF NOT EXISTS session_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_session_user_session
    FOREIGN KEY (session_id) REFERENCES sessions(id)
    ON DELETE CASCADE,
  UNIQUE KEY unique_session_user (user_id, session_id),
  INDEX idx_session_user_session (session_id),
  INDEX idx_session_user_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Table `session_participants`
**Source de vérité de la salle d'attente**. Elle unifie la représentation des participants inscrits et des invités (visiteurs sans compte) connectés à une session en cours.
```sql
CREATE TABLE IF NOT EXISTS session_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NULL,
  guest_token VARCHAR(64) NULL,
  display_name VARCHAR(60) NOT NULL,
  role ENUM('facilitator', 'participant') NOT NULL DEFAULT 'participant',
  status ENUM('online', 'offline') NOT NULL DEFAULT 'online',
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_participants_session
    FOREIGN KEY (session_id) REFERENCES sessions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_session_participants_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  UNIQUE KEY unique_session_participant_user (session_id, user_id),
  UNIQUE KEY unique_session_participant_guest (session_id, guest_token),
  UNIQUE KEY unique_session_participant_name (session_id, display_name),
  INDEX idx_session_participants_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. Table `retro_cards`
Stocke les cartes (remarques) ajoutées par les participants ou le facilitateur lors de la rétrospective.
```sql
CREATE TABLE IF NOT EXISTS retro_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  author_participant_id INT NOT NULL,
  column_type ENUM('start', 'stop', 'continue') NOT NULL,
  content VARCHAR(280) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_retro_cards_session
    FOREIGN KEY (session_id) REFERENCES sessions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_retro_cards_author_participant
    FOREIGN KEY (author_participant_id) REFERENCES session_participants(id)
    ON DELETE CASCADE,
  INDEX idx_retro_cards_session (session_id),
  INDEX idx_retro_cards_author_participant (author_participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6. Table `votes`
Enregistre les votes des participants sur les cartes. Chaque participant a une limite de 5 votes par session.
```sql
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  participant_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_votes_card
    FOREIGN KEY (card_id) REFERENCES retro_cards(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_votes_participant
    FOREIGN KEY (participant_id) REFERENCES session_participants(id)
    ON DELETE CASCADE,
  UNIQUE KEY unique_vote (card_id, participant_id),
  INDEX idx_votes_card (card_id),
  INDEX idx_votes_participant (participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Modèle Conceptuel et Relations

```
users (1) ───────────────── (N) sessions             [Créateur / Facilitateur]
users (1) ───────────────── (N) session_participants  [Optionnel, si connecté]
sessions (1) ────────────── (N) session_participants  [Salle d'attente]
session_participants (1) ── (N) retro_cards           [Auteur de la carte]
retro_cards (1) ─────────── (N) votes                 [Cible du vote]
session_participants (1) ── (N) votes                 [Émetteur du vote]
```

* **Cascade de suppression (`ON DELETE CASCADE`)** : La suppression d'une session ou d'un utilisateur propage la suppression de ses dépendances (participations, cartes, votes) afin de maintenir l'intégrité référentielle en BDD.

---

## Conventions et Règles de Gestion
- **Identifiants uniques** : Toutes les tables exploitent une clé primaire numérique auto-incrémentée (`id`).
- **Dates de traçabilité** : Chaque enregistrement possède un champ `created_at` typé `DATETIME` qui capture automatiquement l'instant de création (`DEFAULT CURRENT_TIMESTAMP`).
- **Type ENUM** : Préféré pour limiter les valeurs de colonnes à des listes fermées (`step`, `status`, `role`, `column_type`).
- **Isolation des invités** : Les invités (`guest_token`) ne possèdent aucun enregistrement dans la table `users`. Ils sont suivis de manière éphémère uniquement au travers de la table `session_participants`.
- **Indexations systématiques** : Toutes les clés étrangères ainsi que les clés de recherche récurrentes (comme le `code` de session à 4 chiffres) possèdent des index pour optimiser les performances de requêtage.

---

## Administration et Docker Local

### Commandes utiles

* Démarrer la base de données et l'application locale :
  ```bash
  docker compose up --build
  ```
* Arrêter le service docker :
  ```bash
  docker compose down
  ```
* Réinitialiser complètement le volume de données et rejouer le schéma initial :
  ```bash
  docker compose down -v
  docker compose up --build
  ```
