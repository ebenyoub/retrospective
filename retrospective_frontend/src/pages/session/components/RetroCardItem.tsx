import { MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Avatar from "@/components/ui/Avatar";
import type { RetroCardItemProps } from './types/RetroCardItem.types';
import CardCommentsSection from './CardCommentsSection';
import { useSessionContext } from '../context/useSessionContext';

const RetroCardItem = ({ card, accentClassName, currentUserId, onVote, onUpdateCard, onDeleteCard, canVote = true, canEdit = true }: RetroCardItemProps) => {
  const { lastCommentAdded, details, panels } = useSessionContext();
  // Le nombre de votes n'a pas de sens tant que le vote n'a pas commencé :
  // masqué à l'étape Écriture, affiché dès le vote (RetroCardItem n'est
  // utilisé qu'à ces deux étapes, jamais après).
  const showVotesCount = details.step !== 'writing';
  // Un seul panneau de commentaires ouvert à la fois (toutes cartes
  // confondues), état centralisé dans useSessionPanels : ouvrir celui d'une
  // carte ferme automatiquement celui d'une autre, pour économiser l'espace.
  const isCommentsExpanded = panels.openCommentsCardId === card.id;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(card.content);
  const [isCommentsBlinking, setIsCommentsBlinking] = useState(false);
  // Dernier événement déjà traité par cette carte : comparé pendant le rendu
  // plutôt que dans un effet, pour éviter un setState synchrone dans le corps
  // d'un effet (rendu en cascade évitable, voir react.dev/learn/you-might-not-need-an-effect).
  const [lastSeenCommentEvent, setLastSeenCommentEvent] = useState(lastCommentAdded);

  if (lastCommentAdded !== lastSeenCommentEvent) {
    setLastSeenCommentEvent(lastCommentAdded);

    if (
      lastCommentAdded &&
      lastCommentAdded.cardId === card.id &&
      lastCommentAdded.comment.authorId !== currentUserId
    ) {
      setIsCommentsBlinking(true);
    }
  }

  const isAuthor = currentUserId === card.authorId;
  const canUpdate = onUpdateCard && isAuthor && canEdit;
  const canDelete = onDeleteCard && isAuthor && canEdit;

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextContent = draftContent.trim();
    if (!nextContent || !onUpdateCard) return;

    const isUpdated = await onUpdateCard(card.id, nextContent);
    if (isUpdated) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setDraftContent(card.content);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setDraftContent(card.content);
    setIsEditing(true);
  };

  // Un clic en dehors de la carte referme ses commentaires s'ils sont
  // ouverts. Le bouton "Commentaires" qui bascule l'ouverture est lui-même
  // à l'intérieur de ce conteneur (cardRef) : jamais traité comme un clic
  // extérieur, donc pas de risque de refermer puis rouvrir (contrairement à
  // DiscussionDrawer, `mousedown` est sûr ici).
  useEffect(() => {
    if (!isCommentsExpanded) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (cardRef.current?.contains(event.target as Node)) return;
      panels.toggleComments(card.id);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCommentsExpanded, panels, card.id]);

  return (
    <div ref={cardRef} className={`bg-navy-mid border border-navy-border border-l-[3px] ${accentClassName} rounded-figma-md p-[10px_12px] flex flex-col gap-2 transition-all`}>
      
      {/* Top Section: Avatar + Author Name */}
      {!isEditing && (
        <div className="flex items-center gap-1.5 shrink-0">
          <Avatar name={card.authorName} colorSeed={card.authorId} size={18} fallback="P" />
          <span className="font-sans text-[12px] text-slate-400 font-medium select-none">{card.authorName}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2 w-full">
          <textarea
            aria-label="Modifier le contenu de la carte"
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-[9px] border border-navy-border-med bg-navy-surface px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-white/30 transition-colors"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="h-auto text-xs font-semibold bg-white/10 text-slate-100 hover:bg-white/20 rounded-[8px] px-2.5 py-1 transition-all cursor-pointer border-none"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={draftContent.trim() === ""}
              className="h-auto text-xs font-semibold text-slate-100 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 disabled:cursor-not-allowed rounded-[8px] px-2.5 py-1 transition-all cursor-pointer border-none"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-100 font-sans leading-[1.55] break-words">{card.content}</p>
      )}

      {/* Action Buttons Section */}
      <div className="flex items-center justify-end gap-2 mt-1.5 flex-wrap">
        {showVotesCount && (
          <span className="text-xs font-mono text-slate-400 select-none mr-auto">
            {card.votesCount} vote{card.votesCount !== 1 ? "s" : ""}
          </span>
        )}
        {!isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              panels.toggleComments(card.id);
              setIsCommentsBlinking(false);
            }}
            aria-label="Commentaires"
            aria-expanded={isCommentsExpanded}
            aria-controls={`card-comments-${card.id}`}
            className={`h-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-300 bg-transparent hover:bg-navy-surface rounded-[8px] border border-transparent hover:border-navy-border px-2 py-1.5 transition-all cursor-pointer ${
              isCommentsBlinking ? 'animate-pulse border-green-figma/50 bg-green-figma/10 text-green-figma' : ''
            }`}
          >
            <MessageCircle size={13} aria-hidden="true" />
            <span>Commentaires{card.commentsCount > 0 ? ` (${card.commentsCount})` : ''}</span>
          </Button>
        )}
        {canUpdate && !isEditing && (
          <IconButton
            size="xs"
            onClick={handleStartEdit}
            aria-label="Modifier"
            title="Modifier"
            className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-navy-border bg-transparent text-slate-400 transition-all cursor-pointer hover:bg-navy-surface hover:text-slate-200"
          >
            <Pencil size={13} aria-hidden="true" />
          </IconButton>
        )}
        {canDelete && !isEditing && (
          <IconButton
            variant="danger"
            size="xs"
            onClick={() => onDeleteCard(card.id)}
            aria-label="Supprimer"
            title="Supprimer"
            className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-red-500/20 bg-transparent text-red-400 transition-all cursor-pointer hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 size={13} aria-hidden="true" />
          </IconButton>
        )}
        {!isEditing && canVote && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onVote(card.id)}
            disabled={card.votedByMe}
            className={`h-auto text-xs font-semibold rounded-[8px] border px-2.5 py-1.5 transition-all cursor-pointer ${
              card.votedByMe
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 cursor-not-allowed opacity-80"
                : "text-slate-200 hover:text-white bg-navy-surface-med hover:bg-white/10 border-navy-border"
            }`}
          >
            {card.votedByMe ? "Voté" : "Voter"}
          </Button>
        )}
      </div>

      {isCommentsExpanded && (
        <CardCommentsSection cardId={card.id} />
      )}
    </div>
  );
};

export default RetroCardItem;
