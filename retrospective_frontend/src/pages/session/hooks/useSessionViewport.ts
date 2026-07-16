import { useEffect, useState } from 'react';

import type { RetroCard } from '../types/card.types';

const MOBILE_QUERY = '(max-width: 767px)';

const readMobileViewport = (): boolean => (
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia(MOBILE_QUERY).matches
);

export const useSessionViewport = () => {
  const [activeMobileColumn, setActiveMobileColumn] = useState<RetroCard['columnType']>('start');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(readMobileViewport);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (): void => setIsMobileViewport(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    activeMobileColumn,
    isMobileViewport,
    setActiveMobileColumn,
  };
};
