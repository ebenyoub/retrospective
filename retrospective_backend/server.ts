import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import { auth } from './authentication/auth.middleware';
import { verifyCode } from './authentication/code.controller';
import { deleteAccount } from './authentication/delete.controller';
import { login } from './authentication/login.controller';
import { signup } from './authentication/signup.controller';
import { forgot } from './authentication/forgot.controller';
import { profile } from './authentication/profile.controller';
import { resetPassword } from './authentication/reset.controller';
import { createSession } from './session/create.controller';
import { logger } from './utils/logger';
import joinSession from './session/join.controller';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/auth/profile', auth, profile);
app.post('/auth/login', login);
app.post('/auth/signup', signup);
app.delete('/auth/delete', auth, deleteAccount);
app.post('/auth/forgot', forgot);
app.post('/auth/verify-code', verifyCode);
app.patch('/auth/reset-password', resetPassword);

app.post("/session/create-session", auth, createSession);
app.post("/session/join", auth, joinSession);

app.listen(port, () => {
  logger.http(`Server API sur http://localhost:${port}`);
});
