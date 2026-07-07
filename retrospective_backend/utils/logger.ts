import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Format de base sans couleur, pour les fichiers
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`, // Utilisez .toUpperCase() pour mieux distinguer le niveau
    ),
);

// Format pour la console (avec couleurs)
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }), // La couleur n'est que dans la console
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  // Le format par défaut doit être le format de fichier (propre) ou JSON.
  format: fileFormat, 
  transports: [
    // 1. Console (utilise le format colorisé)
    new winston.transports.Console({
        format: consoleFormat, // <<<<<< Utiliser le format avec couleur ici
    }),
    // 2. Fichier d'erreurs (utilise le format par défaut propre)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      // Format implicite (fileFormat)
    }),
    // 3. Fichier général (utilise le format par défaut propre)
    new winston.transports.File({ filename: 'logs/all.log' }),
  ],
});