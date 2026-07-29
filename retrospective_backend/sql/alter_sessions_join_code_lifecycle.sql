-- Cycle de vie du code de session à 4 chiffres (SESSION-CODE-01)
-- Le code n'est plus un identifiant permanent : il ne sert qu'à rejoindre une
-- session ouverte, et est libéré (NULL) à la clôture.

-- Avant migration : vérifier qu'aucune valeur de `code` n'est dupliquée parmi
-- les sessions actuellement ouvertes (la contrainte UNIQUE ci-dessous
-- échouerait sinon). En conditions normales (générateur non collisionnant en
-- pratique jusqu'ici), aucun doublon n'est attendu.
-- SELECT code, COUNT(*) FROM sessions WHERE status = 'open' GROUP BY code HAVING COUNT(*) > 1;

ALTER TABLE sessions
  CHANGE COLUMN code join_code VARCHAR(4) NULL;

ALTER TABLE sessions
  ADD COLUMN closed_at DATETIME NULL AFTER expires_at;

-- Les sessions déjà closes n'ont plus de code valide : on le libère
-- immédiatement pour qu'il redevienne disponible.
UPDATE sessions SET join_code = NULL WHERE status = 'closed';

DROP INDEX idx_sessions_code ON sessions;
ALTER TABLE sessions
  ADD UNIQUE KEY unique_sessions_join_code (join_code);

-- Détection des sessions ouvertes abandonnées (ménage automatique, 30 jours
-- d'inactivité). Maintenu par MySQL à chaque écriture sur la ligne, aucune
-- requête applicative n'a besoin d'être modifiée pour l'alimenter.
ALTER TABLE sessions
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
