import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: string;
  type?: "submit" | "reset" | "button" | undefined
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {

    const buttonVariants: Record<string, string> = {
        default: "bg-gray-300 text-black hover:bg-blue-200",
        destructive: "bg-red-400 text-white hover:bg-red-300"
    }

    return (
        <button
            ref={ref}
            className={cn(
              buttonVariants[props.variant || "default"],
              'inline-flex min-h-10 max-w-full w-fit items-center justify-center rounded-md px-4 py-2 text-center text-sm cursor-pointer hover:text-black hover:shadow disabled:cursor-not-allowed disabled:opacity-50',
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
