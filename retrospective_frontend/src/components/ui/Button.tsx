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
            className={cn(buttonVariants[props.variant || "default"], 'rounded-md p-3 w-fit cursor-pointer hover:text-black hover:shadow', props.className)}
            {...props}
        >
            {children}
        </button>
    );
  }
);
Button.displayName = "Button";

export default Button;