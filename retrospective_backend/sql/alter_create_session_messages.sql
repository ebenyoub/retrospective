-- Discussion de session : un participant peut envoyer des messages de discussion.
CREATE TABLE IF NOT EXISTS session_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  author_participant_id INT NOT NULL,
  content VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_messages_session
    FOREIGN KEY (session_id) REFERENCES sessions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_session_messages_author_participant
    FOREIGN KEY (author_participant_id) REFERENCES session_participants(id)
    ON DELETE CASCADE,
  INDEX idx_session_messages_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
