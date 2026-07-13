import { useState } from "react";
import { T, Btn, Icon, Avatar, SearchBar, EmptyState, TimerChip } from "../components/ui";
import { Card, Category } from "../types";
import { PARTICIPANTS } from "../mockData";

const TAB_CONFIG: { key: Category; label: string; emoji: string; color: string }[] = [
  { key: "positif", label: "Positif", emoji: "✅", color: T.green },
  { key: "negatif", label: "Négatif", emoji: "🚧", color: T.red },
  { key: "idee", label: "Idées", emoji: "💡", color: T.yellow },
];

interface VoteScreenProps {
  cards: Card[];
  votesLeft: number;
  onVote: (id: number) => void;
  onUnvote: (id: number) => void;
  onOpenComments: (card: Card) => void;
  onNext: () => void;
  isDesktop: boolean;
}

export function VoteScreen({ cards, votesLeft, onVote, onUnvote, onOpenComments, onNext, isDesktop }: VoteScreenProps) {
  const [activeTab, setActiveTab] = useState<Category>("positif");
  const [search, setSearch] = useState("");
  const [compact, setCompact] = useState(false);

  if (isDesktop) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Desktop toolbar */}
        <div style={{ padding: "10px 20px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Votes remaining */}
          <div
            role="status"
            aria-label={`${votesLeft} votes restants sur 5`}
            style={{ display: "flex", alignItems: "center", gap: 8, background: T.navySurface, border: `1px solid ${T.navyBorderMed}`, borderRadius: 8, padding: "5px 12px", flexShrink: 0 }}
          >
            <div style={{ display: "flex", gap: 3 }} aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < votesLeft ? T.yellow : T.navyBorderMed, transition: "background 0.2s" }} />
              ))}
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: T.slate200 }}>
              {votesLeft} vote{votesLeft !== 1 ? "s" : ""} restant{votesLeft !== 1 ? "s" : ""}
            </span>
          </div>

          <div style={{ flex: 1, maxWidth: 320 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une carte…" />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            {/* Compact / detailed toggle */}
            <div style={{ display: "flex", background: T.navySurface, border: `1px solid ${T.navyBorderMed}`, borderRadius: 8, overflow: "hidden" }}>
              <button
                onClick={() => setCompact(false)}
                aria-pressed={!compact}
                title="Vue détaillée"
                style={{
                  padding: "5px 10px", border: "none", cursor: "pointer",
                  background: !compact ? T.navySurfaceMed : "transparent",
                  color: !compact ? T.slate200 : T.slate500,
                  fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                Détaillée
              </button>
              <button
                onClick={() => setCompact(true)}
                aria-pressed={compact}
                title="Vue compacte"
                style={{
                  padding: "5px 10px", border: "none", cursor: "pointer",
                  background: compact ? T.navySurfaceMed : "transparent",
                  color: compact ? T.slate200 : T.slate500,
                  fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                Compacte
              </button>
            </div>
            <TimerChip value="04:30" />
            <Btn variant="primary" size="sm" onClick={onNext}>Voir les résultats →</Btn>
          </div>
        </div>

        {/* 3-column Kanban */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, overflow: "hidden", background: T.navyBorder }}>
          {TAB_CONFIG.map(tab => {
            const catCards = cards.filter(c => c.category === tab.key &&
              (search === "" || c.content.toLowerCase().includes(search.toLowerCase()) || c.author.toLowerCase().includes(search.toLowerCase()))
            );
            const totalVotes = cards.filter(c => c.category === tab.key).reduce((s, c) => s + c.votes, 0);
            const votedCount = cards.filter(c => c.category === tab.key && c.votedByMe).length;

            return (
              <div key={tab.key} style={{ background: T.navy, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Column header */}
                <div style={{ padding: "10px 16px 10px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 14 }} aria-hidden="true">{tab.emoji}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: T.slate100 }}>{tab.label}</span>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate500, background: T.navySurfaceMed, borderRadius: 5, padding: "1px 6px" }}>
                    {catCards.length} carte{catCards.length !== 1 ? "s" : ""}
                  </span>
                  {votedCount > 0 && (
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: tab.color, fontWeight: 600 }}>
                      · {votedCount} voté{votedCount > 1 ? "s" : ""}
                    </span>
                  )}
                  <span style={{ marginLeft: "auto", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: tab.color, background: tab.color + "15", borderRadius: 6, padding: "2px 9px" }}>
                    ⭐ {totalVotes}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ flex: 1, overflowY: "auto", padding: compact ? "6px 10px" : "10px 12px", display: "flex", flexDirection: "column", gap: compact ? 4 : 8 }}>
                  {catCards.length === 0 && (
                    <EmptyState
                      icon={<span style={{ fontSize: 22 }}>{tab.emoji}</span>}
                      title={search ? "Aucun résultat" : `Aucune carte ${tab.label.toLowerCase()}`}
                      description={search ? "Essayez d'autres mots-clés" : ""}
                    />
                  )}
                  {catCards.map(card => (
                    <VoteCard
                      key={card.id}
                      card={card}
                      votesLeft={votesLeft}
                      onVote={onVote}
                      onUnvote={onUnvote}
                      onOpenComments={onOpenComments}
                      tabColor={tab.color}
                      compact={compact}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Mobile: tabbed layout
  const filtered = cards.filter(c =>
    c.category === activeTab &&
    (search === "" || c.content.toLowerCase().includes(search.toLowerCase()) || c.author.toLowerCase().includes(search.toLowerCase()))
  );
  const currentTab = TAB_CONFIG.find(t => t.key === activeTab)!;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ padding: "10px 12px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.navySurface, border: `1px solid ${T.navyBorderMed}`, borderRadius: 8, padding: "5px 12px" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: T.slate200 }}>
            {votesLeft} vote{votesLeft !== 1 ? "s" : ""} restant{votesLeft !== 1 ? "s" : ""}
          </span>
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < votesLeft ? T.yellow : T.navyBorderMed, transition: "background 0.2s" }} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher…" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <TimerChip value="04:30" />
          <Btn variant="primary" size="sm" onClick={onNext}>Résultats →</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.navyBorder}`, flexShrink: 0, padding: "0 12px" }}>
        {TAB_CONFIG.map(tab => {
          const count = cards.filter(c => c.category === tab.key).length;
          const voted = cards.filter(c => c.category === tab.key && c.votedByMe).length;
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
                marginBottom: -1, transition: "color 0.15s",
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              <span style={{
                background: activeTab === tab.key ? tab.color + "25" : T.navySurface,
                color: activeTab === tab.key ? tab.color : T.slate600,
                borderRadius: 6, padding: "0 5px",
                fontSize: 10, fontFamily: "JetBrains Mono, monospace",
              }}>{count}</span>
              {voted > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: tab.color, display: "inline-block" }} />}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <EmptyState
            icon={<span style={{ fontSize: 28 }}>{currentTab.emoji}</span>}
            title={search ? "Aucun résultat" : "Aucune carte dans cette catégorie"}
            description={search ? "Essayez d'autres mots-clés" : ""}
          />
        )}
        {filtered.map(card => (
          <VoteCard
            key={card.id}
            card={card}
            votesLeft={votesLeft}
            onVote={onVote}
            onUnvote={onUnvote}
            onOpenComments={onOpenComments}
            tabColor={currentTab.color}
          />
        ))}
      </div>
    </div>
  );
}

function VoteCard({ card, votesLeft, onVote, onUnvote, onOpenComments, tabColor, compact = false }: {
  card: Card;
  votesLeft: number;
  onVote: (id: number) => void;
  onUnvote: (id: number) => void;
  onOpenComments: (c: Card) => void;
  tabColor: string;
  compact?: boolean;
}) {
  const p = PARTICIPANTS.find(part => part.name === card.author);
  const canVote = !card.votedByMe && votesLeft > 0;

  if (compact) {
    return (
      <div
        style={{
          background: T.navyMid,
          border: `1px solid ${card.votedByMe ? tabColor + "40" : T.navyBorder}`,
          borderLeft: `3px solid ${tabColor}`,
          borderRadius: 8,
          padding: "8px 10px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: card.votedByMe ? `0 0 0 1px ${tabColor}25` : "none",
          transition: "all 0.2s",
        }}
      >
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate100, lineHeight: 1.4, margin: 0, flex: 1 }}>
          {card.content}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => onOpenComments(card)}
            aria-label={`${card.commentCount} commentaires`}
            style={{ display: "flex", alignItems: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", color: card.commentCount > 0 ? T.slate400 : T.slate600, padding: 0 }}
          >
            <Icon.Comment size={12} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11 }}>{card.commentCount}</span>
          </button>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 700, color: card.votedByMe ? tabColor : T.slate300, minWidth: 18, textAlign: "right" }}>
            {card.votes}
          </span>
          <button
            onClick={() => card.votedByMe ? onUnvote(card.id) : onVote(card.id)}
            disabled={!card.votedByMe && votesLeft <= 0}
            aria-label={card.votedByMe ? "Retirer mon vote" : "Voter pour cette carte"}
            aria-pressed={card.votedByMe}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: 8,
              border: `1.5px solid ${card.votedByMe ? tabColor : canVote ? T.navyBorderMed : "transparent"}`,
              background: card.votedByMe ? tabColor : canVote ? T.navySurface : "transparent",
              color: card.votedByMe ? T.white : canVote ? T.slate300 : T.slate600,
              cursor: (canVote || card.votedByMe) ? "pointer" : "not-allowed",
              opacity: (!canVote && !card.votedByMe) ? 0.3 : 1,
              transition: "all 0.15s",
            }}
          >
            <Icon.ThumbUp size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: T.navyMid,
        border: `1px solid ${card.votedByMe ? tabColor + "50" : T.navyBorder}`,
        borderLeft: `3px solid ${tabColor}`,
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: card.votedByMe ? `0 0 0 1px ${tabColor}30` : "none",
        transition: "all 0.2s",
      }}
    >
      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {p && <Avatar name={p.name} color={p.avatarColor} size={20} />}
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400, fontWeight: 500 }}>{card.author}</span>
      </div>

      {/* Content */}
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate100, lineHeight: 1.55, margin: 0 }}>
        {card.content}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => onOpenComments(card)}
          aria-label={`${card.commentCount} commentaire${card.commentCount !== 1 ? "s" : ""} – ouvrir`}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", color: card.commentCount > 0 ? T.slate400 : T.slate600, padding: "4px 0" }}
        >
          <Icon.Comment size={14} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12 }}>{card.commentCount} commentaire{card.commentCount !== 1 ? "s" : ""}</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 16, fontWeight: 700, color: card.votedByMe ? tabColor : T.slate200 }}>
            {card.votes}
          </span>
          <button
            onClick={() => card.votedByMe ? onUnvote(card.id) : onVote(card.id)}
            disabled={!card.votedByMe && votesLeft <= 0}
            aria-label={card.votedByMe ? "Retirer mon vote" : canVote ? "Voter pour cette carte" : "Plus de votes disponibles"}
            aria-pressed={card.votedByMe}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              borderRadius: 9,
              border: `1.5px solid ${card.votedByMe ? tabColor : canVote ? T.navyBorderMed : "transparent"}`,
              background: card.votedByMe ? tabColor : canVote ? T.navySurfaceMed : "transparent",
              color: card.votedByMe ? T.white : canVote ? T.slate200 : T.slate600,
              padding: "6px 14px",
              fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
              cursor: (canVote || card.votedByMe) ? "pointer" : "not-allowed",
              opacity: (!canVote && !card.votedByMe) ? 0.35 : 1,
              transition: "all 0.15s",
            }}
          >
            <Icon.ThumbUp size={14} />
            <span>{card.votedByMe ? "Voté ✓" : "Voter"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
