import type { InputHTMLAttributes } from 'react';

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  error?: string;
  /** Bordure grise/verte/rouge selon l'état du champ (Login/Signup). Par défaut : rouge sur erreur uniquement. */
  showValidState?: boolean;
}
