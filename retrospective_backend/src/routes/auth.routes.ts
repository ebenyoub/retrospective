import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { verifyCode } from '../controllers/code.controller';
import { deleteAccount } from '../controllers/delete.controller';
import { login } from '../controllers/login.controller';
import { signup } from '../controllers/signup.controller';
import { forgot } from '../controllers/forgot.controller';
import { profile } from '../controllers/profile.controller';
import { resetPassword } from '../controllers/reset.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/profile', auth, profile);
router.post('/login', asyncHandler(login));
router.post('/signup', asyncHandler(signup));
router.delete('/delete', auth, asyncHandler(deleteAccount));
router.post('/forgot', forgot);
router.post('/verify-code', verifyCode);
router.patch('/reset-password', resetPassword);

export default router;
