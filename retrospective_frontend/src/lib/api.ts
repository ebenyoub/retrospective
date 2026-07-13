// URL de base de l'API backend, définie en un seul endroit.
// Surchargée par la variable d'environnement Vite `VITE_API_URL` (voir
// `.env.example`) pour permettre un déploiement propre ; par défaut l'API
// locale de développement.
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
