import RetroCardItem, { type RetroCard } from "./RetroCardItem";
import RetroAddCardForm from "./RetroAddCardForm";
import { cn } from "@/lib/utils";

interface RetroColumnProps {
  className?: string;
  title: string;
  dotClassName: string;
  accentClassName: string;
  cards: RetroCard[];
  emptyMessage: string;
  currentUserId: number | null;
  onAddCard?: (content: string) => Promise<void> | void;
  onVote: (cardId: number) => Promise<void> | void;
  onUpdateCard?: (cardId: number, content: string) => Promise<boolean> | boolean;
  onDeleteCard?: (cardId: number) => Promise<void> | void;
  canVote?: boolean;
  canEdit?: boolean;
}

const RetroColumn = ({
  className,
  title,
  dotClassName,
  accentClassName,
  cards,
  emptyMessage,
  currentUserId,
  onAddCard,
  onVote,
  onUpdateCard,
  onDeleteCard,
  canVote = true,
  canEdit = true,
}: RetroColumnProps) => {
  return (
    <div className={cn("flex flex-col bg-navy border border-navy-border rounded-figma-xl overflow-hidden min-h-64", className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-navy-border h-[44px]">
        <span className={`w-2.5 h-2.5 rounded-full ${dotClassName} shrink-0`} />
        <span className="text-xs font-bold text-slate-200 font-sans">{title}</span>
        <span className="ml-auto font-mono text-[11px] text-slate-500 bg-navy-surface-med rounded-[5px] px-1.5 py-0.5">
          {cards.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-[10px_12px] overflow-y-auto">
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
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
              canVote={canVote}
              canEdit={canEdit}
            />
          ))
        )}
      </div>

      {onAddCard && <RetroAddCardForm onAddCard={onAddCard} />}
    </div>
  );
};

export default RetroColumn;
