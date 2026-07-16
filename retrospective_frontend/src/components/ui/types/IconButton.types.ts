import type React from 'react';

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  'aria-label': string;
  children: React.ReactNode;
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md';
}
