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
import type { DiscussionDrawerProps } from './types/DiscussionDrawer.types';

const formatTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const DiscussionDrawer = ({
  isOpen,
  isDesktop,
  onClose,
  messages,
  sessionId,
  actorHeaders,
  onMessageSent,
}: DiscussionDrawerProps) => {
  const { addToast } = useToast();
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Défilement automatique au bas lors de la réception de messages ou à l'ouverture du drawer
  useEffect(() => {
    if (isOpen) {
      // Un léger délai permet au rendu du drawer d'être effectif avant le scroll
      const timer = setTimeout(() => scrollToBottom('auto'), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages, isOpen, scrollToBottom]);

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
    </Drawer>
  );
};

export default DiscussionDrawer;
