import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { logger } from './src/utils/logger';
import { errorHandler } from './src/utils/errorHandler';
import { isOriginAllowed } from './src/utils/corsOrigin';
import { initSocket } from './src/realtime/socket';
import authRoutes from './src/routes/auth.routes';
import sessionRoutes from './src/routes/session.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin, frontendOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  // Nécessaire pour que le navigateur accepte d'envoyer et de recevoir
  // le cookie d'authentification entre les deux origines (5173 -> 3000).
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);

// Middleware d'erreur centralisé — doit être déclaré après toutes les routes.
// N'est atteint que par les routes passées à asyncHandler (voir src/utils/asyncHandler.ts).
app.use(errorHandler);

// http.createServer (au lieu de app.listen) : Express et Socket.IO
// partagent le même serveur HTTP et donc le même port.
const httpServer = createServer(app);
initSocket(httpServer, (origin) => isOriginAllowed(origin, frontendOrigin));

// '0.0.0.0' explicite (déjà le comportement par défaut de Node sans host,
// mais mieux vaut ne pas en dépendre implicitement) : le serveur accepte les
// connexions sur toutes les interfaces réseau, pas seulement localhost —
// nécessaire pour être joignable depuis un autre poste du réseau local.
httpServer.listen(Number(port), '0.0.0.0', () => {
  logger.http(`Server API sur http://localhost:${port} (accessible aussi depuis le réseau local sur ce port)`);
});
