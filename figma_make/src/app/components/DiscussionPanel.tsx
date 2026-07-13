import { useState, useRef, useEffect } from "react";
import { T, IconBtn, Icon, Avatar } from "./ui";
import { Message, Participant } from "../types";
import { PARTICIPANTS } from "../mockData";

interface DiscussionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSend: (text: string) => void;
  isDesktop: boolean;
  onMarkRead: () => void;
}

export function DiscussionPanel({ isOpen, onClose, messages, onSend, isDesktop, onMarkRead }: DiscussionPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      onMarkRead();
    }
  }, [isOpen, messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  };

  const getParticipant = (name: string): Participant => {
    return PARTICIPANTS.find(p => p.name === name) ?? { id: 0, name, avatarColor: T.slate500, status: "online", isAdmin: false };
  };

  const panelContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.navyMid }} role="complementary" aria-label="Panneau de discussion">
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon.Chat size={15} aria-hidden="true" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: T.slate50 }}>Discussion</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400 }}>{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer le panneau de discussion"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "transparent", border: `1px solid ${T.navyBorderMed}`,
            borderRadius: 8, padding: "4px 10px",
            fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400,
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.navySurface; e.currentTarget.style.color = T.slate200; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.slate400; }}
        >
          <Icon.X size={12} aria-hidden="true" />
          <span>Fermer</span>
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, i) => {
          const p = getParticipant(msg.author);
          const showName = !msg.me && (i === 0 || messages[i - 1].author !== msg.author || messages[i - 1].me);
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.me ? "flex-end" : "flex-start" }}>
              {!msg.me && showName && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <Avatar name={p.name} color={p.avatarColor} size={18} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: T.slate300 }}>{msg.author}</span>
                </div>
              )}
              <div style={{
                background: msg.me ? "#1e3a5f" : T.navySurfaceMed,
                border: `1px solid ${msg.me ? "rgba(59,130,246,0.3)" : T.navyBorder}`,
                borderRadius: msg.me ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                padding: "8px 12px",
                maxWidth: "84%",
              }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate100, lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
              </div>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: T.slate500, marginTop: 3 }}>{msg.time}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.navyBorder}`, display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Écrire un message… (Entrée pour envoyer)"
          aria-label="Écrire un message"
          rows={1}
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
          aria-label="Envoyer le message"
          style={{
            width: 38,
            height: 38,
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
    return (
      <div style={{
        width: isOpen ? 420 : 0,
        overflow: "hidden",
        transition: "width 0.25s ease",
        borderLeft: `1px solid ${T.navyBorder}`,
        flexShrink: 0,
      }}>
        <div style={{ width: 420, height: "100%" }}>
          {panelContent}
        </div>
      </div>
    );
  }

  // Mobile: full screen overlay
  return (
    <>
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", flexDirection: "column" }}>
          {panelContent}
        </div>
      )}
    </>
  );
}
