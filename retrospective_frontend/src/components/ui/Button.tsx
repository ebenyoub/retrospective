import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "destructive" | "default";
  size?: "sm" | "md" | "lg";
  type?: "submit" | "reset" | "button" | undefined
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "secondary", size = "md", ...props }, ref) => {

    const buttonVariants: Record<string, string> = {
      primary: "bg-slate-50 text-navy hover:bg-slate-200 border-transparent hover:text-navy",
      secondary: "bg-navy-surface-med text-slate-200 border border-navy-border-med hover:bg-white/10 hover:text-slate-200",
      ghost: "bg-transparent text-slate-400 border-transparent hover:bg-navy-surface hover:text-slate-200",
      danger: "bg-red-950 text-red-300 border border-red-900 hover:bg-red-900 hover:text-red-100",
      success: "bg-green-border text-green-light border-transparent hover:bg-green-figma hover:text-white",
      destructive: "bg-red-950 text-red-300 border border-red-900 hover:bg-red-900 hover:text-red-100",
      default: "bg-navy-surface-med text-slate-200 border border-navy-border-med hover:bg-white/10 hover:text-slate-200"
    };

    const buttonSizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-xs h-[30px] rounded-figma-sm",
      md: "px-4 py-2 text-sm h-[36px] rounded-figma-md",
      lg: "px-6 py-3 text-base h-[44px] rounded-figma-lg"
    };

    return (
        <button
            ref={ref}
            className={cn(
              'inline-flex items-center justify-center font-medium font-sans cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid',
              buttonVariants[variant],
              buttonSizes[size],
              props.className
            )}
            {...props}
        >
            {children}
        </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
