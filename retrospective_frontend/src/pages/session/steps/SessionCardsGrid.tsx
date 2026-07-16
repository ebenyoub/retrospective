import RetroColumn from '../components/RetroColumn';
import type { SessionCardsGridProps } from './types/SessionCardsGrid.types';

const SessionCardsGrid = ({
  cards,
  columns,
  activeMobileColumn,
  isMobileViewport,
  currentUserId,
  canVote,
  canEdit,
  onSelectMobileColumn,
  onAddCard,
  onVote,
  onOpenComments,
  onUpdateCard,
  onDeleteCard,
}: SessionCardsGridProps) => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
    {/* Grille 3 colonnes Figma Make : gap:1px (gap-px), fond navy-border = séparateurs 1px */}
    <div className="relative grid flex-1 grid-cols-1 gap-px overflow-hidden bg-navy-border md:grid-cols-3">
      {isMobileViewport && (
        <div className="absolute inset-x-0 top-0 z-10 flex border-b border-navy-border bg-navy-mid/95 px-1 backdrop-blur">
          {columns.map((column) => {
            const isActive = activeMobileColumn === column.key;
            const count = cards.filter((card) => card.columnType === column.key).length;

            return (
              <button
                key={column.key}
                type="button"
                onClick={() => onSelectMobileColumn(column.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-1 py-2.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? `${column.tabActiveClassName} text-slate-50`
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="text-[14px] leading-none" role="img" aria-hidden="true">{column.emoji}</span>
                <span>{column.title}</span>
                <span
                  className={`rounded px-1.5 font-mono text-[10px] ${
                    isActive ? 'bg-navy-surface-med text-slate-200' : 'bg-navy-surface text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {columns.map((column) => (
        <RetroColumn
          key={column.key}
          className={isMobileViewport
            ? (activeMobileColumn === column.key ? 'pt-11' : 'hidden')
            : ''}
          title={column.title}
          emoji={column.emoji}
          color={column.color}
          dotClassName={column.dotClassName}
          accentClassName={column.accentClassName}
          emptyTitle={column.emptyTitle}
          emptyDescription={column.emptyDescription}
          cards={cards.filter((card) => card.columnType === column.key)}
          currentUserId={currentUserId}
          onAddCard={onAddCard ? (content) => onAddCard(column.key, content) : undefined}
          onVote={onVote}
          onOpenComments={onOpenComments}
          onUpdateCard={onUpdateCard}
          onDeleteCard={onDeleteCard}
          canVote={canVote}
          canEdit={canEdit}
        />
      ))}
    </div>
  </div>
);

export default SessionCardsGrid;
