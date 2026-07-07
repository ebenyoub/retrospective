import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { verifyCode } from '../../authentication/code.controller';
import { deleteAccount } from '../../authentication/delete.controller';
import { login } from '../../authentication/login.controller';
import { signup } from '../../authentication/signup.controller';
import { forgot } from '../../authentication/forgot.controller';
import { profile } from '../../authentication/profile.controller';
import { resetPassword } from '../../authentication/reset.controller';

const router = Router();

router.get('/profile', auth, profile);
router.post('/login', login);
router.post('/signup', signup);
router.delete('/delete', auth, deleteAccount);
router.post('/forgot', forgot);
router.post('/verify-code', verifyCode);
router.patch('/reset-password', resetPassword);

export default router;
