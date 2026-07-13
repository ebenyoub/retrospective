-- Migration: format de rétrospective choisi par le facilitateur (preset ou personnalisé).
-- Note: pour une nouvelle base locale, ne pas exécuter ce fichier séparément.
-- Utiliser schema.sql, qui contient déjà ces colonnes.
ALTER TABLE sessions
  ADD COLUMN format_name VARCHAR(60) NOT NULL DEFAULT 'Start / Stop / Continue',
  ADD COLUMN format_columns JSON NOT NULL DEFAULT (JSON_ARRAY('Start', 'Stop', 'Continue'));
