import RetroCardItem, { type RetroCard } from "./RetroCardItem";
import RetroAddCardForm from "./RetroAddCardForm";
import Badge from "@/components/ui/Badge";

interface RetroColumnProps {
  title: string;
  dotClassName: string;
  accentClassName: string;
  cards: RetroCard[];
  emptyMessage: string;
  currentUserId: number | null;
  onAddCard?: (content: string) => Promise<void> | void;
  onVote: (cardId: number) => Promise<void> | void;
  onDeleteCard?: (cardId: number) => Promise<void> | void;
}

const RetroColumn = ({
  title,
  dotClassName,
  accentClassName,
  cards,
  emptyMessage,
  currentUserId,
  onAddCard,
  onVote,
  onDeleteCard,
}: RetroColumnProps) => {
  return (
    <div className="flex flex-col bg-slate-900 border border-white/10 rounded-xl overflow-hidden min-h-64">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className={`w-2.5 h-2.5 rounded-full ${dotClassName}`} />
        <span className="text-sm font-bold text-slate-200">{title}</span>
        <Badge className="ml-auto text-slate-500 py-0.5">{cards.length}</Badge>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
        {cards.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">{emptyMessage}</p>
        ) : (
          cards.map((card) => (
            <RetroCardItem
              key={card.id}
              card={card}
              accentClassName={accentClassName}
              currentUserId={currentUserId}
              onVote={onVote}
              onDeleteCard={onDeleteCard}
            />
          ))
        )}
      </div>

      {onAddCard && <RetroAddCardForm onAddCard={onAddCard} />}
    </div>
  );
};

export default RetroColumn;
