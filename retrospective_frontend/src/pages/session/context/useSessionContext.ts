import { useContext } from 'react';

import { SessionContext } from './SessionContext';
import type { SessionContextType } from './SessionContext';

export const useSessionContext = (): SessionContextType => {
  const context = useContext(SessionContext);

  if (context === null) {
    throw new Error('useSessionContext doit être utilisé dans un SessionContext.Provider');
  }

  return context;
};
