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
  onVote: (cardId: number) => Promise<void> | void;
}

const RetroCardItem = ({ card, accentClassName, onVote }: RetroCardItemProps) => {
  return (
    <div className={`bg-slate-800 border border-white/10 border-l-4 ${accentClassName} rounded-lg p-3`}>
      <p className="text-sm text-slate-100 leading-relaxed">{card.content}</p>
      <div className="flex items-center justify-end gap-2 mt-2">
        <span className="text-xs font-mono text-slate-400">
          {card.votesCount} vote{card.votesCount !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => onVote(card.id)}
          className="text-xs font-semibold text-slate-100 bg-white/10 hover:bg-white/20 rounded-md px-2 py-1 cursor-pointer"
        >
          Voter
        </button>
      </div>
    </div>
  );
};

export default RetroCardItem;
