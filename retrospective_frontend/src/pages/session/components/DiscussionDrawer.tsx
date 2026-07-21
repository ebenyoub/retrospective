import { MessageCircle, Send, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import EmptyState from '@/components/ui/EmptyState';
import IconButton from '@/components/ui/IconButton';
import Avatar from '@/components/ui/Avatar';
import { useToast } from '@/context/toast/useToast';
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';
import { cn } from '@/lib/utils';

import { createMessage } from '../services/messageApi';
import { useSessionContext } from '../context/useSessionContext';
import type { DiscussionPanelContentProps } from './types/DiscussionDrawer.types';

const formatTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

// Contenu partagé entre le mode "docké" (desktop, à côté des cartes, sans
// overlay : on peut lire/commenter les cartes tout en discutant) et le mode
// overlay (mobile, où il n'y a pas la place pour un panneau permanent).
const DiscussionPanelContent = ({
  onClose,
  messages,
  sessionId,
  actorHeaders,
  onMessageSent,
}: DiscussionPanelContentProps) => {
  const { addToast } = useToast();
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Ce composant n'est monté que pendant que le panneau est ouvert (voir
  // DiscussionDrawer plus bas) : le défilement au montage suffit, plus besoin
  // de suivre un `isOpen`.
  useEffect(() => {
    // Un léger délai permet au rendu du panneau d'être effectif avant le scroll.
    const timer = setTimeout(() => scrollToBottom('auto'), 80);
    return () => clearTimeout(timer);
  }, [scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages, scrollToBottom]);

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await createMessage(sessionId, actorHeaders, content);
      if (result.ok) {
        onMessageSent(result.data);
        setDraft('');
      } else {
        addToast('error', getApiErrorMessage(result.payload, "Impossible d'envoyer le message."));
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 30);
    }
  };

  return (
    <>
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-navy-border px-4">
        <div className="flex min-w-0 items-center gap-2">
          <MessageCircle size={16} className="text-slate-400" aria-hidden="true" />
          <div className="min-w-0">
            <h2 id="discussion-drawer-title" className="font-sans text-sm font-bold text-slate-50">
              Discussion
            </h2>
            <p className="mt-0.5 font-sans text-[11px] text-slate-500">
              {`${messages.length} message${messages.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Fermer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-navy-border-med bg-transparent px-2.5 font-sans text-xs font-medium text-slate-400 transition-colors hover:bg-navy-surface hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer"
        >
          <X size={14} aria-hidden="true" />
          <span>Fermer</span>
        </Button>
      </header>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center">
          <EmptyState
            icon={<MessageCircle size={20} aria-hidden="true" />}
            title="Aucun message pour le moment"
            description="Les échanges de cette rétrospective apparaîtront ici dès qu'ils seront disponibles."
            variant="panel"
            descriptionClassName="max-w-[280px]"
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {messages.map((message, index) => {
            const isMe = message.authorId === Number(actorHeaders['x-participant-id']);
            const isConsecutive = index > 0 && messages[index - 1].authorId === message.authorId;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-2.5 max-w-[85%] text-left",
                  isMe ? "flex-row-reverse ml-auto" : "mr-auto",
                  index === 0 ? "mt-0" : (isConsecutive ? "mt-1" : "mt-4")
                )}
              >
                {isConsecutive ? (
                  <div className="w-[28px] shrink-0" aria-hidden="true" />
                ) : (
                  <Avatar
                    name={message.authorName}
                    colorSeed={message.authorId}
                    size={28}
                    fontSize={11}
                  />
                )}
                <div className={cn("min-w-0 flex flex-col", isMe ? "items-end" : "items-start")}>
                  {!isConsecutive && (
                    <div className={cn("flex items-baseline gap-1.5", isMe ? "flex-row-reverse" : "flex-row")}>
                      <span className="truncate font-sans text-[11px] font-semibold text-slate-300">
                        {isMe ? "Vous" : message.authorName}
                      </span>
                      <span className="font-mono text-[9px] text-slate-500">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "mt-1 rounded-2xl px-3 py-2 font-sans text-sm leading-normal break-words border",
                      isMe
                        ? "bg-navy-surface-med border-navy-border-med text-slate-100 rounded-tr-none"
                        : "bg-navy-surface border-navy-border text-slate-300 rounded-tl-none",
                      isConsecutive && "rounded-2xl"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-shrink-0 items-end gap-2 border-t border-navy-border px-3 py-3">
        <textarea
          ref={textareaRef}
          aria-label="Écrire un message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
          disabled={isSubmitting}
          maxLength={500}
          rows={1}
          placeholder="Écrire un message…"
          className="min-h-[38px] flex-1 resize-none rounded-lg border border-navy-border-med bg-navy-surface px-3 py-2 font-sans text-sm text-slate-100 placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-70 outline-none focus:border-white/30 transition-colors"
        />
        <IconButton
          type="submit"
          disabled={isSubmitting || draft.trim() === ''}
          aria-label="Envoyer le message"
          variant="ghost"
          className="h-[38px] w-[38px] border-0 bg-navy-surface-med text-slate-300 hover:bg-navy-surface-med hover:text-slate-100 disabled:opacity-40 cursor-pointer"
        >
          <Send size={15} aria-hidden="true" />
        </IconButton>
      </form>
    </>
  );
};

const DiscussionDrawer = () => {
  const { panels, viewport, messages, setMessages, sessionId, actorHeaders } = useSessionContext();
  const isOpen = panels.isDiscussionDrawerOpen;
  const isDesktop = viewport.isDesktop;
  const onClose = panels.closeDiscussionDrawer;

  // Reproduit à l'identique la dédup par id auparavant faite dans
  // SessionDashboard (`onMessageSent`) : un message reçu deux fois (envoi +
  // écho socket) ne doit pas apparaître deux fois dans la liste.
  const onMessageSent = useCallback((message: DiscussionPanelContentProps['messages'][number]) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, [setMessages]);

  const panelProps: DiscussionPanelContentProps = {
    onClose,
    messages,
    sessionId,
    actorHeaders,
    onMessageSent,
  };

  // Le panneau docké (desktop) ne passe pas par <Drawer>, qui portait la
  // fermeture au clavier : on la reproduit ici pour ce seul cas (le mode
  // overlay mobile garde celle de <Drawer>, pas la peine de la dupliquer).
  useEffect(() => {
    if (!isOpen || !isDesktop) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDesktop, onClose]);

  if (!isOpen) return null;

  // Desktop : panneau docké à côté des cartes (pas d'overlay), pour pouvoir
  // lire les cartes/commenter en même temps que discuter.
  if (isDesktop) {
    return (
      <aside
        role="complementary"
        aria-labelledby="discussion-drawer-title"
        className="flex w-[380px] flex-shrink-0 flex-col overflow-hidden border-l border-navy-border bg-navy-mid"
      >
        <DiscussionPanelContent {...panelProps} />
      </aside>
    );
  }

  // Mobile : pas la place pour un panneau permanent, on garde l'overlay plein écran.
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      labelledBy="discussion-drawer-title"
      overlayLabel="Fermer le panneau Discussion"
      side="full"
      size="md"
    >
      <DiscussionPanelContent {...panelProps} />
    </Drawer>
  );
};

export default DiscussionDrawer;
