import { useEffect, useState, type KeyboardEvent } from 'react';
import type { TimerChipProps } from './types/TimerChip.types';

// Temps restant en secondes jusqu'à l'échéance, borné à 0.
const computeRemainingSeconds = (endsAt: string | null): number => {
  if (!endsAt) return 0;
  return Math.max(0, Math.round((new Date(endsAt).getTime() - Date.now()) / 1000));
};

const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function TimerChip({ endsAt, isEditable = false, onSubmitMinutes }: TimerChipProps) {
  const [seconds, setSeconds] = useState(() => computeRemainingSeconds(endsAt));
  const [isEditing, setIsEditing] = useState(false);
  const [minutesInput, setMinutesInput] = useState('');

  // Nouvelle échéance reçue (changement d'étape ou réglage du facilitateur) :
  // on recale l'affichage immédiatement, pendant le rendu (pattern React
  // "adjusting state when a prop changes").
  const [prevEndsAt, setPrevEndsAt] = useState(endsAt);
  if (endsAt !== prevEndsAt) {
    setPrevEndsAt(endsAt);
    setSeconds(computeRemainingSeconds(endsAt));
  }

  // Le client ne décompte pas lui-même : chaque seconde, il recalcule le
  // restant à partir de l'échéance commune. Tous les clients affichent donc
  // la même valeur, quel que soit le moment où ils ont chargé la page.
  useEffect(() => {
    if (!endsAt) return;

    const interval = setInterval(() => {
      setSeconds(computeRemainingSeconds(endsAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  const submitMinutes = async () => {
    const minutes = Number(minutesInput);

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
      setIsEditing(false);
      return;
    }

    await onSubmitMinutes?.(minutes);
    setIsEditing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submitMinutes();
    }
    if (event.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const clockIcon = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-slate-400">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  // Champ inline : le facilitateur saisit un nombre de minutes, Entrée valide,
  // Échap annule. Le backend recalcule l'échéance et la diffuse à tous.
  if (isEditing) {
    return (
      <div className="flex h-[30px] shrink-0 items-center gap-1.5 rounded-lg border border-blue-400 bg-navy-surface px-2.5">
        {clockIcon}
        <input
          type="number"
          min={1}
          max={120}
          autoFocus
          value={minutesInput}
          onChange={(event) => setMinutesInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => void submitMinutes()}
          aria-label="Nouvelle durée en minutes"
          className="w-12 bg-transparent font-mono text-xs font-bold text-slate-200 outline-none"
        />
        <span className="text-xs text-slate-400">min</span>
      </div>
    );
  }

  const chipContent = (
    <>
      {clockIcon}
      <span className="font-mono text-xs font-bold leading-none text-slate-200 tracking-[1px]">
        {formatTime(seconds)}
      </span>
    </>
  );

  if (!isEditable) {
    return (
      <div className="flex h-[30px] shrink-0 items-center gap-1.5 rounded-lg border border-navy-border-med bg-navy-surface px-2.5 select-none">
        {chipContent}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setMinutesInput('');
        setIsEditing(true);
      }}
      title="Modifier le temps restant"
      aria-label="Modifier le temps restant"
      className="flex h-[30px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-navy-border-med bg-navy-surface px-2.5 select-none transition-colors hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
    >
      {chipContent}
    </button>
  );
}

export default TimerChip;
