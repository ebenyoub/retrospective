-- Modification de la colonne 'step' de la table 'sessions' pour ajouter les étapes 'action' et 'summary'
ALTER TABLE sessions MODIFY COLUMN step ENUM('waiting', 'writing', 'voting', 'results', 'action', 'summary') NOT NULL DEFAULT 'waiting';

-- Création de la table 'session_actions' pour le plan d'action
CREATE TABLE IF NOT EXISTS session_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  description TEXT NOT NULL,
  owner VARCHAR(100) NOT NULL DEFAULT '?',
  deadline DATE NULL,
  priority ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
