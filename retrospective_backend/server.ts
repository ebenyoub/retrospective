import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

import { logger } from './src/utils/logger';
import { errorHandler } from './src/utils/errorHandler';
import authRoutes from './src/routes/auth.routes';
import sessionRoutes from './src/routes/session.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/session', sessionRoutes);

// Middleware d'erreur centralisé — doit être déclaré après toutes les routes.
// N'est atteint que par les routes passées à asyncHandler (voir src/utils/asyncHandler.ts).
app.use(errorHandler);

app.listen(port, () => {
  logger.http(`Server API sur http://localhost:${port}`);
});
