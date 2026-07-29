import { useState } from "react";
import { T, Btn, Icon, Avatar, EmptyState, TimerChip } from "../components/ui";
import { Card, Category } from "../types";
import { PARTICIPANTS } from "../mockData";

const TAB_CONFIG: { key: Category; label: string; emoji: string; color: string }[] = [
  { key: "positif", label: "Positif", emoji: "✅", color: T.green },
  { key: "negatif", label: "Négatif", emoji: "🚧", color: T.red },
  { key: "idee", label: "Idées", emoji: "💡", color: T.yellow },
];

interface WritingScreenProps {
  cards: Card[];
  onAddCard: (category: Category, content: string) => void;
  onOpenComments: (card: Card) => void;
  onNext: () => void;
  isDesktop: boolean;
}

export function WritingScreen({ cards, onAddCard, onOpenComments, onNext, isDesktop }: WritingScreenProps) {
  const [activeTab, setActiveTab] = useState<Category>("positif");
  const [input, setInput] = useState("");
  const myColor = PARTICIPANTS[0].avatarColor;

  const tabCards = cards.filter(c => c.category === activeTab);
  const currentTab = TAB_CONFIG.find(t => t.key === activeTab)!;

  const add = () => {
    const text = input.trim();
    if (!text) return;
    onAddCard(activeTab, text);
    setInput("");
  };

  const getCatConfig = (cat: Category) => TAB_CONFIG.find(t => t.key === cat)!;

  if (isDesktop) {
    // Desktop: 3-column layout
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Sub-toolbar */}
        <div style={{ padding: "10px 20px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400 }}>
            {cards.length} carte{cards.length !== 1 ? "s" : ""} au total
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <TimerChip value="05:00" />
            <Btn variant="primary" size="sm" onClick={onNext}>Passer au vote →</Btn>
          </div>
        </div>

        {/* Columns */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, overflow: "hidden", background: T.navyBorder }}>
          {TAB_CONFIG.map(tab => {
            const catCards = cards.filter(c => c.category === tab.key);
            return (
              <div key={tab.key} style={{ background: T.navy, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Column header */}
                <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: tab.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, color: T.slate200 }}>{tab.label}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate500, background: T.navySurfaceMed, borderRadius: 5, padding: "1px 6px" }}>
                    {catCards.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {catCards.map(card => (
                    <CardItem key={card.id} card={card} catColor={tab.color} onOpenComments={onOpenComments} />
                  ))}
                  {catCards.length === 0 && (
                    <EmptyState
                      icon={<span style={{ fontSize: 24 }}>{tab.emoji}</span>}
                      title={`Aucune carte ${tab.label.toLowerCase()}`}
                      description="Écrivez ce qui s'est bien passé…"
                    />
                  )}
                </div>

                {/* Add card */}
                <AddCardInput category={tab.key} color={tab.color} onAdd={(text) => onAddCard(tab.key, text)} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Mobile: tabbed layout
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.navyBorder}`, flexShrink: 0, padding: "0 12px" }}>
        {TAB_CONFIG.map(tab => {
          const count = cards.filter(c => c.category === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: "10px 4px",
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                color: activeTab === tab.key ? T.slate50 : T.slate500,
                background: "transparent", border: "none",
                borderBottom: `2px solid ${activeTab === tab.key ? tab.color : "transparent"}`,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                marginBottom: -1,
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span style={{
                background: activeTab === tab.key ? tab.color + "30" : T.navySurface,
                color: activeTab === tab.key ? tab.color : T.slate600,
                borderRadius: 6, padding: "0 5px",
                fontSize: 10, fontFamily: "JetBrains Mono, monospace",
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {tabCards.map(card => (
          <CardItem key={card.id} card={card} catColor={currentTab.color} onOpenComments={onOpenComments} />
        ))}
        {tabCards.length === 0 && (
          <EmptyState
            icon={<span style={{ fontSize: 28 }}>{currentTab.emoji}</span>}
            title={`Aucune carte ${currentTab.label.toLowerCase()}`}
            description="Soyez le premier à ajouter une carte !"
          />
        )}
      </div>

      {/* Add card */}
      <AddCardInput category={activeTab} color={currentTab.color} onAdd={(text) => onAddCard(activeTab, text)} />

      {/* Bottom action */}
      <div style={{ padding: "10px 12px 16px", borderTop: `1px solid ${T.navyBorder}`, flexShrink: 0 }}>
        <Btn variant="primary" size="md" full onClick={onNext}>Passer au vote →</Btn>
      </div>
    </div>
  );
}

function CardItem({ card, catColor, onOpenComments }: { card: Card; catColor: string; onOpenComments: (c: Card) => void }) {
  const p = PARTICIPANTS.find(part => part.name === card.author);
  return (
    <div
      style={{
        background: T.navyMid,
        border: `1px solid ${T.navyBorder}`,
        borderLeft: `3px solid ${catColor}`,
        borderRadius: 10,
        padding: "10px 12px",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
        {p && <Avatar name={p.name} color={p.avatarColor} size={18} />}
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400, fontWeight: 500 }}>{card.author}</span>
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate100, lineHeight: 1.55, margin: 0 }}>{card.content}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <button
          onClick={() => onOpenComments(card)}
          aria-label={`${card.commentCount} commentaire${card.commentCount !== 1 ? "s" : ""} – ouvrir`}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "transparent", border: "none", cursor: "pointer",
            color: card.commentCount > 0 ? T.slate400 : T.slate600,
            padding: "3px 0",
          }}
        >
          <Icon.Comment size={13} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: card.commentCount > 0 ? T.slate400 : T.slate600 }}>{card.commentCount}</span>
        </button>
      </div>
    </div>
  );
}

function AddCardInput({ category, color, onAdd }: { category: Category; color: string; onAdd: (text: string) => void }) {
  const [value, setValue] = useState("");
  const submit = () => {
    const t = value.trim();
    if (!t) return;
    onAdd(t);
    setValue("");
  };
  return (
    <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.navyBorder}`, flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Nouvelle carte…"
          rows={2}
          style={{
            flex: 1, borderRadius: 9,
            border: `1px solid ${value ? color + "60" : T.navyBorderMed}`,
            background: T.navySurface,
            padding: "8px 10px",
            fontFamily: "'Inter', sans-serif",
            fontSize: 13, color: T.slate50,
            outline: "none", resize: "none",
            transition: "border-color 0.15s",
          }}
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          style={{
            width: 34, height: 34,
            borderRadius: 9, border: "none",
            background: value.trim() ? color : T.navySurfaceMed,
            color: value.trim() ? T.white : T.slate600,
            cursor: value.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.15s",
          }}
        >
          <Icon.Plus size={15} />
        </button>
      </div>
    </div>
  );
}
