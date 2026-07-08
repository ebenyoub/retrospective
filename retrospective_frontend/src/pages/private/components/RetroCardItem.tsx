import Button from "@/components/ui/Button";

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
  onDeleteCard?: (cardId: number) => Promise<void> | void;
}

const RetroCardItem = ({ card, accentClassName, currentUserId, onVote, onDeleteCard }: RetroCardItemProps) => {
  const canDelete = onDeleteCard && currentUserId === card.authorId;

  return (
    <div className={`bg-slate-800 border border-white/10 border-l-4 ${accentClassName} rounded-lg p-3`}>
      <p className="text-sm text-slate-100 leading-relaxed">{card.content}</p>
      <div className="flex items-center justify-end gap-2 mt-2 flex-wrap">
        <span className="text-xs font-mono text-slate-400">
          {card.votesCount} vote{card.votesCount !== 1 ? "s" : ""}
        </span>
        {canDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDeleteCard(card.id)}
            className="text-xs font-semibold rounded-md px-2 py-1 p-1 shadow-none hover:text-white"
          >
            Supprimer
          </Button>
        )}
        <Button
          type="button"
          onClick={() => onVote(card.id)}
          className="text-xs font-semibold text-slate-100 bg-white/10 hover:bg-white/20 rounded-md px-2 py-1 p-1 shadow-none hover:text-slate-100"
        >
          Voter
        </Button>
      </div>
    </div>
  );
};

export default RetroCardItem;
