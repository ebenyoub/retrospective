-- Ajout de la colonne name à la table sessions.
-- À exécuter manuellement sur la base existante (le projet n'a pas de système de migration automatisé).
--
-- Note: pour une nouvelle base locale, ne pas exécuter ce fichier séparément.
-- Utiliser schema.sql, qui contient déjà la colonne sessions.name.

ALTER TABLE sessions ADD COLUMN name VARCHAR(255) NOT NULL AFTER id;
