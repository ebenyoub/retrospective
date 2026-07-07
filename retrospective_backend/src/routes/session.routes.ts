import { Router } from 'express';
import { auth } from '../../authentication/auth.middleware';
import { createSession } from '../../session/create.controller';
import joinSession from '../../session/join.controller';
import { createCard, getCards } from '../../session/card.controller';
import { listSessions } from '../../session/list.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', auth, asyncHandler(listSessions));
router.post('/create-session', auth, createSession);
router.post('/join', auth, joinSession);
router.post('/:sessionId/cards', auth, createCard);
router.get('/:sessionId/cards', auth, getCards);

export default router;
