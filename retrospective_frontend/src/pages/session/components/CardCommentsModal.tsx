import { MessageCircle, Send, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import IconButton from '@/components/ui/IconButton';

import type { RetroCard } from '../types/card.types';
import type { CardCommentsModalProps } from './types/CardCommentsModal.types';

const columnLabel: Record<RetroCard['columnType'], string> = {
  start: 'Idées',
  stop: 'Négatif',
  continue: 'Positif',
};

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const CardCommentsModal = ({ card, isDesktop, onClose }: CardCommentsModalProps) => {
  const panelRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    
    const panel = panelRef.current;
    // On focalise le panneau ou le bouton fermer
    if (panel) {
      const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        panel.focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panel) return;

      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(el => !el.hasAttribute('disabled'));

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && (document.activeElement === firstElement || document.activeElement === panel)) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[60] flex bg-black/60 backdrop-blur-sm ${
        isDesktop ? 'items-center justify-center p-6' : 'items-end'
      }`}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-comments-title"
        className={`relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden border border-navy-border bg-navy-mid shadow-2xl focus:outline-none ${
          isDesktop
            ? 'max-w-[520px] rounded-2xl'
            : 'rounded-t-2xl'
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fermer les commentaires"
            className="inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded-lg border border-navy-border-med bg-transparent px-2.5 font-sans text-xs font-medium text-slate-400 transition-colors hover:bg-navy-surface hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X size={14} aria-hidden="true" />
            <span>Fermer</span>
          </Button>
        </header>

        <EmptyState
          icon={<MessageCircle size={20} aria-hidden="true" />}
          title="Aucun commentaire disponible"
          description="Les commentaires liés à cette carte apparaîtront ici dès qu'ils seront disponibles."
          variant="panel"
          descriptionClassName="max-w-[300px]"
        />

        <div className="flex flex-shrink-0 items-end gap-2 border-t border-navy-border px-4 py-3">
          <textarea
            aria-label="Écrire un commentaire"
            disabled
            rows={2}
            placeholder="Aucun commentaire disponible"
            className="min-h-[42px] flex-1 resize-none rounded-lg border border-navy-border-med bg-navy-surface px-3 py-2 font-sans text-sm text-slate-500 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <IconButton
            disabled
            aria-label="Envoyer le commentaire"
            variant="ghost"
            size="md"
            className="border-0 bg-navy-surface-med text-slate-600 hover:bg-navy-surface-med hover:text-slate-600 disabled:opacity-100"
          >
            <Send size={15} aria-hidden="true" />
          </IconButton>
        </div>
      </section>
    </div>
  );
};

export default CardCommentsModal;
