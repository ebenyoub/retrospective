import type { ReactNode } from 'react';

export type DrawerSide = 'left' | 'right' | 'bottom' | 'full';
export type DrawerSize = 'sm' | 'md';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  overlayLabel: string;
  children: ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
}
