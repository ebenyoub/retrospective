import { useState, type KeyboardEvent } from 'react';

interface RetroAddCardFormProps {
  /** Couleur hexadécimale de la colonne (ex: '#16a34a') pour colorier la bordure et le bouton. */
  color: string;
  onAddCard: (content: string) => Promise<void> | void;
}

/**
 * Formulaire d'ajout de carte aligné sur la maquette Figma Make :
 * — textarea flex avec bordure colorée quand saisie active
 * — bouton icon-only 34×34 à droite, coloré avec la couleur de la colonne
 * — Enter (sans Shift) pour valider
 * — bouton disabled tant que le textarea est vide
 */
const RetroAddCardForm = ({ color, onAddCard }: RetroAddCardFormProps) => {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasContent = value.trim().length > 0;

  const submit = async () => {
    const text = value.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddCard(text);
      setValue('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-navy-border p-[10px_12px]">
      <div className="flex gap-1.5">
        {/* Textarea — bordure colorée selon la colonne quand du contenu est présent */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nouvelle carte..."
          rows={2}
          disabled={isSubmitting}
          aria-label="Contenu de la nouvelle carte"
          className="flex-1 resize-none rounded-[9px] bg-navy-surface px-[10px] py-2 text-[13px] text-slate-50 placeholder:text-slate-500 outline-none transition-colors disabled:opacity-50"
          style={{
            border: `1px solid ${hasContent ? color + '60' : 'rgba(255,255,255,0.13)'}`,
          }}
        />

        {/* Bouton icon-only 34×34 — coloré quand actif, grisé quand vide */}
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!hasContent || isSubmitting}
          aria-label="Ajouter"
          className="flex-shrink-0 flex items-center justify-center rounded-[9px] transition-all disabled:cursor-not-allowed"
          style={{
            width: 34,
            height: 34,
            background: hasContent ? color : 'rgba(255,255,255,0.08)',
            color: hasContent ? '#ffffff' : '#475569',
            border: 'none',
            cursor: hasContent ? 'pointer' : 'default',
          }}
        >
          {/* Icône Plus — SVG inline, aucune dépendance externe */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.5 1.5v12M1.5 7.5h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RetroAddCardForm;
