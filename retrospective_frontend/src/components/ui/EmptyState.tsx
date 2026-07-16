import { cn } from '@/lib/utils';
import type { EmptyStateProps, EmptyStateVariant } from './types/EmptyState.types';

const containerClassName: Record<EmptyStateVariant, string> = {
  default: 'flex flex-col items-center justify-center gap-2.5 px-5 py-10 text-center select-none animate-fade-in',
  panel: 'flex flex-1 flex-col justify-center overflow-y-auto px-6 py-8 text-center',
};

const iconClassName: Record<EmptyStateVariant, string> = {
  default: 'mb-1 text-2xl leading-none text-slate-600',
  panel: 'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-navy-border-med bg-navy-surface text-slate-500',
};

const titleClassName: Record<EmptyStateVariant, string> = {
  default: 'font-sans text-sm font-semibold text-slate-400',
  panel: 'font-sans text-sm font-semibold text-slate-300',
};

const descriptionBaseClassName: Record<EmptyStateVariant, string> = {
  default: 'max-w-[280px] font-sans text-[13px] leading-relaxed text-slate-600',
  panel: 'mx-auto mt-2 font-sans text-xs leading-5 text-slate-500',
};

const EmptyState = ({
  icon,
  title,
  description,
  variant = 'default',
  descriptionClassName,
}: EmptyStateProps) => (
  <div className={containerClassName[variant]}>
    <div className={iconClassName[variant]}>{icon}</div>
    <p className={titleClassName[variant]}>{title}</p>
    {description && (
      <p className={cn(descriptionBaseClassName[variant], descriptionClassName)}>
        {description}
      </p>
    )}
  </div>
);

export default EmptyState;
