import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn('text-xs font-mono text-slate-400 bg-white/5 rounded px-2 py-1', className)}
    {...props}
  />
);

export default Badge;
