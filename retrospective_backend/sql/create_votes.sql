-- Table des votes sur les cartes de rétrospective.
-- À exécuter manuellement sur la base existante (le projet n'a pas encore
-- de système de migration automatisé).

CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (card_id) REFERENCES retro_cards(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_vote (card_id, user_id)
);

CREATE INDEX idx_votes_card ON votes(card_id);
