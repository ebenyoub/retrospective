import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import type { ActionItem } from '../types/action.types';
import type { ActionStepProps } from './types/ActionStep.types';
import { useSessionActionsState, useSessionCardsState, useSessionDetailsState, useSessionIdentityState } from '../context/useSessionContext';
import TopVotedCards from '../components/TopVotedCards';

type Priority = ActionItem['priority'];

const PRIORITY_META: Record<Priority, { label: string; color: string; badgeClassName: string }> = {
  high: { label: 'Haute', color: '#f87171', badgeClassName: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium: { label: 'Moyenne', color: '#fbbf24', badgeClassName: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { label: 'Basse', color: '#60a5fa', badgeClassName: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low'];

const formatDeadline = (deadline: string | null): string => {
  if (!deadline) return '—';
  return new Date(`${deadline}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PriorityPill = ({ priority }: { priority: Priority }) => {
  const meta = PRIORITY_META[priority];
  return (
    <Badge className={meta.badgeClassName}>
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} aria-hidden="true" />
      {meta.label}
    </Badge>
  );
};

const ActionCard = ({ item }: { item: ActionItem }) => {
  const meta = PRIORITY_META[item.priority];
  return (
    <article
      className="flex flex-col gap-2.5 rounded-[10px] border border-navy-border border-l-[3px] bg-navy-mid px-3.5 py-3 sm:flex-row sm:items-center sm:gap-3"
      style={{ borderLeftColor: meta.color }}
    >
      {/* Priorité + responsable juste avant le texte : plus lisible que
          rejetés en bout de ligne, loin de l'action qu'ils qualifient. */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5">
        <PriorityPill priority={item.priority} />
        <span className="inline-flex items-center gap-1.5">
          <Avatar name={item.owner} colorSeed={item.owner} size={20} fallback="?" />
          <span className="text-xs font-medium text-slate-300">{item.owner}</span>
        </span>
      </div>
      <p className="min-w-0 flex-1 text-[13px] leading-[1.5] text-slate-100 break-words">{item.description}</p>
      <span className="flex-shrink-0 font-mono text-[11px] text-slate-500">{formatDeadline(item.deadline)}</span>
    </article>
  );
};

const AddActionForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: { description: string; owner: string; priority: Priority; deadline: string | null }) => Promise<void>;
  onCancel: () => void;
}) => {
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasContent = description.trim().length > 0;

  const handleSubmit = async () => {
    if (!hasContent || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        description: description.trim(),
        owner: owner.trim() || '?',
        priority,
        deadline: deadline || null,
      });
      setDescription('');
      setOwner('');
      setPriority('medium');
      setDeadline('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-navy-border bg-navy-mid px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-slate-500">Nouvelle action</p>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Décrivez l'action à mener après la rétrospective…"
        aria-label="Description de l'action"
        rows={2}
        disabled={isSubmitting}
        className="w-full resize-none rounded-[10px] border border-navy-border-med bg-navy-surface px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors disabled:opacity-50 focus:border-white/30"
      />
      <div className="flex flex-wrap gap-2.5">
        <div className="min-w-[140px] flex-1">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.4px] text-slate-500">Responsable</label>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Nom du responsable…"
            aria-label="Responsable de l'action"
            disabled={isSubmitting}
            className="w-full rounded-[9px] border border-navy-border-med bg-navy-surface px-3 py-2 text-[13px] text-slate-50 outline-none disabled:opacity-50"
          />
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.4px] text-slate-500">Date limite</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            aria-label="Date limite"
            disabled={isSubmitting}
            className="w-full rounded-[9px] border border-navy-border-med bg-navy-surface px-3 py-2 text-[13px] text-slate-50 outline-none disabled:opacity-50 [color-scheme:dark]"
          />
        </div>
        <div className="min-w-[220px] flex-[1_1_220px]">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.4px] text-slate-500">Priorité</label>
          <div className="flex gap-1.5">
            {PRIORITY_ORDER.map((p) => {
              const meta = PRIORITY_META[p];
              const isActive = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  aria-pressed={isActive}
                  aria-label={`Priorité ${meta.label}`}
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[9px] border px-2 py-[7px] text-xs font-semibold transition-colors disabled:opacity-50"
                  style={{
                    borderColor: isActive ? meta.color : 'var(--color-navy-border-med)',
                    background: isActive ? `${meta.color}20` : 'transparent',
                    color: isActive ? meta.color : '#64748b',
                  }}
                >
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: isActive ? meta.color : '#475569' }} />
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="button" variant="success" size="sm" onClick={() => void handleSubmit()} disabled={!hasContent || isSubmitting}>
          Ajouter l'action
        </Button>
      </div>
    </div>
  );
};

const ActionStep = ({ onAddAction }: ActionStepProps) => {
  const { actions } = useSessionActionsState();
  const sessionCards = useSessionCardsState();
  const { details } = useSessionDetailsState();
  const { identity } = useSessionIdentityState();
  const { cards } = sessionCards;
  const { formatColumns } = details;
  const { isFacilitator } = identity;
  const [showForm, setShowForm] = useState(false);
  const [topLimit, setTopLimit] = useState(5);

  const groups = PRIORITY_ORDER.map((priority) => ({
    priority,
    items: actions.filter((action) => action.priority === priority),
  })).filter((group) => group.items.length > 0);

  const handleAdd = async (payload: { description: string; owner: string; priority: Priority; deadline: string | null }) => {
    await onAddAction(payload);
    setShowForm(false);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-navy-border px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-slate-100">Plan d'action</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {actions.length} action{actions.length !== 1 ? 's' : ''} à réaliser après la rétrospective
          </p>
        </div>
        {isFacilitator && (
          <Button type="button" variant={showForm ? 'ghost' : 'secondary'} size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Annuler' : 'Ajouter une action'}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {cards.length > 0 && (
          <div className="mb-6">
            {/* Rappel des cartes les plus votées : on ne s'en souvient plus une
                fois arrivé au plan d'action, pas la peine de revenir en arrière. */}
            <TopVotedCards cards={cards} formatColumns={formatColumns} limit={topLimit} onLimitChange={setTopLimit} showComments />
          </div>
        )}

        {showForm && (
          <div className="mb-6 max-w-[860px]">
            <AddActionForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {actions.length === 0 && !showForm ? (
          <EmptyState
            icon={<span aria-hidden="true">✅</span>}
            title="Aucune action définie"
            description={
              isFacilitator
                ? 'Ajoutez les actions concrètes issues des retours de votre équipe.'
                : "Le facilitateur n'a pas encore ajouté d'action."
            }
          />
        ) : (
          groups.map(({ priority, items }) => {
            const meta = PRIORITY_META[priority];
            return (
              <section key={priority} aria-label={`Actions — priorité ${meta.label}`} className="mb-7">
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: meta.color }} aria-hidden="true" />
                  <span className="text-xs font-bold tracking-[0.5px]" style={{ color: meta.color }}>
                    Priorité {meta.label}
                  </span>
                  <span className="rounded-md bg-navy-surface-med px-1.5 font-mono text-[11px] text-slate-600">{items.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <ActionCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActionStep;
