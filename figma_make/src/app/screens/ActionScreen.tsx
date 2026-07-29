import { useState } from "react";
import { T, Btn, Icon, Avatar } from "../components/ui";
import { ActionItem } from "../types";
import { PARTICIPANTS } from "../mockData";

interface ActionScreenProps {
  actions: ActionItem[];
  onAdd: (description: string, owner: string, priority: ActionItem["priority"], deadline: string) => void;
  onNext: () => void;
  isDesktop: boolean;
}

const PRIORITY_CONFIG = {
  high:   { label: "Haute",   color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)", dot: "#ef4444" },
  medium: { label: "Moyenne", color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)",  dot: "#f59e0b" },
  low:    { label: "Basse",   color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.25)",  dot: "#3b82f6" },
};

function formatDeadline(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(iso: string): boolean {
  if (!iso) return false;
  return new Date(iso + "T00:00:00") < new Date();
}

function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(iso + "T00:00:00");
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  if (!deadline) return <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate600 }}>—</span>;
  const days = daysUntil(deadline);
  const overdue = days < 0;
  const soon = days >= 0 && days <= 3;
  const color = overdue ? "#f87171" : soon ? "#fbbf24" : T.slate400;
  const bg = overdue ? "rgba(248,113,113,0.12)" : soon ? "rgba(251,191,36,0.1)" : "transparent";
  const label = overdue
    ? `En retard de ${Math.abs(days)}j`
    : days === 0 ? "Aujourd'hui"
    : days === 1 ? "Demain"
    : `J−${days}`;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: bg, borderRadius: 7, padding: overdue || soon ? "2px 8px" : "0",
      fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: overdue || soon ? 600 : 400,
      color,
    }}>
      {(overdue || soon) && (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1.5" />
          <path d="M6 3.5v3M6 8.5v.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      <span>{formatDeadline(deadline)}</span>
      {(overdue || soon) && <span style={{ opacity: 0.75 }}>· {label}</span>}
    </span>
  );
}

function PriorityPill({ priority }: { priority: ActionItem["priority"] }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 20, padding: "3px 10px",
      fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700,
      color: cfg.color, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block", flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function OwnerChip({ name }: { name: string }) {
  const p = PARTICIPANTS.find(p => p.name === name);
  const color = p?.avatarColor ?? T.slate500;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Avatar name={name} color={color} size={22} />
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate200, fontWeight: 500 }}>
        {name}
      </span>
    </span>
  );
}

export function ActionScreen({ actions, onAdd, onNext, isDesktop }: ActionScreenProps) {
  const [desc, setDesc] = useState("");
  const [owner, setOwner] = useState("");
  const [priority, setPriority] = useState<ActionItem["priority"]>("medium");
  const [deadline, setDeadline] = useState("");
  const [showForm, setShowForm] = useState(false);

  const submit = () => {
    if (!desc.trim()) return;
    onAdd(desc.trim(), owner.trim() || "?", priority, deadline);
    setDesc(""); setOwner(""); setDeadline(""); setPriority("medium"); setShowForm(false);
  };

  const highActions   = actions.filter(a => a.priority === "high");
  const mediumActions = actions.filter(a => a.priority === "medium");
  const lowActions    = actions.filter(a => a.priority === "low");

  const AddForm = ({ inline }: { inline?: boolean }) => (
    <div style={{
      background: inline ? "transparent" : T.navyMid,
      border: inline ? "none" : `1px solid ${T.navyBorder}`,
      borderRadius: 14, padding: inline ? "0" : "18px 20px",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.slate500, letterSpacing: 0.8, textTransform: "uppercase", margin: 0 }}>
        Nouvelle action
      </p>
      <textarea
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Décrivez l'action à mener après la rétrospective…"
        aria-label="Description de l'action"
        rows={2}
        style={{
          width: "100%", borderRadius: 10,
          border: `1.5px solid ${desc ? "rgba(255,255,255,0.2)" : T.navyBorderMed}`,
          background: T.navySurface, padding: "10px 14px",
          fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate50,
          outline: "none", resize: "none", boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
      />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Owner */}
        <div style={{ flex: "1 1 160px", minWidth: 140 }}>
          <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: T.slate500, marginBottom: 5, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Responsable
          </label>
          <input
            value={owner}
            onChange={e => setOwner(e.target.value)}
            placeholder="Nom du responsable…"
            aria-label="Responsable de l'action"
            style={{
              width: "100%", borderRadius: 9,
              border: `1.5px solid ${T.navyBorderMed}`, background: T.navySurface,
              padding: "8px 12px", fontFamily: "'Inter', sans-serif",
              fontSize: 13, color: T.slate50, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        {/* Deadline */}
        <div style={{ flex: "1 1 160px", minWidth: 140 }}>
          <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: T.slate500, marginBottom: 5, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Date limite
          </label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            aria-label="Date limite"
            style={{
              width: "100%", borderRadius: 9,
              border: `1.5px solid ${T.navyBorderMed}`, background: T.navySurface,
              padding: "8px 12px", fontFamily: "'Inter', sans-serif",
              fontSize: 13, color: deadline ? T.slate50 : T.slate500, outline: "none",
              colorScheme: "dark", boxSizing: "border-box",
            }}
          />
        </div>
        {/* Priority */}
        <div style={{ flex: "1 1 220px" }}>
          <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: T.slate500, marginBottom: 5, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Priorité
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {(["high", "medium", "low"] as const).map(p => {
              const cfg = PRIORITY_CONFIG[p];
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  aria-pressed={priority === p}
                  aria-label={`Priorité ${cfg.label}`}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    borderRadius: 9, padding: "7px 6px",
                    border: `1.5px solid ${priority === p ? cfg.border : T.navyBorderMed}`,
                    background: priority === p ? cfg.bg : "transparent",
                    color: priority === p ? cfg.color : T.slate500,
                    fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: priority === p ? cfg.dot : T.slate600, flexShrink: 0 }} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn size="sm" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Btn>
        <Btn size="sm" variant="success" onClick={submit} aria-label="Ajouter cette action">
          <Icon.Plus size={13} /> Ajouter l'action
        </Btn>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "12px 28px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: T.slate100, margin: 0 }}>
              Plan d'action
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate500, margin: "2px 0 0" }}>
              {actions.length} action{actions.length !== 1 ? "s" : ""} à réaliser après la rétrospective
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              size="sm"
              variant={showForm ? "ghost" : "secondary"}
              icon={showForm ? <Icon.X size={12} /> : <Icon.Plus size={12} />}
              onClick={() => setShowForm(v => !v)}
            >
              {showForm ? "Annuler" : "Ajouter une action"}
            </Btn>
            <Btn size="sm" variant="secondary" icon={<Icon.Download size={13} />}>
              Exporter PDF
            </Btn>
            <Btn size="sm" variant="primary" onClick={onNext}>
              Terminer la rétro →
            </Btn>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {showForm && (
            <div style={{ marginBottom: 28, maxWidth: 860 }}>
              <AddForm inline />
            </div>
          )}

          {actions.length === 0 && !showForm && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.navySurface, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon.Check size={24} />
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: T.slate400 }}>Aucune action définie</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate600, maxWidth: 320 }}>
                Ajoutez les actions concrètes issues des retours de votre équipe.
              </p>
              <Btn variant="secondary" size="md" icon={<Icon.Plus size={14} />} onClick={() => setShowForm(true)}>
                Ajouter la première action
              </Btn>
            </div>
          )}

          {/* Priority sections */}
          {([["high", highActions], ["medium", mediumActions], ["low", lowActions]] as const).map(([pri, group]) => {
            if (group.length === 0) return null;
            const cfg = PRIORITY_CONFIG[pri];
            return (
              <section key={pri} aria-label={`Actions — priorité ${cfg.label}`} style={{ marginBottom: 32 }}>
                {/* Section header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: cfg.color, letterSpacing: 0.5 }}>
                    Priorité {cfg.label}
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate600, background: T.navySurfaceMed, borderRadius: 6, padding: "1px 7px" }}>
                    {group.length}
                  </span>
                </div>

                {/* Table header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 180px 160px 120px",
                  gap: 16, padding: "6px 16px",
                  borderBottom: `1px solid ${T.navyBorder}`,
                  marginBottom: 4,
                }}>
                  {["Action", "Responsable", "Échéance", "Priorité"].map(h => (
                    <span key={h} style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.slate600, letterSpacing: 0.5, textTransform: "uppercase" }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {group.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 180px 160px 120px",
                        gap: 16,
                        padding: "14px 16px",
                        background: idx % 2 === 0 ? T.navyMid : "rgba(255,255,255,0.015)",
                        border: `1px solid ${T.navyBorder}`,
                        borderLeft: `3px solid ${cfg.dot}`,
                        borderRadius: 10,
                        alignItems: "center",
                        transition: "background 0.15s",
                      }}
                    >
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate100, lineHeight: 1.5, margin: 0 }}>
                        {item.description}
                      </p>
                      <OwnerChip name={item.owner} />
                      <DeadlineBadge deadline={item.deadline} />
                      <PriorityPill priority={item.priority} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Footer actions */}
          {actions.length > 0 && (
            <div style={{ display: "flex", gap: 10, paddingTop: 8, paddingBottom: 24 }}>
              <Btn variant="primary" size="md" icon={<Icon.Download size={14} />}>
                Exporter le récapitulatif PDF
              </Btn>
              <Btn variant="danger" size="md" onClick={onNext}>
                Terminer la rétrospective →
              </Btn>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Mobile ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.navyBorder}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: T.slate100, margin: 0 }}>Plan d'action</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500, margin: "2px 0 0" }}>
              {actions.length} action{actions.length !== 1 ? "s" : ""} post-rétro
            </p>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <Btn size="sm" variant="secondary" icon={<Icon.Plus size={12} />} onClick={() => setShowForm(v => !v)}>
              {showForm ? "Annuler" : "Ajouter"}
            </Btn>
            <Btn size="sm" variant="primary" onClick={onNext}>Terminer →</Btn>
          </div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.navyBorder}`, background: T.navyMid, flexShrink: 0 }}>
          <AddForm />
        </div>
      )}

      {/* Action list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {actions.length === 0 && !showForm && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate500, fontWeight: 600 }}>Aucune action</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate600, marginTop: 4 }}>Ajoutez des actions à réaliser après la rétro.</p>
          </div>
        )}

        {([["high", highActions], ["medium", mediumActions], ["low", lowActions]] as const).map(([pri, group]) => {
          if (group.length === 0) return null;
          const cfg = PRIORITY_CONFIG[pri];
          return (
            <div key={pri} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: cfg.color, letterSpacing: 0.4, textTransform: "uppercase" }}>
                  Priorité {cfg.label} · {group.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {group.map(item => (
                  <MobileActionCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        {actions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8, paddingBottom: 16 }}>
            <Btn variant="secondary" full size="md" icon={<Icon.Download size={14} />}>
              Exporter le récapitulatif PDF
            </Btn>
            <Btn variant="danger" full size="md" onClick={onNext}>
              Terminer la rétrospective →
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileActionCard({ item }: { item: ActionItem }) {
  const cfg = PRIORITY_CONFIG[item.priority];
  return (
    <div style={{
      background: T.navyMid,
      border: `1px solid ${T.navyBorder}`,
      borderLeft: `3px solid ${cfg.dot}`,
      borderRadius: 12,
      padding: "14px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {/* Description */}
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate100, lineHeight: 1.55, margin: 0 }}>
        {item.description}
      </p>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <OwnerChip name={item.owner} />
        <PriorityPill priority={item.priority} />
      </div>

      {/* Deadline */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, paddingTop: 4, borderTop: `1px solid ${T.navyBorder}` }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="3" width="12" height="11" rx="2" stroke={T.slate500} strokeWidth="1.4" />
          <path d="M5 2v2M11 2v2M2 7h12" stroke={T.slate500} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500 }}>Échéance :</span>
        <DeadlineBadge deadline={item.deadline} />
      </div>
    </div>
  );
}
