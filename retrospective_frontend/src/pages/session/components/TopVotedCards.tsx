import type { RetroCard } from '../types/card.types';

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

export interface TopVotedCardsProps {
  cards: RetroCard[];
  formatColumns: string[];
  limit?: number;
  title?: string;
}

// Réutilisé par l'écran Résultats, le Récapitulatif et le Plan d'action :
// même logique de classement, seul le nombre de cartes affichées change.
const TopVotedCards = ({ cards, formatColumns, limit = 3, title }: TopVotedCardsProps) => {
  const categories = buildCategories(formatColumns);
  const sorted = [...cards].sort((a, b) => b.votesCount - a.votesCount);
  const top = sorted.slice(0, limit);

  if (top.length === 0) return null;

  return (
    <section aria-label={`Top ${limit} cartes`}>
      <h2 className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px] text-slate-400">
        <span aria-hidden="true">🏆</span> {title ?? `Top ${limit} des cartes`}
      </h2>
      <div className="flex flex-col gap-2">
        {top.map((card, index) => {
          const category = categories.find((c) => c.key === card.columnType) ?? categories[0];
          return (
            <article
              key={card.id}
              className="flex items-center gap-3 rounded-[10px] border border-navy-border border-l-[3px] bg-navy-mid px-3.5 py-2.5"
              style={{ borderLeftColor: category.color }}
            >
              <span className="flex-shrink-0 text-xl leading-none" aria-label={`Rang ${index + 1}`}>
                {RANK_ICONS[index] ?? `#${index + 1}`}
              </span>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[13px] leading-[1.4] text-slate-100 break-words">{card.content}</p>
                <span className="text-[11px] text-slate-500">{card.authorName}</span>
              </div>
              <div className="flex-shrink-0 text-center">
                <p className="font-mono text-lg font-bold leading-none" style={{ color: category.color }}>{card.votesCount}</p>
                <p className="text-[10px] text-slate-500">votes</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default TopVotedCards;
