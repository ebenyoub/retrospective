-- Commentaires de carte : un participant peut commenter une carte, et
-- supprimer uniquement ses propres commentaires.
CREATE TABLE IF NOT EXISTS card_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  author_participant_id INT NOT NULL,
  content VARCHAR(280) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_card_comments_card
    FOREIGN KEY (card_id) REFERENCES retro_cards(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_card_comments_author_participant
    FOREIGN KEY (author_participant_id) REFERENCES session_participants(id)
    ON DELETE CASCADE,
  INDEX idx_card_comments_card (card_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
