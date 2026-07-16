import type { ReactNode } from 'react';

export type EmptyStateVariant = 'default' | 'panel';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  variant?: EmptyStateVariant;
  descriptionClassName?: string;
}
