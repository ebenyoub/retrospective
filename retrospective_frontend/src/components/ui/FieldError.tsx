import type { FieldErrorProps } from './types/FieldError.types';

// Message d'erreur sous un champ de formulaire, relié au champ via aria-describedby.
const FieldError = ({ id, message }: FieldErrorProps) => {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="text-xs text-red-500 mt-1">
      {message}
    </p>
  );
};

export default FieldError;
