interface TimerChipProps {
  value: string;
}

export function TimerChip({ value }: TimerChipProps) {
  return (
    <div className="flex items-center gap-1.5 bg-navy-surface border border-navy-border-med rounded-lg px-2.5 py-1 select-none shrink-0 animate-pulse">
      {/* Horloge SVG inline */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-slate-400">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">
        {value}
      </span>
    </div>
  );
}

export default TimerChip;
