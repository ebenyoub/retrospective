import { useEffect, useState } from 'react';

import type { RetroCard } from '../types/card.types';

const MOBILE_QUERY = '(max-width: 767px)';
// Même seuil que le breakpoint Tailwind `xl` : au-delà, la navbar de session
// fusionne outils + actions sur une seule ligne plutôt que d'empiler 3 barres
// (voir SessionNavigationBar/SessionActionBar).
const DESKTOP_QUERY = '(min-width: 1280px)';

const readMediaQuery = (query: string): boolean => (
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia(query).matches
);

export const useSessionViewport = () => {
  const [activeMobileColumn, setActiveMobileColumn] = useState<RetroCard['columnType']>('start');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => readMediaQuery(MOBILE_QUERY));
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(() => readMediaQuery(DESKTOP_QUERY));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const desktopQuery = window.matchMedia(DESKTOP_QUERY);
    const handleMobileChange = (): void => setIsMobileViewport(mobileQuery.matches);
    const handleDesktopChange = (): void => setIsDesktopViewport(desktopQuery.matches);

    mobileQuery.addEventListener('change', handleMobileChange);
    desktopQuery.addEventListener('change', handleDesktopChange);
    return () => {
      mobileQuery.removeEventListener('change', handleMobileChange);
      desktopQuery.removeEventListener('change', handleDesktopChange);
    };
  }, []);

  return {
    activeMobileColumn,
    isMobileViewport,
    isDesktopViewport,
    setActiveMobileColumn,
  };
};
