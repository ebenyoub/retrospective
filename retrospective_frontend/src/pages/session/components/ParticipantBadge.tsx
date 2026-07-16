import { useEffect, useRef, useState } from 'react';

import { pseudoSchema } from '@/lib/pseudoSchema';

interface ParticipantBadgeProps {
  displayName: string;
  // Le renommage n'est proposé qu'à l'invité : l'utilisateur connecté porte
  // le nom de son compte, qui ne se modifie pas depuis une session.
  canRename: boolean;
  onRename: (pseudo: string) => Promise<boolean>;
  onLeave: () => void | Promise<void>;
}

// Badge du participant dans la barre de session : affiche son pseudo et
// ouvre un petit menu (Modifier le pseudo / Quitter la session).
const ParticipantBadge = ({ displayName, canRename, onRename, onLeave }: ParticipantBadgeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pseudoInput, setPseudoInput] = useState(displayName);
  const [errorMessage, setErrorMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur (même approche que ProfileMenu).
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
      setIsEditing(false);
      setErrorMessage('');
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const openEditor = () => {
    setPseudoInput(displayName);
    setErrorMessage('');
    setIsEditing(true);
  };

  const submitRename = async () => {
    // Mêmes règles de validation qu'à l'entrée dans la session.
    const parsed = pseudoSchema.safeParse(pseudoInput);

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Pseudo invalide.');
      return;
    }

    if (parsed.data === displayName) {
      setIsEditing(false);
      setIsOpen(false);
      return;
    }

    const ok = await onRename(parsed.data);

    if (ok) {
      setIsEditing(false);
      setIsOpen(false);
    } else {
      setErrorMessage('Ce pseudo est refusé (déjà utilisé ?).');
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Menu du participant ${displayName}`}
        className="inline-flex h-[30px] max-w-[140px] cursor-pointer items-center gap-1.5 rounded-lg border border-navy-border-med bg-navy-surface px-2.5 font-sans text-xs font-semibold leading-none text-slate-200 transition-colors select-none hover:bg-navy-surface-med focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        <span className="truncate">{displayName}</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Actions du participant"
          className="absolute right-0 top-[36px] z-50 w-56 rounded-[10px] border border-navy-border-med bg-navy-mid p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        >
          {canRename && !isEditing && (
            <button
              type="button"
              role="menuitem"
              onClick={openEditor}
              className="block w-full cursor-pointer rounded-[8px] px-3 py-2 text-left font-sans text-xs font-medium text-slate-200 transition-colors hover:bg-navy-surface-med"
            >
              Modifier le pseudo
            </button>
          )}

          {canRename && isEditing && (
            <div className="px-3 py-2">
              <label htmlFor="rename-pseudo" className="mb-1 block font-sans text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Nouveau pseudo
              </label>
              <input
                id="rename-pseudo"
                type="text"
                autoFocus
                value={pseudoInput}
                onChange={(event) => setPseudoInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void submitRename();
                  if (event.key === 'Escape') {
                    setIsEditing(false);
                    setErrorMessage('');
                  }
                }}
                className="w-full rounded-[8px] border border-navy-border-med bg-navy-surface px-2 py-1.5 font-sans text-xs text-slate-100 outline-none transition-colors focus:border-blue-400"
              />
              {errorMessage && (
                <p role="alert" className="mt-1 font-sans text-[11px] text-red-400">{errorMessage}</p>
              )}
              <button
                type="button"
                onClick={() => void submitRename()}
                className="mt-2 w-full cursor-pointer rounded-[8px] bg-slate-50 px-2 py-1.5 font-sans text-xs font-semibold text-navy transition-colors hover:bg-slate-200"
              >
                Valider
              </button>
            </div>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => void onLeave()}
            className="block w-full cursor-pointer rounded-[8px] px-3 py-2 text-left font-sans text-xs font-medium text-red-400 transition-colors hover:bg-navy-surface-med"
          >
            Quitter la session
          </button>
        </div>
      )}
    </div>
  );
};

export default ParticipantBadge;
