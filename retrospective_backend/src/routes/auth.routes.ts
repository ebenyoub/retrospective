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
router.post('/signup', validate(signupSchema), asyncHandler(signup));
router.delete('/delete', auth, asyncHandler(deleteAccount));
router.post('/forgot', validate(forgotSchema), asyncHandler(forgot));
router.post('/verify-code', validate(verifyCodeSchema), asyncHandler(verifyCode));
router.patch('/reset-password', validate(resetPasswordSchema), asyncHandler(resetPassword));

export default router;
