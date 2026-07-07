# Base de Données

> À compléter avec le schéma réel après analyse du projet existant.

## Schéma cible (MVP)

```sql
-- Utilisateurs
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT NOW()
);

-- Sessions de rétrospective
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status ENUM('waiting', 'active', 'closed') DEFAULT 'waiting',
  facilitator_id INT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (facilitator_id) REFERENCES users(id)
);

-- Participants d'une session
CREATE TABLE session_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_participant (session_id, user_id)
);

-- Cartes de rétrospective
CREATE TABLE retro_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  column_type ENUM('good', 'problem', 'improve') NOT NULL,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME ON UPDATE NOW(),
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Votes
CREATE TABLE votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (card_id) REFERENCES retro_cards(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_vote (card_id, user_id)
);
```

## Relations

```
users (1) ──────── (N) sessions         [créateur = facilitateur]
users (N) ──────── (N) sessions         [via session_participants]
sessions (1) ───── (N) retro_cards
users (1) ──────── (N) retro_cards      [auteur]
retro_cards (N) ── (N) users            [via votes]
```

## Index recommandés

```sql
CREATE INDEX idx_sessions_facilitator ON sessions(facilitator_id);
CREATE INDEX idx_cards_session ON retro_cards(session_id);
CREATE INDEX idx_cards_user ON retro_cards(user_id);
CREATE INDEX idx_votes_card ON votes(card_id);
```

## Conventions

- Toutes les tables ont un `id` AUTO_INCREMENT PRIMARY KEY
- Toutes les tables ont un `created_at` DATETIME DEFAULT NOW()
- Les clés étrangères sont systématiquement indexées
- Les colonnes ENUM sont préférées aux chaînes libres pour les valeurs fixes
- Pas de données sensibles en clair (mots de passe hashés, pas de tokens en BDD)

## Migration

Scripts SQL dans `backend/src/database/migrations/` (à créer).
Format de nommage : `001_create_users.sql`, `002_create_sessions.sql`, etc.
