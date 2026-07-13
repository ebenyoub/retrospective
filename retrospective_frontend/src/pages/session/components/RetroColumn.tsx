import RetroCardItem, { type RetroCard } from "./RetroCardItem";
import RetroAddCardForm from "./RetroAddCardForm";
import EmptyState from "./EmptyState";
import { cn } from "@/lib/utils";

interface RetroColumnProps {
  className?: string;
  title: string;
  emoji: string;
  dotClassName: string;
  accentClassName: string;
  /** Couleur hexadécimale de la colonne (ex: '#16a34a') pour le formulaire d'ajout. */
  color: string;
  cards: RetroCard[];
  emptyTitle: string;
  emptyDescription: string;
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
  emoji,
  dotClassName,
  accentClassName,
  color,
  cards,
  emptyTitle,
  emptyDescription,
  currentUserId,
  onAddCard,
  onVote,
  onUpdateCard,
  onDeleteCard,
  canVote = true,
  canEdit = true,
}: RetroColumnProps) => {
  return (
    <div className={cn("flex flex-col bg-navy min-h-0 overflow-hidden", className)}>
      {/* En-tête colonne */}
      <div className="flex flex-shrink-0 items-center gap-2 px-4 py-[12px] border-b border-navy-border">
        <span className={`w-2.5 h-2.5 rounded-full ${dotClassName} shrink-0`} />
        <span className="text-[13px] font-bold text-slate-200 font-sans">{title}</span>
        <span className="ml-auto font-mono text-[11px] text-slate-500 bg-navy-surface-med rounded-[5px] px-1.5 py-0.5 select-none">
          {cards.length}
        </span>
      </div>

      {/* Liste des cartes — scroll indépendant par colonne */}
      <div className="flex-1 flex flex-col gap-2 p-[10px_12px] overflow-y-auto min-h-0">
        {cards.length === 0 ? (
          <EmptyState
            icon={emoji}
            title={emptyTitle}
            description={emptyDescription}
          />
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

      {onAddCard && <RetroAddCardForm color={color} onAddCard={onAddCard} />}
    </div>
  );
};

export default RetroColumn;
