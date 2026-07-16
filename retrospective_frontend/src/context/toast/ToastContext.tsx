import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import ToastNotification from '@/components/ui/ToastNotification';
import { ToastContext } from './useToast';
import type { Toast, ToastType } from './types/toast.types';

export const ToastProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((previousToasts) =>
      previousToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Date.now();

      setToasts((previousToasts) => [
        {
          id,
          type,
          message,
          remove: removeToast,
        },
        ...previousToasts,
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const contextValue = useMemo(
    () => ({
      addToast,
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastNotification list={toasts} />
    </ToastContext.Provider>
  );
};