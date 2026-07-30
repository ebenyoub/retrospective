import { MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { RetroCard } from '../types/card.types';
import { useSessionPanelsState } from '../context/useSessionContext';
import CardCommentsSection from './CardCommentsSection';

const DEFAULT_CATEGORY_LABELS = ['Commencer', 'Arrêter', 'Continuer'];

const CATEGORY_META: { key: RetroCard['columnType']; color: string }[] = [
  { key: 'start', color: '#d97706' },
  { key: 'stop', color: '#dc2626' },
  { key: 'continue', color: '#16a34a' },
];

// Médaille pour les 3 premiers rangs, pastille numérotée au-delà (jusqu'au
// Top 5 utilisé aujourd'hui — le fallback #N couvre toute limite plus grande).
const RANK_ICONS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

const buildCategories = (formatColumns: string[]) => {
  const labels = formatColumns.length === 3 ? formatColumns : DEFAULT_CATEGORY_LABELS;
  return CATEGORY_META.map((category, index) => ({ ...category, label: labels[index] }));
};

// Choix proposés quand l'écran permet de changer le nombre de cartes
// affichées (voir onLimitChange) : couvre les usages courants sans
// surcharger le menu.
const LIMIT_OPTIONS = [3, 5, 10];

export interface TopVotedCardsProps {
  cards: RetroCard[];
  formatColumns: string[];
  limit?: number;
  title?: string;
  onLimitChange?: (limit: number) => void;
  showComments?: boolean;
}

// Carte du podium avec bouton "Commentaires" optionnel : composant à part
// pour pouvoir lire le contexte de session (accordéon global) par carte.
const TopVotedCardItem = ({
  card,
  index,
  color,
  showComments,
}: {
  card: RetroCard;
  index: number;
  color: string;
  showComments: boolean;
}) => {
  const panels = useSessionPanelsState();
  const isCommentsExpanded = showComments && panels.openCommentsCardId === card.id;

  return (
    <article
      className="rounded-[10px] border border-navy-border border-l-[3px] bg-navy-mid px-3.5 py-2.5"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 text-xl leading-none" aria-label={`Rang ${index + 1}`}>
          {RANK_ICONS[index] ?? `#${index + 1}`}
        </span>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[13px] leading-[1.4] text-slate-100 break-words">{card.content}</p>
          <span className="text-[11px] text-slate-500">{card.authorName}</span>
        </div>
        <div className="flex-shrink-0 text-center">
          <p className="font-mono text-lg font-bold leading-none" style={{ color }}>{card.votesCount}</p>
          <p className="text-[10px] text-slate-500">votes</p>
        </div>
      </div>

      {showComments && (
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => panels.toggleComments(card.id)}
            aria-label="Commentaires"
            aria-expanded={isCommentsExpanded}
            aria-controls={`card-comments-${card.id}`}
            className="h-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-300 bg-transparent hover:bg-navy-surface rounded-[8px] border border-transparent hover:border-navy-border px-2 py-1.5 transition-all cursor-pointer"
          >
            <MessageCircle size={13} aria-hidden="true" />
            <span>Commentaires{card.commentsCount > 0 ? ` (${card.commentsCount})` : ''}</span>
          </Button>
        </div>
      )}

      {isCommentsExpanded && <CardCommentsSection cardId={card.id} />}
    </article>
  );
};

// Réutilisé par l'écran Résultats, le Récapitulatif et le Plan d'action :
// même logique de classement, seul le nombre de cartes affichées change.
// Le sélecteur de nombre de cartes n'apparaît que si onLimitChange est fourni
// (Plan d'action) ; Résultats/Récapitulatif gardent une limite fixe. Idem
// pour les commentaires (showComments), spécifiques au Plan d'action.
const TopVotedCards = ({ cards, formatColumns, limit = 3, title, onLimitChange, showComments = false }: TopVotedCardsProps) => {
  const categories = buildCategories(formatColumns);
  const sorted = [...cards].sort((a, b) => b.votesCount - a.votesCount);
  const top = sorted.slice(0, limit);

  if (top.length === 0) return null;

  return (
    <section aria-label={`Top ${limit} cartes`}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px] text-slate-400">
          <span aria-hidden="true">🏆</span> {title ?? `Top ${limit} des cartes`}
        </h2>
        {onLimitChange && (
          <select
            aria-label="Nombre de cartes affichées dans le podium"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="rounded-[8px] border border-navy-border-med bg-navy-surface px-2 py-1 font-sans text-[11px] font-medium text-slate-300 outline-none transition-colors cursor-pointer focus:border-white/40"
          >
            {LIMIT_OPTIONS.map((option) => (
              <option key={option} value={option}>Top {option}</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {top.map((card, index) => {
          const category = categories.find((c) => c.key === card.columnType) ?? categories[0];
          return (
            <TopVotedCardItem
              key={card.id}
              card={card}
              index={index}
              color={category.color}
              showComments={showComments}
            />
          );
        })}
      </div>
    </section>
  );
};

export default TopVotedCards;
