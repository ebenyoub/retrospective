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
      {isPassword && (
        <button
          type="button"
          className="absolute z-4 right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {show ? <Eye /> : <EyeOff />}
        </button>
      )}
      <input
        {...props}
        type={isPassword ? (show ? 'text' : 'password') : type}
        className={cn(
          className,
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        )}
        ref={ref}
      />
    </div>
  );
});

Input.displayName = 'Input';

export const FormTitle = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => {
  return (
    <h1 className={cn('text-center', className)} {...props}>
      {children}
    </h1>
  );
};

const FormContainer = React.forwardRef<HTMLFormElement, FormContainerProps>(({ children, className, ...props }, ref) => {
  return (
    <form
      ref={ref}
      className={cn('bg-card text-card-foreground flex w-full max-w-md min-w-0 flex-col gap-6 rounded-xl border p-4 shadow-sm sm:p-6', className)}
      {...props}
    >
      {children}
    </form>
  );
});

FormContainer.displayName = 'FormContainer';

export default FormContainer;
