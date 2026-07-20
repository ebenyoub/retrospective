-- T-CLEANUP-01 : nettoyage des invités de test en base de développement
-- ------------------------------------------------------------------
-- Script MANUEL, à exécuter à la main sur la base de DEV uniquement.
-- Ne jamais exécuter sur une base de production.
-- Ce fichier n'est PAS monté dans docker-entrypoint-initdb.d (voir
-- docker-compose.yml, seul schema.sql y est référencé) : aucun risque
-- d'exécution automatique au démarrage du conteneur.
--
-- Critères de suppression (invités = session_participants.guest_token
-- IS NOT NULL) :
--   1. Invités appartenant à une session déjà close (sessions.status =
--      'closed') : une session close est terminée et en lecture seule
--      (US-14), ses invités n'ont plus d'utilité opérationnelle en base
--      de dev.
--   2. Invités de la session id 71 ("Bobo") : burst de 51 participants
--      "InviteNN" créés le 2026-07-20 par le script de test de charge
--      (US-15), sans rapport avec une utilisation réelle du produit.
--      L'id 71 est spécifique à l'état actuel de cette base de dev, ce
--      n'est pas une règle générale réutilisable telle quelle.
--
-- Effet de cascade (ON DELETE CASCADE défini dans schema.sql) :
-- supprimer un participant supprime aussi ses cartes (retro_cards), ses
-- votes, ses commentaires (card_comments) et ses messages
-- (session_messages) liés à cet id.
--
-- Usage : exécuter les 3 blocs dans l'ordre, en vérifiant le résultat du
-- SELECT de prévisualisation avant de lancer les DELETE.

-- 1. Prévisualisation : invités qui seront supprimés
SELECT sp.id, sp.session_id, s.name AS session_name, s.status, sp.display_name, sp.joined_at
FROM session_participants sp
JOIN sessions s ON s.id = sp.session_id
WHERE sp.guest_token IS NOT NULL
  AND (s.status = 'closed' OR sp.session_id = 71)
ORDER BY sp.session_id, sp.joined_at;

-- 2. Suppression

-- 2a. Invités des sessions closes
DELETE sp FROM session_participants sp
JOIN sessions s ON s.id = sp.session_id
WHERE sp.guest_token IS NOT NULL
  AND s.status = 'closed';

-- 2b. Invités du burst de test de charge (session "Bobo", id 71)
DELETE FROM session_participants
WHERE guest_token IS NOT NULL
  AND session_id = 71;

-- 3. Vérification finale : doit renvoyer 0 ligne
SELECT sp.id, sp.session_id, s.name AS session_name, s.status, sp.display_name, sp.joined_at
FROM session_participants sp
JOIN sessions s ON s.id = sp.session_id
WHERE sp.guest_token IS NOT NULL
  AND (s.status = 'closed' OR sp.session_id = 71);
