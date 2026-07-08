import Button from "@/components/ui/Button";
import { useState, type FormEvent } from "react";

export interface RetroCard {
  id: number;
  sessionId: number;
  authorId: number;
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
}

const RetroCardItem = ({ card, accentClassName, currentUserId, onVote, onUpdateCard, onDeleteCard }: RetroCardItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(card.content);
  const isAuthor = currentUserId === card.authorId;
  const canUpdate = onUpdateCard && isAuthor;
  const canDelete = onDeleteCard && isAuthor;

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
    <div className={`bg-slate-800 border border-white/10 border-l-4 ${accentClassName} rounded-lg p-3`}>
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
          <textarea
            aria-label="Modifier le contenu de la carte"
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-white/30"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs font-semibold bg-white/10 text-slate-100 hover:bg-white/20 hover:text-slate-100 rounded-md px-2 py-1 p-1 shadow-none"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={draftContent.trim() === ""}
              className="text-xs font-semibold text-slate-100 bg-white/10 hover:bg-white/20 rounded-md px-2 py-1 p-1 shadow-none hover:text-slate-100"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-100 leading-relaxed break-words">{card.content}</p>
      )}
      <div className="flex items-center justify-end gap-2 mt-2 flex-wrap">
        <span className="text-xs font-mono text-slate-400">
          {card.votesCount} vote{card.votesCount !== 1 ? "s" : ""}
        </span>
        {canUpdate && !isEditing && (
          <Button
            type="button"
            onClick={handleStartEdit}
            className="text-xs font-semibold text-slate-100 bg-white/10 hover:bg-white/20 rounded-md px-2 py-1 p-1 shadow-none hover:text-slate-100"
          >
            Modifier
          </Button>
        )}
        {canDelete && !isEditing && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDeleteCard(card.id)}
            className="text-xs font-semibold rounded-md px-2 py-1 p-1 shadow-none hover:text-white"
          >
            Supprimer
          </Button>
        )}
        {!isEditing && (
          <Button
            type="button"
            onClick={() => onVote(card.id)}
            className="text-xs font-semibold text-slate-100 bg-white/10 hover:bg-white/20 rounded-md px-2 py-1 p-1 shadow-none hover:text-slate-100"
          >
            Voter
          </Button>
        )}
      </div>
    </div>
  );
};

export default RetroCardItem;
