import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { createSession } from '../controllers/create.controller';
import joinSession from '../controllers/join.controller';
import { createCard, getCards, updateCard, deleteCard } from '../controllers/card.controller';
import { listSessions } from '../controllers/list.controller';
import { voteForCard } from '../controllers/vote.controller';
import { getSession, updateSessionStep } from '../controllers/step.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import {
  createSessionSchema,
  joinSessionSchema,
  createCardSchema,
  updateCardSchema,
  updateSessionStepSchema
} from '../validators/session.validator';

const router = Router();

router.get('/', auth, asyncHandler(listSessions));
router.post('/create-session', auth, validate(createSessionSchema), asyncHandler(createSession));
router.post('/join', auth, validate(joinSessionSchema), asyncHandler(joinSession));
router.get('/:sessionId', auth, asyncHandler(getSession));
router.patch('/:sessionId/step', auth, validate(updateSessionStepSchema), asyncHandler(updateSessionStep));
router.post('/:sessionId/cards', auth, validate(createCardSchema), asyncHandler(createCard));
router.get('/:sessionId/cards', auth, asyncHandler(getCards));
router.patch('/:sessionId/cards/:cardId', auth, validate(updateCardSchema), asyncHandler(updateCard));
router.delete('/:sessionId/cards/:cardId', auth, asyncHandler(deleteCard));
router.post('/:sessionId/cards/:cardId/vote', auth, asyncHandler(voteForCard));

export default router;
