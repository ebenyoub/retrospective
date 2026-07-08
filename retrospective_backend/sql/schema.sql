-- Initial local schema for the Retrospective backend.
-- This file is mounted in MySQL's /docker-entrypoint-initdb.d directory by
-- docker-compose.yml and is executed automatically only when the database
-- volume is created for the first time.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  hash_password VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_users_username (username),
  UNIQUE KEY unique_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(4) NOT NULL,
  owner_id INT NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  step ENUM('waiting', 'writing', 'voting', 'results') NOT NULL DEFAULT 'waiting',
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_owner
    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_sessions_owner (owner_id),
  INDEX idx_sessions_code (code),
  INDEX idx_sessions_status_expires (status, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS retro_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  author_id INT NOT NULL,
  column_type ENUM('start', 'stop', 'continue') NOT NULL,
  content VARCHAR(280) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_retro_cards_session
    FOREIGN KEY (session_id) REFERENCES sessions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_retro_cards_author
    FOREIGN KEY (author_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_retro_cards_session (session_id),
  INDEX idx_retro_cards_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_votes_card
    FOREIGN KEY (card_id) REFERENCES retro_cards(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_votes_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  UNIQUE KEY unique_vote (card_id, user_id),
  INDEX idx_votes_card (card_id),
  INDEX idx_votes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
