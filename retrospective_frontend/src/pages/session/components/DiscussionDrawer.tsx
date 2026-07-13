import { useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface DiscussionDrawerProps {
  isOpen: boolean;
  isDesktop: boolean;
  onClose: () => void;
}

const DiscussionDrawer = ({ isOpen, isDesktop, onClose }: DiscussionDrawerProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const panelPosition = isDesktop
    ? 'right-0 top-0 h-full w-[420px] translate-x-0 border-l'
    : 'inset-0 translate-x-0';

  return (
    <div className="fixed inset-0 z-50" role="presentation" aria-hidden={!isOpen}>
      <button
        type="button"
        aria-label="Fermer le panneau Discussion"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/45"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="discussion-drawer-title"
        className={`absolute flex flex-col overflow-hidden border-navy-border bg-navy-mid shadow-2xl transition-transform duration-200 ease-out ${panelPosition}`}
      >
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-navy-border px-4">
          <div className="flex min-w-0 items-center gap-2">
            <MessageCircle size={16} className="text-slate-400" aria-hidden="true" />
            <div className="min-w-0">
              <h2 id="discussion-drawer-title" className="font-sans text-sm font-bold text-slate-50">
                Discussion
              </h2>
              <p className="mt-0.5 font-sans text-[11px] text-slate-500">
                0 message
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-navy-border-med bg-transparent px-2.5 font-sans text-xs font-medium text-slate-400 transition-colors hover:bg-navy-surface hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
            Aucun message pour le moment
          </p>
          <p className="mx-auto mt-2 max-w-[280px] font-sans text-xs leading-5 text-slate-500">
            Les échanges de cette rétrospective apparaîtront ici dès qu'ils seront disponibles.
          </p>
        </div>

        <div className="flex flex-shrink-0 items-end gap-2 border-t border-navy-border px-3 py-3">
          <textarea
            aria-label="Écrire un message"
            disabled
            rows={1}
            placeholder="Aucun message disponible"
            className="min-h-[38px] flex-1 resize-none rounded-lg border border-navy-border-med bg-navy-surface px-3 py-2 font-sans text-sm text-slate-500 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <button
            type="button"
            disabled
            aria-label="Envoyer le message"
            className="flex h-[38px] w-[38px] flex-shrink-0 cursor-not-allowed items-center justify-center rounded-lg bg-navy-surface-med text-slate-600"
          >
            <Send size={15} aria-hidden="true" />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default DiscussionDrawer;
