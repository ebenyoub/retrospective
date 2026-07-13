import { useState, type FormEvent } from "react";

export interface RetroCard {
  id: number;
  sessionId: number;
  authorId: number;
  authorName: string;
  columnType: "start" | "stop" | "continue";
  content: string;
  createdAt: string;
  votesCount: number;
}

interface RetroCardItemProps {
  card: RetroCard;
  accentClassName: string;
  currentUserId: number | null;
  onVote: (cardId: number) => Promise<void> | void;
  onUpdateCard?: (cardId: number, content: string) => Promise<boolean> | boolean;
  onDeleteCard?: (cardId: number) => Promise<void> | void;
  canVote?: boolean;
  canEdit?: boolean;
}

// Générateur de couleur déterministe pour l'avatar basé sur l'authorId
const getAvatarColor = (id: number) => {
  const colors = [
    '#3b82f6', // bleu
    '#ef4444', // rouge
    '#10b981', // vert
    '#f59e0b', // orange
    '#8b5cf6', // violet
    '#ec4899', // rose
    '#14b8a6', // turquoise
    '#6366f1', // indigo
  ];
  return colors[id % colors.length];
};

const Avatar = ({ name, color, size = 18 }: { name: string; color: string; size?: number }) => {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'P';
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-full font-sans font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.45,
      }}
    >
      {initials}
    </div>
  );
};

const RetroCardItem = ({ card, accentClassName, currentUserId, onVote, onUpdateCard, onDeleteCard, canVote = true, canEdit = true }: RetroCardItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(card.content);
  
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

  return (
    <div className={`bg-navy-mid border border-navy-border border-l-[3px] ${accentClassName} rounded-[10px] p-[10px_12px] flex flex-col gap-2 transition-all`}>
      
      {/* Top Section: Avatar + Author Name */}
      {!isEditing && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Avatar name={card.authorName} color={getAvatarColor(card.authorId)} size={18} />
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
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs font-semibold bg-white/10 text-slate-100 hover:bg-white/20 rounded-[8px] px-2.5 py-1 transition-all cursor-pointer border-none"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={draftContent.trim() === ""}
              className="text-xs font-semibold text-slate-100 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 disabled:cursor-not-allowed rounded-[8px] px-2.5 py-1 transition-all cursor-pointer border-none"
            >
              Enregistrer
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-100 font-sans leading-[1.55] break-words">{card.content}</p>
      )}

      {/* Action Buttons Section */}
      <div className="flex items-center justify-end gap-2 mt-1.5 flex-wrap">
        <span className="text-xs font-mono text-slate-400 select-none mr-auto">
          {card.votesCount} vote{card.votesCount !== 1 ? "s" : ""}
        </span>
        {canUpdate && !isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 bg-transparent hover:bg-navy-surface rounded-[8px] border border-navy-border px-2.5 py-1.5 transition-all cursor-pointer"
          >
            Modifier
          </button>
        )}
        {canDelete && !isEditing && (
          <button
            type="button"
            onClick={() => onDeleteCard(card.id)}
            className="text-xs font-semibold text-red-400 hover:text-red-300 bg-transparent hover:bg-red-500/10 rounded-[8px] border border-red-500/20 px-2.5 py-1.5 transition-all cursor-pointer"
          >
            Supprimer
          </button>
        )}
        {!isEditing && canVote && (
          <button
            type="button"
            onClick={() => onVote(card.id)}
            className="text-xs font-semibold text-slate-200 hover:text-white bg-navy-surface-med hover:bg-white/10 rounded-[8px] border border-navy-border px-2.5 py-1.5 transition-all cursor-pointer"
          >
            Voter
          </button>
        )}
      </div>
    </div>
  );
};

export default RetroCardItem;
