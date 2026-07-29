import { T, Btn, Icon, CategoryBadge, Avatar, PriorityBadge, VoteBar } from "../components/ui";
import { Card, ActionItem, Participant } from "../types";

interface SummaryScreenProps {
  sessionName: string;
  cards: Card[];
  actions: ActionItem[];
  participants: Participant[];
  startTime: Date;
  totalComments: number;
  isDesktop: boolean;
  onFinish: () => void;
}

const CAT_COLORS: Record<string, string> = { positif: T.green, negatif: T.red, idee: T.yellow };
const CAT_LABELS: Record<string, string> = { positif: "✅ Positif", negatif: "🚧 Négatif", idee: "💡 Idées" };

export function SummaryScreen({ sessionName, cards, actions, participants, startTime, totalComments, isDesktop, onFinish }: SummaryScreenProps) {
  const now = new Date();
  const durationMs = now.getTime() - startTime.getTime();
  const durationMins = Math.round(durationMs / 60000);
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;
  const durationLabel = hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;

  const sorted = [...cards].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...cards.map(c => c.votes), 1);
  const top3 = sorted.slice(0, 3);
  const totalVotes = cards.reduce((s, c) => s + c.votes, 0);
  const doneActions = actions.length;
  const onlineCount = participants.filter(p => p.status === "online").length;

  const today = now.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const stats = [
    { label: "Participants", value: String(participants.length), sublabel: `${onlineCount} en ligne`, color: T.green },
    { label: "Total des votes", value: String(totalVotes), sublabel: `${cards.length} cartes votées`, color: T.yellow },
    { label: "Commentaires", value: String(totalComments), sublabel: "échanges de l'équipe", color: T.slate300 },
    { label: "Actions créées", value: String(actions.length), sublabel: "à réaliser", color: T.green },
    { label: "Durée", value: durationLabel, sublabel: "de rétrospective", color: T.slate400 },
    { label: "Cartes", value: String(cards.length), sublabel: `${cards.filter(c => c.category === "positif").length} positives`, color: T.green },
  ];

  if (isDesktop) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top header bar */}
        <div style={{ padding: "14px 28px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.slate500, letterSpacing: 0.8, textTransform: "uppercase" }}>
                Récapitulatif final
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.green + "20", border: `1px solid ${T.green}30`, borderRadius: 12, padding: "1px 9px", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: T.green }}>
                ✓ Session terminée
              </span>
            </div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 22, color: T.slate50, letterSpacing: -0.5, margin: 0 }}>
              {sessionName}
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate500, marginTop: 2 }}>
              {today} · {durationLabel}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" size="md" icon={<Icon.Share size={14} />} aria-label="Partager le récapitulatif">
              Partager
            </Btn>
            <Btn variant="primary" size="md" icon={<Icon.Download size={14} />} aria-label="Télécharger en PDF">
              Télécharger PDF
            </Btn>
            <Btn variant="danger" size="md" onClick={onFinish} aria-label="Terminer la rétrospective">
              Terminer
            </Btn>
          </div>
        </div>

        {/* Main content — 2-column layout */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          {/* Left column — scrollable */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", borderRight: `1px solid ${T.navyBorder}` }}>

            {/* Stats grid */}
            <section aria-label="Statistiques de session" style={{ marginBottom: 28 }}>
              <SectionHeader label="Vue d'ensemble" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {stats.map(s => (
                  <div key={s.label} style={{ background: T.navyMid, border: `1px solid ${T.navyBorder}`, borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 22, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.slate300, margin: "0 0 1px" }}>{s.label}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500, margin: 0 }}>{s.sublabel}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Top 3 cards */}
            <section aria-label="Top 3 cartes" style={{ marginBottom: 28 }}>
              <SectionHeader label="Top 3 des cartes" icon="🏆" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {top3.map((card, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const catColor = CAT_COLORS[card.category];
                  return (
                    <div key={card.id} style={{
                      background: T.navyMid, border: `1px solid ${T.navyBorder}`,
                      borderLeft: `3px solid ${catColor}`, borderRadius: 12,
                      padding: "12px 16px", display: "flex", alignItems: "center", gap: 14,
                      boxShadow: i === 0 ? `0 2px 20px ${catColor}12` : "none",
                    }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{medals[i]}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate100, margin: "0 0 5px", lineHeight: 1.4 }}>{card.content}</p>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <CategoryBadge category={card.category} small />
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate500 }}>{card.author}</span>
                        </div>
                        <VoteBar votes={card.votes} max={maxVotes} color={catColor} />
                      </div>
                      <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <p style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 20, color: catColor, margin: 0 }}>{card.votes}</p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.slate500, margin: 0 }}>votes</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Participants */}
            <section aria-label="Participants" style={{ marginBottom: 28 }}>
              <SectionHeader label="Participants" count={participants.length} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {participants.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, background: T.navyMid, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "7px 12px" }}>
                    <Avatar name={p.name} color={p.avatarColor} size={24} status={p.status} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate300, fontWeight: 500 }}>{p.name}</span>
                    {p.isAdmin && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.yellow, fontWeight: 700 }}>Admin</span>}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column — scrollable */}
          <div style={{ width: 420, flexShrink: 0, overflowY: "auto", padding: "20px 24px" }}>

            {/* Vote results by category */}
            <section aria-label="Résultats des votes" style={{ marginBottom: 28 }}>
              <SectionHeader label="Résultats des votes" />
              {(["positif", "negatif", "idee"] as const).map(cat => {
                const catCards = sorted.filter(c => c.category === cat);
                if (catCards.length === 0) return null;
                const catColor = CAT_COLORS[cat];
                return (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: catColor, marginBottom: 8 }}>{CAT_LABELS[cat]}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {catCards.map(card => (
                        <div key={card.id} style={{
                          background: T.navyMid, border: `1px solid ${T.navyBorder}`,
                          borderLeft: `3px solid ${catColor}`, borderRadius: 9,
                          padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                        }}>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate300, margin: 0, lineHeight: 1.4, flex: 1 }}>{card.content}</p>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: catColor, flexShrink: 0 }}>{card.votes}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Action plan */}
            <section aria-label="Plan d'action" style={{ marginBottom: 28 }}>
              <SectionHeader label="Plan d'action" count={actions.length} />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {actions.map(item => {
                  const priColors: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#3b82f6" };
                  return (
                    <div key={item.id} style={{
                      background: T.navyMid, border: `1px solid ${T.navyBorder}`,
                      borderLeft: `3px solid ${priColors[item.priority]}`,
                      borderRadius: 10, padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate200, flex: 1, margin: 0, lineHeight: 1.4 }}>
                        {item.description}
                      </p>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                        <PriorityBadge priority={item.priority} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400, fontWeight: 500 }}>{item.owner}</span>
                        {item.deadline && (
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate500 }}>
                            {new Date(item.deadline + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Footer actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16 }}>
              <Btn variant="primary" size="lg" full icon={<Icon.Download size={16} />} aria-label="Télécharger le récapitulatif en PDF">
                Télécharger le PDF
              </Btn>
              <Btn variant="secondary" size="md" full icon={<Icon.Share size={14} />} aria-label="Partager le récapitulatif">
                Partager le récapitulatif
              </Btn>
              <Btn variant="danger" size="md" full onClick={onFinish} aria-label="Terminer la rétrospective et revenir à l'accueil">
                Terminer la rétrospective
              </Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${T.navyBorder}` }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.slate500, letterSpacing: 0.8, textTransform: "uppercase" }}>Récapitulatif</span>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 22, color: T.slate50, letterSpacing: -0.5, marginBottom: 4, marginTop: 4 }}>{sessionName}</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate500 }}>{today} · {durationLabel}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Btn variant="primary" size="sm" icon={<Icon.Download size={13} />}>PDF</Btn>
            <Btn variant="secondary" size="sm" icon={<Icon.Share size={13} />}>Partager</Btn>
            <Btn variant="danger" size="sm" onClick={onFinish}>Terminer</Btn>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: T.navyMid, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 16, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.slate500, margin: 0, textTransform: "uppercase", letterSpacing: 0.4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Participants */}
        <section style={{ marginBottom: 24 }}>
          <SectionHeader label="Participants" count={participants.length} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {participants.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 7, background: T.navyMid, border: `1px solid ${T.navyBorder}`, borderRadius: 8, padding: "5px 10px" }}>
                <Avatar name={p.name} color={p.avatarColor} size={22} status={p.status} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate300 }}>{p.name}</span>
                {p.isAdmin && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.yellow, fontWeight: 600 }}>Admin</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Top 3 */}
        <section style={{ marginBottom: 24 }}>
          <SectionHeader label="Top cartes" icon="🏆" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {top3.map((card, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={card.id} style={{ background: T.navyMid, border: `1px solid ${T.navyBorder}`, borderLeft: `3px solid ${CAT_COLORS[card.category]}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{medals[i]}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate200, margin: "0 0 4px", lineHeight: 1.4 }}>{card.content}</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <CategoryBadge category={card.category} small />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500 }}>{card.author}</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 700, color: CAT_COLORS[card.category] }}>⭐ {card.votes}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Results by category */}
        <section style={{ marginBottom: 24 }}>
          <SectionHeader label="Résultats des votes" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(["positif", "negatif", "idee"] as const).map(cat => {
              const catCards = sorted.filter(c => c.category === cat);
              if (catCards.length === 0) return null;
              const catColor = CAT_COLORS[cat];
              return (
                <div key={cat}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: catColor, marginBottom: 6 }}>{CAT_LABELS[cat]}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {catCards.map(card => (
                      <div key={card.id} style={{ background: T.navyMid, border: `1px solid ${T.navyBorder}`, borderLeft: `3px solid ${catColor}`, borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate300, margin: 0, lineHeight: 1.4, flex: 1 }}>{card.content}</p>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 700, color: catColor, flexShrink: 0 }}>{card.votes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Action plan */}
        <section style={{ marginBottom: 28 }}>
          <SectionHeader label="Plan d'action" count={actions.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {actions.map(item => {
              const priColors: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#3b82f6" };
              return (
                <div key={item.id} style={{ background: T.navyMid, border: `1px solid ${T.navyBorder}`, borderLeft: `3px solid ${priColors[item.priority]}`, borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate200, margin: "0 0 7px", lineHeight: 1.4 }}>{item.description}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <PriorityBadge priority={item.priority} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400, fontWeight: 500 }}>{item.owner}</span>
                    {item.deadline && (
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate500 }}>
                        {new Date(item.deadline + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 32 }}>
          <Btn variant="primary" size="lg" icon={<Icon.Download size={16} />}>Télécharger le PDF</Btn>
          <Btn variant="secondary" size="md" icon={<Icon.Share size={14} />}>Partager</Btn>
          <Btn variant="danger" size="md" onClick={onFinish}>Terminer</Btn>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label, icon, count }: { label: string; icon?: string; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.slate400, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</span>
      {count !== undefined && (
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate600, background: T.navySurfaceMed, borderRadius: 5, padding: "0 5px" }}>{count}</span>
      )}
    </div>
  );
}
