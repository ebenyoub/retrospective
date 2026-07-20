import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import type { ActionItem } from '../types/action.types';
import type { SummaryStepProps } from './types/SummaryStep.types';
import TopVotedCards from '../components/TopVotedCards';

const PRIORITY_META: Record<ActionItem['priority'], { label: string; color: string; badgeClassName: string }> = {
  high: { label: 'Haute', color: '#f87171', badgeClassName: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium: { label: 'Moyenne', color: '#fbbf24', badgeClassName: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { label: 'Basse', color: '#60a5fa', badgeClassName: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

const StatTile = ({ label, value, sublabel, color }: { label: string; value: string | number; sublabel: string; color: string }) => (
  <div className="rounded-xl border border-navy-border bg-navy-mid px-4 py-3.5">
    <p className="mb-0.5 font-mono text-xl font-bold" style={{ color }}>{value}</p>
    <p className="mb-0.5 text-[13px] font-semibold text-slate-300">{label}</p>
    <p className="text-[11px] text-slate-500">{sublabel}</p>
  </div>
);

const SectionHeader = ({ label, icon, count }: { label: string; icon?: string; count?: number }) => (
  <div className="mb-2.5 flex items-center gap-2">
    {icon && <span aria-hidden="true">{icon}</span>}
    <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-slate-400">{label}</span>
    {count !== undefined && (
      <span className="rounded-md bg-navy-surface-med px-1.5 font-mono text-[11px] text-slate-600">{count}</span>
    )}
  </div>
);

const SummaryStep = ({
  sessionName,
  cards,
  actions,
  participants,
  formatColumns,
}: SummaryStepProps) => {
  const totalVotes = cards.reduce((sum, card) => sum + card.votesCount, 0);
  const totalComments = cards.reduce((sum, card) => sum + card.commentsCount, 0);
  const onlineCount = participants.filter((participant) => participant.status === 'online').length;

  const stats = [
    { label: 'Participants', value: participants.length, sublabel: `${onlineCount} en ligne`, color: '#16a34a' },
    { label: 'Total des votes', value: totalVotes, sublabel: `${cards.length} cartes votées`, color: '#d97706' },
    { label: 'Commentaires', value: totalComments, sublabel: "échanges de l'équipe", color: '#94a3b8' },
    { label: 'Actions créées', value: actions.length, sublabel: 'à réaliser', color: '#16a34a' },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-navy-border px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-slate-500">Récapitulatif final</span>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">✓ Prêt à clôturer</Badge>
          </div>
          <h2 className="text-sm font-bold text-slate-100">{sessionName}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <section aria-label="Statistiques de session" className="mb-7">
          <SectionHeader label="Vue d'ensemble" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {stats.map((stat) => (
              <StatTile key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        {cards.length > 0 && (
          <section aria-label="Top 3 cartes" className="mb-7">
            <TopVotedCards cards={cards} formatColumns={formatColumns} limit={3} />
          </section>
        )}

        <section aria-label="Participants" className="mb-7">
          <SectionHeader label="Participants" count={participants.length} />
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 rounded-[10px] border border-navy-border bg-navy-mid px-3 py-1.5">
                <Avatar name={participant.displayName} colorSeed={participant.displayName} size={22} />
                <span className="text-[13px] font-medium text-slate-300">{participant.displayName}</span>
                {participant.role === 'facilitator' && (
                  <span className="text-[10px] font-bold text-amber-300">Facilitateur</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Plan d'action" className="mb-4">
          <SectionHeader label="Plan d'action" count={actions.length} />
          {actions.length === 0 ? (
            <p className="text-[13px] text-slate-500">Aucune action n'a été définie.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {actions.map((item) => {
                const meta = PRIORITY_META[item.priority];
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-[10px] border border-navy-border border-l-[3px] bg-navy-mid px-3.5 py-2.5 sm:flex-row sm:items-center sm:gap-3"
                    style={{ borderLeftColor: meta.color }}
                  >
                    <p className="min-w-0 flex-1 text-[13px] leading-[1.4] text-slate-200 break-words">{item.description}</p>
                    <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                      <Badge className={meta.badgeClassName}>{meta.label}</Badge>
                      <span className="text-xs font-medium text-slate-400">{item.owner}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SummaryStep;
