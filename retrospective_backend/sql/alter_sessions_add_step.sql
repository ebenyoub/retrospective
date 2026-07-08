-- Migration: add step column to sessions table to track retrospective workflow stages
-- Note: pour une nouvelle base locale, ne pas exécuter ce fichier séparément.
-- Utiliser schema.sql, qui contient déjà la colonne sessions.step.
ALTER TABLE sessions ADD COLUMN step ENUM('waiting', 'writing', 'voting', 'results') NOT NULL DEFAULT 'waiting';
