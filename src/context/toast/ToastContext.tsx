import React, { useState } from 'react';
import { ToastContext } from './useToast';
import ToastNotification from '@/components/ui/ToastNotification';
// Importez vos types et votre composant ToastNotification

type ToastType = 'success' | 'error' | 'invalid';

export interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
    remove: (id: number) => void;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter(t => t.id !== id));
  }

  const addToast = (type: ToastType, message: string) => {
    const id = Date.now();
    
    setToasts((prevToasts) => [
      { id, type, message, remove: removeToast },
      ...prevToasts,
    ]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastNotification list={toasts} />
    </ToastContext.Provider>
  );
};

