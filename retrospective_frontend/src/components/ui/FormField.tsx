import { cn } from '@/lib/utils';
import { FormGroup, FormInput as Input } from './Form';
import type { FormFieldProps } from './types/FormField.types';

const FormField = ({ id, label, error, showValidState, className, value, ...props }: FormFieldProps) => {
  const isEmpty = typeof value === 'string' && value.trim() === '';

  const stateClassName = showValidState
    ? isEmpty
      ? 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
      : error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-green-500 focus:border-green-500 focus:ring-green-500'
    : error
      ? 'border-red-500'
      : '';

  return (
    <FormGroup>
      <label htmlFor={id} className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        className={cn(stateClassName, className)}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && (
        <small className="text-red-500 text-xs mt-1" id={`${id}-error`}>
          {error}
        </small>
      )}
    </FormGroup>
  );
};

export default FormField;
