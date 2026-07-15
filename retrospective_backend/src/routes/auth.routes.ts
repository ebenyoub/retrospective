import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { login, logout, signup, profile, deleteAccount } from '../controllers/auth.controller';
import { forgot, verifyCode, resetPassword } from '../controllers/passwordReset.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middlewares/validate.middleware';
import {
  signupSchema,
  loginSchema,
  forgotSchema,
  verifyCodeSchema,
  resetPasswordSchema
} from '../validators/auth.validator';

const router = Router();

router.get('/profile', auth, profile);
router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/logout', logout);
router.post('/signup', validate(signupSchema), asyncHandler(signup));
router.delete('/delete', auth, asyncHandler(deleteAccount));
router.post('/forgot', validate(forgotSchema), asyncHandler(forgot));
router.post('/verify-code', validate(verifyCodeSchema), asyncHandler(verifyCode));
router.patch('/reset-password', validate(resetPasswordSchema), asyncHandler(resetPassword));

export default router;
