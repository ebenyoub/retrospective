-- Corrige un bug réel : passwordReset.model.ts interroge une table `password`
-- qui n'a jamais existé dans schema.sql (ni ailleurs). Le parcours "mot de
-- passe oublié" plantait donc systématiquement en 500 dès le premier appel
-- SQL, sur toute base initialisée avant ce correctif. À exécuter manuellement
-- sur une base de dev déjà initialisée (schema.sql ne se rejoue pas tout
-- seul, voir docker-compose.yml).
CREATE TABLE IF NOT EXISTS password (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(500) NOT NULL,
  expire_at DATETIME NOT NULL,
  INDEX idx_password_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
