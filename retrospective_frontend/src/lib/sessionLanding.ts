import { isApiSuccess, readJsonSafely } from './apiError';

interface LandingSession {
  id: number;
  status: string;
}

/**
 * Détermine où envoyer un utilisateur connecté (juste après connexion, ou au
 * retour sur l'accueil) selon ses sessions actives :
 * - une seule session ouverte → directement dedans
 * - plusieurs → la liste "Mes sessions"
 * - aucune → l'accueil
 */
export const resolveLandingRoute = async (token: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8000/session', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await readJsonSafely(response);

    if (!response.ok || !isApiSuccess<LandingSession[]>(data)) {
      return '/';
    }

    const activeSessions = data.data.filter((session) => session.status === 'open');

    if (activeSessions.length === 1) {
      return `/session/${activeSessions[0].id}`;
    }

    if (activeSessions.length > 1) {
      return '/sessions';
    }

    return '/';
  } catch {
    return '/';
  }
};
