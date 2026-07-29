-- Timer universel : le backend est la source de vérité du temps.
-- step_duration_minutes : durée par défaut des étapes, saisie par le
--   facilitateur à la création (modifiable en salle d'attente).
-- step_ends_at : échéance absolue de l'étape en cours (UTC), calculée par
--   le backend à chaque changement d'étape ou ajustement du facilitateur.
ALTER TABLE sessions
  ADD COLUMN step_duration_minutes INT NOT NULL DEFAULT 5 AFTER format_columns,
  ADD COLUMN step_ends_at DATETIME NULL AFTER step_duration_minutes;
