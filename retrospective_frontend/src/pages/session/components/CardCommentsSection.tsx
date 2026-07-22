import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState, useContext } from 'react';
import IconButton from '@/components/ui/IconButton';
import Avatar from '@/components/ui/Avatar';
import { useToast } from '@/context/toast/useToast';
import { getApiErrorMessage, NETWORK_ERROR_MESSAGE } from '@/lib/apiError';

import type { CardComment } from '../types/comment.types';
import { createComment, deleteComment, getComments } from '../services/commentApi';
import { SessionContext } from '../context/SessionContext';

interface CardCommentsSectionProps {
  cardId: number;
}

const CardCommentsSection = ({ cardId }: CardCommentsSectionProps) => {
  const session = useContext(SessionContext);
  const { addToast } = useToast();

  const [comments, setComments] = useState<CardComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draftContent, setDraftContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) {
    throw new Error('CardCommentsSection must be used within a SessionContext.Provider');
  }

  const { sessionId, actorHeaders, selfParticipantId, onCommentsChanged, isReadOnly } = session;

  const loadComments = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await getComments(sessionId, actorHeaders, cardId);
      if (result.ok) {
        setComments(result.data);
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de charger les commentaires.'));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, actorHeaders, cardId, addToast]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    const content = draftContent.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await createComment(sessionId, actorHeaders, cardId, content);
      if (result.ok) {
        setComments((previous) => [...previous, result.data]);
        setDraftContent('');
        onCommentsChanged?.();
      } else {
        addToast('error', getApiErrorMessage(result.payload, "Impossible d'ajouter le commentaire."));
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire :", error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }, [draftContent, isSubmitting, sessionId, actorHeaders, cardId, addToast, onCommentsChanged]);

  const handleDelete = useCallback(async (commentId: number): Promise<void> => {
    try {
      const result = await deleteComment(sessionId, actorHeaders, cardId, commentId);
      if (result.ok) {
        setComments((previous) => previous.filter((comment) => comment.id !== commentId));
        onCommentsChanged?.();
      } else {
        addToast('error', getApiErrorMessage(result.payload, 'Impossible de supprimer le commentaire.'));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire :', error);
      addToast('error', NETWORK_ERROR_MESSAGE);
    }
  }, [sessionId, actorHeaders, cardId, addToast, onCommentsChanged]);

  return (
    <div
      role="region"
      aria-label="Discussion"
      className="mt-3 pt-3 border-t border-navy-border flex flex-col gap-3 font-sans"
      id={`card-comments-${cardId}`}
    >
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold select-none">
        <MessageCircle size={13} aria-hidden="true" />
        <span>Discussion</span>
      </div>

      {isLoading ? (
        <p className="text-center text-xs text-slate-500 py-2">Chargement des commentaires...</p>
      ) : comments.length === 0 ? (
        <p className="text-center text-xs text-slate-500 py-2">Aucun commentaire pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2 text-xs text-left">
              <Avatar name={comment.authorName} colorSeed={comment.authorId} size={22} fontSize={10} />
              <div className="min-w-0 flex-1 bg-navy-surface rounded-lg p-2 border border-navy-border-med">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-slate-200">
                    {comment.authorName}
                  </span>
                  {!isReadOnly && comment.authorId === selfParticipantId && (
                    <IconButton
                      onClick={() => void handleDelete(comment.id)}
                      aria-label="Supprimer le commentaire"
                      variant="ghost"
                      size="xs"
                      className="h-5 w-5 border-0 text-slate-500 hover:text-red-400 p-0 cursor-pointer"
                    >
                      <Trash2 size={11} aria-hidden="true" />
                    </IconButton>
                  )}
                </div>
                <p className="mt-1 leading-relaxed text-slate-300 break-words font-normal">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isReadOnly && <div className="flex items-end gap-2 mt-1">
        <textarea
          aria-label="Écrire un commentaire"
          value={draftContent}
          onChange={(event) => setDraftContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit();
            }
          }}
          disabled={isSubmitting}
          maxLength={280}
          rows={1}
          placeholder="Écrire un commentaire…"
          className="min-h-[34px] flex-1 resize-none rounded-lg border border-navy-border-med bg-navy-surface px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <IconButton
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || draftContent.trim() === ''}
          aria-label="Envoyer le commentaire"
          variant="ghost"
          size="sm"
          className="border-0 bg-navy-surface-med text-slate-300 hover:bg-navy-surface-med hover:text-slate-100 disabled:opacity-40 h-[34px] w-[34px] cursor-pointer"
        >
          <Send size={13} aria-hidden="true" />
        </IconButton>
      </div>}
    </div>
  );
};

export default CardCommentsSection;
