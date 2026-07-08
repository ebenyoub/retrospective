# Base de Données

Le schéma local de référence est versionné dans
`retrospective_backend/sql/schema.sql`.

Avec Docker Compose, ce fichier est monté dans `/docker-entrypoint-initdb.d` et
MySQL l'exécute automatiquement lors de la création initiale du volume
`retrospective_mysql_data`.

## Schéma actuel exploité par le backend

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  hash_password VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_users_username (username)
);

CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(4) NOT NULL,
  owner_id INT NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  step ENUM('waiting', 'writing', 'voting', 'results') NOT NULL DEFAULT 'waiting',
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS session_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  UNIQUE KEY unique_session_user (user_id, session_id)
);

CREATE TABLE IF NOT EXISTS retro_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  author_id INT NOT NULL,
  column_type ENUM('start', 'stop', 'continue') NOT NULL,
  content VARCHAR(280) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES retro_cards(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_vote (card_id, user_id)
);
```

## Relations

```
users (1) ──────── (N) sessions         [créateur = facilitateur]
users (N) ──────── (N) sessions         [via session_user]
sessions (1) ───── (N) retro_cards
users (1) ──────── (N) retro_cards      [auteur]
retro_cards (N) ── (N) users            [via votes]
```

## Index recommandés

```sql
CREATE INDEX idx_sessions_owner ON sessions(owner_id);
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_session_user_session ON session_user(session_id);
CREATE INDEX idx_retro_cards_session ON retro_cards(session_id);
CREATE INDEX idx_retro_cards_author ON retro_cards(author_id);
CREATE INDEX idx_votes_card ON votes(card_id);
CREATE INDEX idx_votes_user ON votes(user_id);
```

## Conventions

- Toutes les tables ont un `id` AUTO_INCREMENT PRIMARY KEY
- Toutes les tables ont un `created_at` DATETIME DEFAULT NOW()
- Les clés étrangères sont systématiquement indexées
- Les colonnes ENUM sont préférées aux chaînes libres pour les valeurs fixes
- Pas de données sensibles en clair (mots de passe hashés, pas de tokens en BDD)

## Fichiers SQL

- `retrospective_backend/sql/schema.sql` : schéma initial complet pour les
  nouvelles bases locales, utilisé par Docker.
- `retrospective_backend/sql/alter_sessions_add_name.sql` : migration legacy
  pour une ancienne base qui possède déjà `sessions`.
- `retrospective_backend/sql/alter_sessions_add_step.sql` : migration legacy
  pour une ancienne base qui possède déjà `sessions`.
- `retrospective_backend/sql/create_retro_cards.sql` : migration legacy pour
  ajouter les cartes à une base existante.
- `retrospective_backend/sql/create_votes.sql` : migration legacy pour ajouter
  les votes à une base existante.

Ne pas exécuter les migrations legacy sur une base créée avec `schema.sql`,
sinon les colonnes/tables existent déjà.

## Docker local

Depuis la racine du projet :

```bash
docker compose up --build
```

Le backend écoute sur `http://localhost:8000`.
MySQL est exposé sur le port hôte `3308` et utilise un volume persistant.

Pour arrêter sans supprimer les données :

```bash
docker compose down
```

Pour réinitialiser volontairement la base locale et rejouer `schema.sql` :

```bash
docker compose down -v
docker compose up --build
```
