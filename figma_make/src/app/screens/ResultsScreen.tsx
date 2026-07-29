import { T, Btn, Icon, CategoryBadge, Avatar, VoteBar } from "../components/ui";
import { Card, Category } from "../types";
import { PARTICIPANTS } from "../mockData";

const TAB_CONFIG: { key: Category; label: string; color: string; emoji: string }[] = [
  { key: "positif", label: "Positif", color: T.green, emoji: "✅" },
  { key: "negatif", label: "Négatif", color: T.red, emoji: "🚧" },
  { key: "idee", label: "Idées", color: T.yellow, emoji: "💡" },
];

interface ResultsScreenProps {
  cards: Card[];
  onOpenComments: (card: Card) => void;
  onNext: () => void;
  isDesktop: boolean;
}

export function ResultsScreen({ cards, onOpenComments, onNext, isDesktop }: ResultsScreenProps) {
  const sorted = [...cards].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...cards.map(c => c.votes), 1);
  const top3 = sorted.slice(0, 3);
  const totalVotes = cards.reduce((s, c) => s + c.votes, 0);
  const totalComments = cards.reduce((s, c) => s + c.commentCount, 0);

  if (isDesktop) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top toolbar */}
        <div style={{ padding: "10px 24px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Stats chips */}
          <div style={{ display: "flex", gap: 8, flex: 1 }}>
            {[
              { label: "Votes", value: totalVotes, color: T.yellow },
              { label: "Cartes", value: cards.length, color: T.green },
              { label: "Commentaires", value: totalComments, color: T.slate400 },
            ].map(stat => (
              <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 6, background: T.navySurface, border: `1px solid ${T.navyBorderMed}`, borderRadius: 8, padding: "5px 12px" }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 700, color: stat.color }}>{stat.value}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500 }}>{stat.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" size="sm" icon={<Icon.Download size={13} />}>Exporter PDF</Btn>
            <Btn variant="primary" size="sm" onClick={onNext}>Plan d'action →</Btn>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Top 3 row */}
          <div style={{ padding: "14px 24px 12px", borderBottom: `1px solid ${T.navyBorder}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon.Trophy size={15} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.slate400, letterSpacing: 0.8, textTransform: "uppercase" }}>Top 3 des cartes</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {top3.map((card, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                const tabCfg = TAB_CONFIG.find(t => t.key === card.category)!;
                return (
                  <div
                    key={card.id}
                    style={{
                      background: T.navyMid, border: `1px solid ${T.navyBorder}`,
                      borderLeft: `3px solid ${tabCfg.color}`,
                      borderRadius: 10, padding: "10px 14px",
                      display: "flex", alignItems: "flex-start", gap: 10,
                      boxShadow: i === 0 ? `0 0 20px ${tabCfg.color}12` : "none",
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{medals[i]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate100, margin: "0 0 5px", lineHeight: 1.4 }}>{card.content}</p>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <CategoryBadge category={card.category} small />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500 }}>{card.author}</span>
                      </div>
                      <VoteBar votes={card.votes} max={maxVotes} color={tabCfg.color} />
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <p style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 18, color: T.slate50, margin: 0 }}>{card.votes}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.slate500, margin: 0 }}>votes</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-column category results */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, overflow: "hidden", background: T.navyBorder }}>
            {TAB_CONFIG.map(tab => {
              const catCards = sorted.filter(c => c.category === tab.key);
              return (
                <div key={tab.key} style={{ background: T.navy, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px 8px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 14 }}>{tab.emoji}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: tab.color }}>{tab.label}</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate500, marginLeft: "auto" }}>{catCards.length} cartes</span>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {catCards.map(card => (
                      <ResultCard key={card.id} card={card} tabColor={tab.color} maxVotes={maxVotes} onOpenComments={onOpenComments} />
                    ))}
                    {catCards.length === 0 && (
                      <div style={{ padding: "24px 0", textAlign: "center", color: T.slate600, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
                        Aucune carte
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
      {/* Stats strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total votes", value: totalVotes, color: T.yellow },
          { label: "Cartes", value: cards.length, color: T.green },
          { label: "Commentaires", value: totalComments, color: T.slate400 },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1, minWidth: 100,
            background: T.navyMid, border: `1px solid ${T.navyBorder}`,
            borderRadius: 10, padding: "10px 14px",
          }}>
            <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700, color: stat.color, margin: "0 0 2px" }}>{stat.value}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500, margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Top 3 podium */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Icon.Trophy size={16} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: T.slate400, letterSpacing: 0.8, textTransform: "uppercase" }}>Top 3 des cartes</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {top3.map((card, i) => {
            const medals = ["🥇", "🥈", "🥉"];
            const tabCfg = TAB_CONFIG.find(t => t.key === card.category)!;
            return (
              <div
                key={card.id}
                style={{
                  background: T.navyMid, border: `1px solid ${T.navyBorder}`,
                  borderLeft: `3px solid ${tabCfg.color}`,
                  borderRadius: 12, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                  boxShadow: i === 0 ? `0 0 20px ${tabCfg.color}15` : "none",
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{medals[i]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate100, margin: "0 0 5px", lineHeight: 1.4 }}>{card.content}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <CategoryBadge category={card.category} small />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500 }}>{card.author}</span>
                  </div>
                  <VoteBar votes={card.votes} max={maxVotes} color={tabCfg.color} />
                </div>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <p style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 20, color: T.slate50, margin: 0 }}>{card.votes}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.slate500, margin: 0 }}>votes</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results by category */}
      {TAB_CONFIG.map(tab => {
        const catCards = sorted.filter(c => c.category === tab.key);
        if (catCards.length === 0) return null;
        return (
          <div key={tab.key} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{tab.emoji}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: T.slate400, letterSpacing: 0.8, textTransform: "uppercase" }}>{tab.label}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate600 }}>{catCards.length} cartes</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {catCards.map(card => (
                <ResultCard key={card.id} card={card} tabColor={tab.color} maxVotes={maxVotes} onOpenComments={onOpenComments} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 8, paddingBottom: 16 }}>
        <Btn variant="primary" size="md" onClick={onNext}>Plan d'action →</Btn>
        <Btn variant="secondary" size="md" icon={<Icon.Download size={14} />}>Exporter PDF</Btn>
      </div>
    </div>
  );
}

function ResultCard({ card, tabColor, maxVotes, onOpenComments }: { card: Card; tabColor: string; maxVotes: number; onOpenComments: (c: Card) => void }) {
  const p = PARTICIPANTS.find(part => part.name === card.author);
  return (
    <div style={{
      background: T.navyMid, border: `1px solid ${T.navyBorder}`,
      borderLeft: `3px solid ${tabColor}`,
      borderRadius: 10, padding: "10px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        {p && <Avatar name={p.name} color={p.avatarColor} size={18} />}
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500 }}>{card.author}</span>
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate200, margin: "0 0 8px", lineHeight: 1.45 }}>{card.content}</p>
      <VoteBar votes={card.votes} max={maxVotes} color={tabColor} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <button onClick={() => onOpenComments(card)} style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", color: T.slate500, padding: 0 }}>
          <Icon.Comment size={12} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500 }}>{card.commentCount}</span>
        </button>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: tabColor }}>{card.votes} votes</span>
      </div>
    </div>
  );
}
