-- Table des cartes de rétrospective (colonnes start / stop / continue).
-- À exécuter manuellement sur la base existante (le projet n'a pas encore
-- de système de migration automatisé).
--
-- Note: pour une nouvelle base locale, ne pas exécuter ce fichier séparément.
-- Utiliser schema.sql, qui crée déjà retro_cards.

CREATE TABLE IF NOT EXISTS retro_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  author_id INT NOT NULL,
  column_type ENUM('start', 'stop', 'continue') NOT NULL,
  content VARCHAR(280) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_retro_cards_session ON retro_cards(session_id);
