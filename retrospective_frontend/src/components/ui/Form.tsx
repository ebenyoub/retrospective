import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from 'lucide-react';
import type { FormInputProps } from './types/Form.types';

// Form (replaces FormContainer)
const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
  <form
    ref={ref}
    className={cn(
      "bg-navy-mid text-slate-200 flex w-full max-w-md min-w-0 flex-col gap-6 rounded-figma-xl border border-navy-border p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:p-6",
      className
    )}
    {...props}
  />
));
Form.displayName = "Form";

// FormField (combines label, inputs, errors in a vertical stack)
const FormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5", className)}
    {...props}
  />
));
FormField.displayName = "FormField";

// FormLabel
const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase select-none",
      className
    )}
    {...props}
  />
));
FormLabel.displayName = "FormLabel";

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    const isPassword = type === 'password';

    return (
      <div className="relative w-full">
        <input
          {...props}
          type={isPassword ? (show ? 'text' : 'password') : type}
          className={cn(
            'flex h-10 w-full rounded-figma-md border border-navy-border-med bg-navy-surface px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-white/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            isPassword && 'pr-10',
            className
          )}
          ref={ref}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute z-10 right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer focus:outline-none"
            onClick={() => setShow((prev) => !prev)}
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {show ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';

// FormTitle
const FormTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn("text-center text-xl font-bold text-slate-50 font-sans tracking-tight", className)}
    {...props}
  />
));
FormTitle.displayName = "FormTitle";

// FormGroup
const FormGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-4 text-white shadow", className)}
    {...props}
  />
));
FormGroup.displayName = "FormGroup";

export default Form;
export { FormField, FormLabel, FormInput, FormTitle, FormGroup };
