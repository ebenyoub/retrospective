import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getActiveResumeSession } from '@/pages/session/services/participantApi';

// Un participant qui revient sur l'accueil sans avoir quitté sa session active
// peut y retourner directement. Le backend valide l'existence de la session
// et l'identité du participant à partir du cookie signé retro_resume.
//
// "Pas de session à reprendre automatiquement" (data: null) ne veut pas dire
// que l'identité invitée stockée est invalide : le backend renvoie aussi
// data: null quand la session a simplement été clôturée entre-temps, un cas
// tout à fait normal — pas la peine d'effacer `retro:guest:{sessionId}` dans
// ce cas, useSessionIdentity s'en sert justement pour rouvrir la session
// clôturée en lecture seule sous le même pseudo, sans redemander un pseudo.
// Le nettoyage réellement invalide (jeton expiré, participant supprimé) se
// fait déjà, lui, au bon endroit : dans useSessionIdentity, au moment précis
// où l'utilisateur rouvre CETTE session précise.
const ResumeSessionCard = () => {
  const navigate = useNavigate();
  const [resumable, setResumable] = useState<{ sessionId: number; sessionName: string; displayName: string } | null>(null);

  useEffect(() => {
    let isActive = true;

    const checkActiveSession = async () => {
      try {
        const result = await getActiveResumeSession();

        if (result.ok && result.data) {
          if (isActive) setResumable(result.data);
        } else if (isActive) {
          setResumable(null);
        }
      } catch (error) {
        // Erreur réseau : on n'affiche simplement pas le bouton.
        console.error('Erreur lors de la vérification de reprise :', error);
      }
    };

    void checkActiveSession();

    return () => {
      isActive = false;
    };
  }, []);

  if (!resumable) return null;

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => navigate(`/session/${resumable.sessionId}`)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-figma-xl border border-green-400/30 bg-green-400/10 px-5 py-4 text-left transition-colors hover:bg-green-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60"
      >
        <span className="min-w-0">
          <span className="block font-sans text-sm font-bold text-green-300">Revenir à la session en cours</span>
          <span className="block truncate font-sans text-xs text-slate-400">
            {resumable.sessionName} — en tant que {resumable.displayName}
          </span>
        </span>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-green-300">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default ResumeSessionCard;
