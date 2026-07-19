import { cn } from '@/lib/utils';
import React from 'react';
import type { IconButtonProps } from './types/IconButton.types';

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, variant = 'default', size = 'sm', type = 'button', ...props }, ref) => {
    const variantClassName: Record<NonNullable<IconButtonProps['variant']>, string> = {
      default: 'border-navy-border-med bg-navy-surface text-slate-400 hover:bg-navy-surface-med hover:text-slate-100',
      ghost: 'border-transparent bg-transparent text-slate-500 hover:bg-navy-surface hover:text-slate-200',
      danger: 'border-red-500/20 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300',
    };

    const sizeClassName: Record<NonNullable<IconButtonProps['size']>, string> = {
      xs: 'h-7 w-7 rounded-[8px]',
      sm: 'h-8 w-8 rounded-lg',
      md: 'h-10 w-10 rounded-lg',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex flex-shrink-0 cursor-pointer items-center justify-center border transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-mid',
          variantClassName[variant],
          sizeClassName[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
