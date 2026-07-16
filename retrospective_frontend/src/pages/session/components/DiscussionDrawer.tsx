import { MessageCircle, Send, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import EmptyState from '@/components/ui/EmptyState';
import IconButton from '@/components/ui/IconButton';
import type { DiscussionDrawerProps } from './types/DiscussionDrawer.types';

const DiscussionDrawer = ({ isOpen, isDesktop, onClose }: DiscussionDrawerProps) => {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      labelledBy="discussion-drawer-title"
      overlayLabel="Fermer le panneau Discussion"
      side={isDesktop ? 'right' : 'full'}
      size="md"
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Fermer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-navy-border-med bg-transparent px-2.5 font-sans text-xs font-medium text-slate-400 transition-colors hover:bg-navy-surface hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <X size={14} aria-hidden="true" />
          <span>Fermer</span>
        </Button>
      </header>

      <EmptyState
        icon={<MessageCircle size={20} aria-hidden="true" />}
        title="Aucun message pour le moment"
        description="Les échanges de cette rétrospective apparaîtront ici dès qu'ils seront disponibles."
        variant="panel"
        descriptionClassName="max-w-[280px]"
      />

      <div className="flex flex-shrink-0 items-end gap-2 border-t border-navy-border px-3 py-3">
        <textarea
          aria-label="Écrire un message"
          disabled
          rows={1}
          placeholder="Aucun message disponible"
          className="min-h-[38px] flex-1 resize-none rounded-lg border border-navy-border-med bg-navy-surface px-3 py-2 font-sans text-sm text-slate-500 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <IconButton
          disabled
          aria-label="Envoyer le message"
          variant="ghost"
          className="h-[38px] w-[38px] border-0 bg-navy-surface-med text-slate-600 hover:bg-navy-surface-med hover:text-slate-600 disabled:opacity-100"
        >
          <Send size={15} aria-hidden="true" />
        </IconButton>
      </div>
    </Drawer>
  );
};

export default DiscussionDrawer;
