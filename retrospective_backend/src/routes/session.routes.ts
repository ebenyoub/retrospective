import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { createSession } from '../controllers/create.controller';
import joinSession from '../controllers/join.controller';
import { createCard, getCards, updateCard, deleteCard } from '../controllers/card.controller';
import { listSessions } from '../controllers/list.controller';
import { voteForCard } from '../controllers/vote.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', auth, asyncHandler(listSessions));
router.post('/create-session', auth, createSession);
router.post('/join', auth, joinSession);
router.post('/:sessionId/cards', auth, createCard);
router.get('/:sessionId/cards', auth, getCards);
router.patch('/:sessionId/cards/:cardId', auth, asyncHandler(updateCard));
router.delete('/:sessionId/cards/:cardId', auth, deleteCard);
router.post('/:sessionId/cards/:cardId/vote', auth, asyncHandler(voteForCard));

export default router;
