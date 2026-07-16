import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger';
}

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variantClasses = {
    default: 'bg-white/5 text-slate-400 border border-white/5',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold font-mono border transition-colors select-none',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};

export default Badge;
