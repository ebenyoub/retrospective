import Avatar from '@/components/ui/Avatar';
import type { RetroCard } from '../types/card.types';
import type { ResultCategory, SessionResultsProps } from './types/SessionResults.types';

const DEFAULT_CATEGORY_LABELS = ['Commencer', 'Arrêter', 'Continuer'];

const CATEGORY_META: Omit<ResultCategory, 'label'>[] = [
  { key: 'start', emoji: '💡', color: '#d97706', badgeBg: '#fef3c7', badgeText: '#78350f' },
  { key: 'stop', emoji: '🚧', color: '#dc2626', badgeBg: '#fee2e2', badgeText: '#7f1d1d' },
  { key: 'continue', emoji: '✅', color: '#16a34a', badgeBg: '#dcfce7', badgeText: '#14532d' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

const buildCategories = (formatColumns: string[]): ResultCategory[] => {
  const labels = formatColumns.length === 3 ? formatColumns : DEFAULT_CATEGORY_LABELS;
  return CATEGORY_META.map((category, index) => ({
    ...category,
    label: labels[index],
  }));
};

const categoryFor = (columnType: RetroCard['columnType'], categories: ResultCategory[]): ResultCategory =>
  categories.find((category) => category.key === columnType) ?? categories[0];

// Barre horizontale montrant le poids d'une carte par rapport à la plus votée.
const VoteBar = ({ votes, maxVotes, color }: { votes: number; maxVotes: number; color: string }) => {
  const percent = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
  return (
    <div className="mt-1 h-[3px] overflow-hidden rounded-[2px] bg-navy-border-med">
      <div className="h-full rounded-[2px] transition-[width] duration-500" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
};

const CategoryBadge = ({ category }: { category: ResultCategory }) => (
  <span
    className="whitespace-nowrap rounded-md px-[7px] py-px text-[10px] font-bold tracking-[0.3px]"
    style={{ background: category.badgeBg, color: category.badgeText }}
  >
    {category.label}
  </span>
);

// Carte du podium Top 3 : médaille, contenu, badge + auteur, barre et nombre de votes.
const Top3Card = ({ card, rank, maxVotes, categories }: { card: RetroCard; rank: number; maxVotes: number; categories: ResultCategory[] }) => {
  const category = categoryFor(card.columnType, categories);
  return (
    <article
      className="flex items-start gap-2.5 rounded-[10px] border border-navy-border border-l-[3px] bg-navy-mid px-3.5 py-2.5"
      style={{
        borderLeftColor: category.color,
        boxShadow: rank === 0 ? `0 0 20px ${category.color}12` : undefined,
      }}
    >
      <span className="flex-shrink-0 text-xl leading-none" aria-label={`Rang ${rank + 1}`}>
        {MEDALS[rank]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-[5px] text-[13px] leading-[1.4] text-slate-100 break-words">{card.content}</p>
        <div className="flex items-center gap-1.5">
          <CategoryBadge category={category} />
          <span className="text-[11px] text-slate-500">{card.authorName}</span>
        </div>
        <VoteBar votes={card.votesCount} maxVotes={maxVotes} color={category.color} />
      </div>
      <div className="flex-shrink-0 text-center">
        <p className="font-mono text-lg font-bold leading-none text-slate-50">{card.votesCount}</p>
        <p className="text-[10px] text-slate-500">votes</p>
      </div>
    </article>
  );
};

// Carte compacte affichée dans une colonne de catégorie.
const ResultCard = ({ card, category, maxVotes }: { card: RetroCard; category: ResultCategory; maxVotes: number }) => (
  <article
    className="rounded-[10px] border border-navy-border border-l-[3px] bg-navy-mid px-3 py-2.5"
    style={{ borderLeftColor: category.color }}
  >
    <div className="mb-1.5 flex items-center gap-[7px]">
      <Avatar name={card.authorName} colorSeed={card.authorId} size={18} fallback="P" />
      <span className="text-[11px] text-slate-500">{card.authorName}</span>
    </div>
    <p className="mb-2 text-[13px] leading-[1.45] text-slate-200 break-words">{card.content}</p>
    <VoteBar votes={card.votesCount} maxVotes={maxVotes} color={category.color} />
    <div className="mt-2 flex justify-end">
      <span className="font-mono text-xs font-bold" style={{ color: category.color }}>
        {card.votesCount} vote{card.votesCount !== 1 ? 's' : ''}
      </span>
    </div>
  </article>
);

const SessionResults = ({ cards, formatColumns, isDesktop }: SessionResultsProps) => {
  const categories = buildCategories(formatColumns);
  const sorted = [...cards].sort((a, b) => b.votesCount - a.votesCount);
  const maxVotes = Math.max(...cards.map((card) => card.votesCount), 1);
  const totalVotes = cards.reduce((sum, card) => sum + card.votesCount, 0);
  const top3 = sorted.slice(0, 3);

  const stats = [
    { label: 'Votes', value: totalVotes, color: '#d97706' },
    { label: 'Cartes', value: cards.length, color: '#16a34a' },
  ];

  // ── Desktop : barre de stats + Top 3 fixes, 3 colonnes à scroll indépendant,
  //    séparées par des filets de 1px (même technique que la vue écriture). ──
  if (isDesktop) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-navy-border px-6 py-2.5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-1.5 rounded-lg border border-navy-border-med bg-navy-surface px-3 py-[5px]"
            >
              <span className="font-mono text-sm font-bold" style={{ color: stat.color }}>
                {stat.value}
              </span>
              <span className="text-[11px] text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>

        {cards.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Aucune carte n'a été ajoutée pendant cette rétrospective.
          </p>
        ) : (
          <>
            <div className="flex-shrink-0 border-b border-navy-border px-6 pb-3 pt-3.5">
              <h2 className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.8px] text-slate-400">
                <span aria-hidden="true">🏆</span> Top 3 des cartes
              </h2>
              <div className="grid grid-cols-3 gap-2.5">
                {top3.map((card, index) => (
                  <Top3Card key={card.id} card={card} rank={index} maxVotes={maxVotes} categories={categories} />
                ))}
              </div>
            </div>

            <div className="grid flex-1 grid-cols-3 gap-px overflow-hidden bg-navy-border">
              {categories.map((category) => {
                const categoryCards = sorted.filter((card) => card.columnType === category.key);
                return (
                  <section key={category.key} className="flex flex-col overflow-hidden bg-navy">
                    <div className="flex flex-shrink-0 items-center gap-2 border-b border-navy-border px-4 pb-2 pt-2.5">
                      <span aria-hidden="true" className="text-sm">{category.emoji}</span>
                      <span className="text-xs font-bold" style={{ color: category.color }}>
                        {category.label}
                      </span>
                      <span className="ml-auto font-mono text-[11px] text-slate-500">
                        {categoryCards.length} carte{categoryCards.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-2">
                      {categoryCards.length === 0 ? (
                        <p className="py-6 text-center text-xs text-slate-600">Aucune carte</p>
                      ) : (
                        categoryCards.map((card) => (
                          <ResultCard key={card.id} card={card} category={category} maxVotes={maxVotes} />
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Mobile : une seule colonne scrollable, comme le prototype Figma. ──
  return (
    <div className="flex-1 overflow-y-auto px-3 py-4">
      <div className="mb-6 flex flex-wrap gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-[100px] flex-1 rounded-[10px] border border-navy-border bg-navy-mid px-3.5 py-2.5">
            <p className="font-mono text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[11px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {cards.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">
          Aucune carte n'a été ajoutée pendant cette rétrospective.
        </p>
      ) : (
        <>
          <section className="mb-7">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.8px] text-slate-400">
              <span aria-hidden="true">🏆</span> Top 3 des cartes
            </h2>
            <div className="flex flex-col gap-1.5">
              {top3.map((card, index) => (
                <Top3Card key={card.id} card={card} rank={index} maxVotes={maxVotes} categories={categories} />
              ))}
            </div>
          </section>

          {categories.map((category) => {
            const categoryCards = sorted.filter((card) => card.columnType === category.key);
            if (categoryCards.length === 0) return null;
            return (
              <section key={category.key} className="mb-6">
                <div className="mb-2.5 flex items-center gap-2">
                  <span aria-hidden="true" className="text-base">{category.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-[0.8px] text-slate-400">{category.label}</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {categoryCards.length} carte{categoryCards.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {categoryCards.map((card) => (
                    <ResultCard key={card.id} card={card} category={category} maxVotes={maxVotes} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
};

export default SessionResults;
