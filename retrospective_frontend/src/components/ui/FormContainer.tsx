import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

interface FormContainerProps extends React.HTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  eye?: React.ReactNode;
  type?: string;
}

export const FormGroup = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => {
  return (
    <div {...props} className={cn(className, 'flex flex-col gap-4 text-white shadow')}>
      {children}
    </div>
  );
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative w-full">
      {/*
        L'input est avant le bouton dans le DOM pour que Tab atteigne d'abord
        le champ, puis le bouton œil (ordre naturel, sans tabIndex). Le
        bouton reste positionné visuellement à droite via `absolute`.
      */}
      <input
        {...props}
        type={isPassword ? (show ? 'text' : 'password') : type}
        className={cn(
          className,
          'flex h-10 w-full rounded-figma-md border border-navy-border-med bg-navy-surface px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-white/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          isPassword && 'pr-10'
        )}
        ref={ref}
      />
      {isPassword && (
        <button
          type="button"
          className="absolute z-10 right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {show ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const FormTitle = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => {
  return (
    <h1 className={cn('text-center text-xl font-bold text-slate-50 font-sans tracking-tight', className)} {...props}>
      {children}
    </h1>
  );
};

const FormContainer = React.forwardRef<HTMLFormElement, FormContainerProps>(({ children, className, ...props }, ref) => {
  return (
    <form
      ref={ref}
      className={cn('bg-navy-mid text-slate-200 flex w-full max-w-md min-w-0 flex-col gap-6 rounded-figma-xl border border-navy-border p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:p-6', className)}
      {...props}
    >
      {children}
    </form>
  );
});

FormContainer.displayName = 'FormContainer';

export default FormContainer;
