export type ToastType = 'success' | 'error' | 'invalid';

export interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  remove: (id: number) => void;
}
