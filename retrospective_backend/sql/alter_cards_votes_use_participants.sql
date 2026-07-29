-- Migration pour une base existante : les cartes et votes sont maintenant liés
-- à session_participants.id, ce qui permet aux invités sans compte de participer.
--
-- Les anciennes colonnes author_id/user_id pointaient vers users.id. Avant de
-- remplacer ces colonnes, on crée les participants authentifiés manquants pour
-- conserver les cartes et votes déjà présents.

INSERT IGNORE INTO session_participants (
  session_id,
  user_id,
  guest_token,
  display_name,
  role,
  status,
  last_seen_at
)
SELECT DISTINCT
  rc.session_id,
  u.id,
  NULL,
  u.username,
  IF(s.owner_id = u.id, 'facilitator', 'participant'),
  'offline',
  NOW()
FROM retro_cards rc
INNER JOIN users u ON u.id = rc.author_id
INNER JOIN sessions s ON s.id = rc.session_id;

INSERT IGNORE INTO session_participants (
  session_id,
  user_id,
  guest_token,
  display_name,
  role,
  status,
  last_seen_at
)
SELECT DISTINCT
  rc.session_id,
  u.id,
  NULL,
  u.username,
  IF(s.owner_id = u.id, 'facilitator', 'participant'),
  'offline',
  NOW()
FROM votes v
INNER JOIN retro_cards rc ON rc.id = v.card_id
INNER JOIN users u ON u.id = v.user_id
INNER JOIN sessions s ON s.id = rc.session_id;

ALTER TABLE retro_cards
  DROP FOREIGN KEY fk_retro_cards_author,
  ADD COLUMN author_participant_id INT NULL AFTER author_id;

UPDATE retro_cards rc
INNER JOIN session_participants sp
  ON sp.session_id = rc.session_id
  AND sp.user_id = rc.author_id
SET rc.author_participant_id = sp.id;

ALTER TABLE retro_cards
  MODIFY author_participant_id INT NOT NULL,
  DROP INDEX idx_retro_cards_author,
  DROP COLUMN author_id,
  ADD CONSTRAINT fk_retro_cards_author_participant
    FOREIGN KEY (author_participant_id) REFERENCES session_participants(id)
    ON DELETE CASCADE,
  ADD INDEX idx_retro_cards_author_participant (author_participant_id);

ALTER TABLE votes
  DROP FOREIGN KEY fk_votes_user,
  ADD COLUMN participant_id INT NULL AFTER user_id;

UPDATE votes v
INNER JOIN retro_cards rc ON rc.id = v.card_id
INNER JOIN session_participants sp
  ON sp.session_id = rc.session_id
  AND sp.user_id = v.user_id
SET v.participant_id = sp.id;

ALTER TABLE votes
  MODIFY participant_id INT NOT NULL,
  DROP INDEX unique_vote,
  DROP INDEX idx_votes_user,
  DROP COLUMN user_id,
  ADD CONSTRAINT fk_votes_participant
    FOREIGN KEY (participant_id) REFERENCES session_participants(id)
    ON DELETE CASCADE,
  ADD UNIQUE KEY unique_vote (card_id, participant_id),
  ADD INDEX idx_votes_participant (participant_id);
