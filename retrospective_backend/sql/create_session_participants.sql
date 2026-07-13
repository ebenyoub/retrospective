-- Migration: table de présence de la salle d'attente (source de vérité des participants).
-- Note: pour une nouvelle base locale, ne pas exécuter ce fichier séparément.
-- Utiliser schema.sql, qui contient déjà cette table.
--
-- Un participant invité n'a pas de compte : user_id est NULL et guest_token
-- (secret connu uniquement de son navigateur) l'identifie à la place.
-- Le facilitateur et les participants authentifiés ont user_id renseigné et
-- guest_token NULL. MySQL autorise plusieurs NULL dans un index UNIQUE, donc
-- ces deux populations ne se bloquent jamais mutuellement.
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
