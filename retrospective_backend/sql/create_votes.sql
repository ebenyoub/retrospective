-- Table des votes sur les cartes de rétrospective.
-- À exécuter manuellement sur la base existante (le projet n'a pas encore
-- de système de migration automatisé).
--
-- Note: pour une nouvelle base locale, ne pas exécuter ce fichier séparément.
-- Utiliser schema.sql, qui crée déjà votes.

CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  participant_id INT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (card_id) REFERENCES retro_cards(id),
  FOREIGN KEY (participant_id) REFERENCES session_participants(id),
  UNIQUE KEY unique_vote (card_id, participant_id)
);

CREATE INDEX idx_votes_card ON votes(card_id);
CREATE INDEX idx_votes_participant ON votes(participant_id);
