import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { createSession } from '../controllers/create.controller';
import joinSession from '../controllers/join.controller';
import { createCard, getCards, updateCard, deleteCard } from '../controllers/card.controller';
import { listSessions } from '../controllers/list.controller';
import { voteForCard } from '../controllers/vote.controller';
import { getSession, updateSessionStep, updateSessionFormat } from '../controllers/step.controller';
import { guestJoin, guestJoinByCode, joinAsSelf, listParticipants, removeParticipant, resumeGuest } from '../controllers/participant.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import {
  createSessionSchema,
  joinSessionSchema,
  createCardSchema,
  updateCardSchema,
  updateSessionStepSchema,
  updateSessionFormatSchema
} from '../validators/session.validator';
import { guestJoinByCodeSchema, guestJoinSchema, leaveParticipantSchema, resumeGuestSchema } from '../validators/participant.validator';

const router = Router();

router.get('/', auth, asyncHandler(listSessions));
router.post('/create-session', auth, validate(createSessionSchema), asyncHandler(createSession));
router.post('/join', auth, validate(joinSessionSchema), asyncHandler(joinSession));
router.post('/join-guest', validate(guestJoinByCodeSchema), asyncHandler(guestJoinByCode));
// Pas de middleware `auth` : un participant invité (sans compte) doit pouvoir
// lire le nom, le code et le format de la session pour afficher la salle
// d'attente. Aucune donnée sensible n'est exposée ; les actions participant
// plus bas valident soit le JWT, soit le jeton invité temporaire.
router.get('/:sessionId', asyncHandler(getSession));
router.patch('/:sessionId/step', auth, validate(updateSessionStepSchema), asyncHandler(updateSessionStep));
router.patch('/:sessionId/format', auth, validate(updateSessionFormatSchema), asyncHandler(updateSessionFormat));

// Salle d'attente : liste et jointure publiques (le code à 4 chiffres reste la
// vraie barrière), un invité ne crée jamais de compte (pas de middleware `auth`).
router.get('/:sessionId/participants', asyncHandler(listParticipants));
router.post('/:sessionId/participants/self', auth, asyncHandler(joinAsSelf));
router.post('/:sessionId/participants/guest-join', validate(guestJoinSchema), asyncHandler(guestJoin));
router.post('/:sessionId/participants/resume', validate(resumeGuestSchema), asyncHandler(resumeGuest));
router.delete('/:sessionId/participants/:participantId', validate(leaveParticipantSchema), asyncHandler(removeParticipant));

router.post('/:sessionId/cards', validate(createCardSchema), asyncHandler(createCard));
router.get('/:sessionId/cards', asyncHandler(getCards));
router.patch('/:sessionId/cards/:cardId', validate(updateCardSchema), asyncHandler(updateCard));
router.delete('/:sessionId/cards/:cardId', asyncHandler(deleteCard));
router.post('/:sessionId/cards/:cardId/vote', asyncHandler(voteForCard));

export default router;
