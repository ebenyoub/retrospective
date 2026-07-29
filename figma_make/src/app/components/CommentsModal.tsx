import { useState } from "react";
import { T, IconBtn, Icon, Avatar, CategoryBadge, ModalBackdrop } from "./ui";
import { Card, Comment } from "../types";
import { PARTICIPANTS } from "../mockData";

interface CommentsModalProps {
  card: Card;
  comments: Comment[];
  onClose: () => void;
  onAddComment: (cardId: number, text: string) => void;
  isDesktop: boolean;
}

export function CommentsModal({ card, comments, onClose, onAddComment, isDesktop }: CommentsModalProps) {
  const [input, setInput] = useState("");

  const cardComments = comments.filter(c => c.cardId === card.id);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    onAddComment(card.id, text);
    setInput("");
  };

  const getColor = (name: string) => {
    return PARTICIPANTS.find(p => p.name === name)?.avatarColor ?? T.slate500;
  };

  const content = (
    <div style={{
      background: T.navyMid,
      borderRadius: isDesktop ? 16 : "16px 16px 0 0",
      border: `1px solid ${T.navyBorder}`,
      width: isDesktop ? 520 : "100%",
      maxHeight: isDesktop ? "80vh" : "85vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
    }}>
      {/* Header */}
      <div style={{ padding: "16px 18px 14px", borderBottom: `1px solid ${T.navyBorder}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <CategoryBadge category={card.category} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500 }}>{card.author}</span>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate100, lineHeight: 1.5, margin: 0 }}>
              {card.content}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer les commentaires"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "transparent", border: `1px solid ${T.navyBorderMed}`,
              borderRadius: 8, padding: "4px 10px",
              fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400,
              cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.navySurface; e.currentTarget.style.color = T.slate200; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.slate400; }}
          >
            <Icon.X size={12} aria-hidden="true" />
            <span>Fermer</span>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Icon.Comment size={13} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400 }}>{cardComments.length} commentaire{cardComments.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate400 }}>⭐ {card.votes} votes</span>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {cardComments.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate500 }}>Aucun commentaire — soyez le premier !</p>
          </div>
        )}
        {cardComments.map(comment => (
          <div key={comment.id} style={{ display: "flex", gap: 10 }}>
            <Avatar name={comment.author} color={getColor(comment.author)} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: T.slate300 }}>{comment.author}</span>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: T.slate600 }}>{comment.time}</span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate200, lineHeight: 1.55, margin: 0 }}>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add comment */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.navyBorder}`, display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ajouter un commentaire… (Entrée pour envoyer)"
          aria-label="Écrire un commentaire"
          rows={2}
          style={{
            flex: 1,
            borderRadius: 10,
            border: `1px solid ${T.navyBorderMed}`,
            background: T.navySurface,
            padding: "9px 12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: T.slate50,
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          aria-label="Envoyer le commentaire"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "none",
            background: input.trim() ? T.green : T.navySurfaceMed,
            color: input.trim() ? T.white : T.slate600,
            cursor: input.trim() ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          <Icon.Send size={15} />
        </button>
      </div>
    </div>
  );

  if (isDesktop) {
    return <ModalBackdrop onClose={onClose}>{content}</ModalBackdrop>;
  }

  // Mobile: bottom sheet
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}
