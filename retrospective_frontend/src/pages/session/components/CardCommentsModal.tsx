import { MessageCircle, Send, X } from 'lucide-react';

import type { RetroCard } from './RetroCardItem';

interface CardCommentsModalProps {
  card: RetroCard;
  isDesktop: boolean;
  onClose: () => void;
}

const columnLabel: Record<RetroCard['columnType'], string> = {
  start: 'Idées',
  stop: 'Négatif',
  continue: 'Positif',
};

const CardCommentsModal = ({ card, isDesktop, onClose }: CardCommentsModalProps) => {
  return (
    <div
      className={`fixed inset-0 z-[60] flex bg-black/60 backdrop-blur-sm ${
        isDesktop ? 'items-center justify-center p-6' : 'items-end'
      }`}
      role="presentation"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-comments-title"
        onClick={(event) => event.stopPropagation()}
        className={`flex max-h-[85vh] flex-col overflow-hidden border border-navy-border bg-navy-mid shadow-2xl ${
          isDesktop
            ? 'w-full max-w-[520px] rounded-2xl'
            : 'max-h-[85vh] w-full rounded-t-2xl'
        }`}
      >
        <header className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-navy-border px-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-navy-border-med bg-navy-surface px-2 py-0.5 font-sans text-[11px] font-semibold text-slate-400">
                {columnLabel[card.columnType]}
              </span>
              <span className="truncate font-sans text-[11px] text-slate-500">
                {card.authorName}
              </span>
            </div>
            <h2 id="card-comments-title" className="font-sans text-sm font-semibold leading-6 text-slate-100">
              {card.content}
            </h2>
            <p className="mt-2 flex items-center gap-1.5 font-sans text-xs text-slate-500">
              <MessageCircle size={13} aria-hidden="true" />
              Commentaires
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les commentaires"
            className="inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded-lg border border-navy-border-med bg-transparent px-2.5 font-sans text-xs font-medium text-slate-400 transition-colors hover:bg-navy-surface hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X size={14} aria-hidden="true" />
            <span>Fermer</span>
          </button>
        </header>

        <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-navy-border-med bg-navy-surface text-slate-500">
            <MessageCircle size={20} aria-hidden="true" />
          </div>
          <p className="font-sans text-sm font-semibold text-slate-300">
            Aucun commentaire disponible
          </p>
          <p className="mx-auto mt-2 max-w-[300px] font-sans text-xs leading-5 text-slate-500">
            Les commentaires liés à cette carte apparaîtront ici dès qu'ils seront disponibles.
          </p>
        </div>

        <div className="flex flex-shrink-0 items-end gap-2 border-t border-navy-border px-4 py-3">
          <textarea
            aria-label="Écrire un commentaire"
            disabled
            rows={2}
            placeholder="Aucun commentaire disponible"
            className="min-h-[42px] flex-1 resize-none rounded-lg border border-navy-border-med bg-navy-surface px-3 py-2 font-sans text-sm text-slate-500 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <button
            type="button"
            disabled
            aria-label="Envoyer le commentaire"
            className="flex h-10 w-10 flex-shrink-0 cursor-not-allowed items-center justify-center rounded-lg bg-navy-surface-med text-slate-600"
          >
            <Send size={15} aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default CardCommentsModal;
