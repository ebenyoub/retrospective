import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-10 px-5 text-center select-none animate-fade-in">
      <div className="text-slate-600 mb-1 text-2xl leading-none">
        {icon}
      </div>
      <p className="font-sans text-sm font-semibold text-slate-400">
        {title}
      </p>
      {description && (
        <p className="font-sans text-[13px] text-slate-600 max-w-[280px] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export default EmptyState;
