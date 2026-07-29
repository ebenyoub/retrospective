import type React from 'react';

export interface ModalContextType {
  onClose: () => void;
}

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
}
