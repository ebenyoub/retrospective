import React, { useEffect, useState } from "react";
import { T, Btn, IconBtn, Icon, Avatar } from "./ui";
import { Screen, Participant } from "../types";

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isDesktop;
}

const SCREEN_LABELS: Partial<Record<Screen, string>> = {
  waiting: "Salle d'attente",
  writing: "Écriture des cartes",
  vote: "Vote",
  results: "Résultats",
  action: "Plan d'action",
  summary: "Récapitulatif",
};

const STEPS: Screen[] = ["waiting", "writing", "vote", "results", "action", "summary"];

interface NavBarProps {
  screen: Screen;
  sessionName: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  isDiscussionOpen: boolean;
  onToggleDiscussion: () => void;
  isParticipantsPanelOpen: boolean;
  onToggleParticipants: () => void;
  unreadMessages: number;
  participants: Participant[];
  isDesktop: boolean;
}

export function NavBar({
  screen, sessionName, onBack, rightSlot,
  isDiscussionOpen, onToggleDiscussion,
  isParticipantsPanelOpen, onToggleParticipants,
  unreadMessages, participants, isDesktop,
}: NavBarProps) {
  const [copied, setCopied] = React.useState(false);
  const label = SCREEN_LABELS[screen];
  const stepIndex = STEPS.indexOf(screen);
  const showSteps = stepIndex >= 0;
  const onlineCount = participants.filter(p => p.status === "online").length;

  const copyLink = () => {
    navigator.clipboard.writeText("retroflow.app/join/A4F7K2").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      height: isDesktop ? 56 : 52,
      background: T.navyMid,
      borderBottom: `1px solid ${T.navyBorder}`,
      display: "flex",
      alignItems: "center",
      paddingInline: isDesktop ? 20 : 12,
      gap: 8,
      position: "sticky",
      top: 0,
      zIndex: 40,
      flexShrink: 0,
    }}>
      {/* Left — back button + logo + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
        {/* Back button — always shown on desktop when there's history, on mobile too */}
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Retour à l'étape précédente"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "transparent", border: `1px solid ${T.navyBorder}`,
              borderRadius: 8, padding: "4px 10px",
              fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
              color: T.slate400, cursor: "pointer",
              flexShrink: 0, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.navySurface; e.currentTarget.style.color = T.slate200; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.slate400; }}
          >
            <Icon.Back size={14} />
            {isDesktop && <span>Retour</span>}
          </button>
        )}

        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 15, color: T.green, letterSpacing: -0.4, flexShrink: 0 }}>
          Range ta chambre
        </span>

        {screen !== "home" && sessionName && (
          <>
            <span style={{ color: T.slate700, fontSize: 14, flexShrink: 0 }}>/</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate300, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: isDesktop ? 220 : 120 }}>
              {sessionName}
            </span>
            {label && (
              <>
                <span style={{ color: T.slate700, fontSize: 13, flexShrink: 0 }}>/</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: T.slate500, whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </>
            )}
          </>
        )}
      </div>

      {/* Center — step progress (desktop) */}
      {isDesktop && showSteps && (
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
          {STEPS.map((s, i) => {
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            const stepLabel = SCREEN_LABELS[s];
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {/* Connector line */}
                {i > 0 && (
                  <div style={{ width: 20, height: 1, background: isDone ? T.green : T.navyBorderMed, transition: "background 0.3s" }} />
                )}
                <div
                  title={stepLabel}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: isActive ? "3px 10px" : "3px 6px",
                    borderRadius: 20,
                    background: isActive ? T.navySurfaceMed : "transparent",
                    border: `1px solid ${isActive ? T.navyBorderMed : "transparent"}`,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: isActive ? 8 : 7,
                    height: isActive ? 8 : 7,
                    borderRadius: "50%",
                    background: isDone ? T.green : isActive ? T.slate50 : T.slate600,
                    flexShrink: 0,
                    transition: "all 0.2s",
                  }} />
                  {isActive && stepLabel && (
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: T.slate200, whiteSpace: "nowrap" }}>
                      {stepLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Right — actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {rightSlot}

        {/* Copy session code chip */}
        {isDesktop && label && (
          <button
            onClick={copyLink}
            aria-label={copied ? "Lien copié" : "Copier le lien de session"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: copied ? T.green + "20" : T.navySurface,
              border: `1px solid ${copied ? T.green + "40" : T.navyBorderMed}`,
              borderRadius: 8, padding: "5px 12px",
              fontFamily: "JetBrains Mono, monospace", fontSize: 11,
              color: copied ? T.green : T.slate300,
              cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
            }}
          >
            <Icon.Copy size={12} />
            {copied ? "Copié !" : "A4F7K2"}
          </button>
        )}

        {label && (
          <>
            {/* Desktop: text label buttons for accessibility */}
            {isDesktop ? (
              <>
                <button
                  onClick={onToggleParticipants}
                  aria-label="Afficher/masquer les participants"
                  aria-pressed={isParticipantsPanelOpen}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: isParticipantsPanelOpen ? T.navySurfaceMed : "transparent",
                    border: `1px solid ${isParticipantsPanelOpen ? T.navyBorderMed : "transparent"}`,
                    borderRadius: 8, padding: "5px 10px",
                    fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                    color: isParticipantsPanelOpen ? T.slate200 : T.slate400,
                    cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.navySurfaceMed; e.currentTarget.style.color = T.slate200; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isParticipantsPanelOpen ? T.navySurfaceMed : "transparent"; e.currentTarget.style.color = isParticipantsPanelOpen ? T.slate200 : T.slate400; }}
                >
                  <Icon.Users size={14} />
                  <span>Participants</span>
                  {onlineCount > 0 && (
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: T.green, background: T.green + "20", borderRadius: 10, padding: "0 5px" }}>
                      {onlineCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={onToggleDiscussion}
                  aria-label="Afficher/masquer la discussion"
                  aria-pressed={isDiscussionOpen}
                  style={{
                    position: "relative",
                    display: "flex", alignItems: "center", gap: 6,
                    background: isDiscussionOpen ? T.navySurfaceMed : "transparent",
                    border: `1px solid ${isDiscussionOpen ? T.navyBorderMed : "transparent"}`,
                    borderRadius: 8, padding: "5px 10px",
                    fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                    color: isDiscussionOpen ? T.slate200 : T.slate400,
                    cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.navySurfaceMed; e.currentTarget.style.color = T.slate200; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDiscussionOpen ? T.navySurfaceMed : "transparent"; e.currentTarget.style.color = isDiscussionOpen ? T.slate200 : T.slate400; }}
                >
                  <Icon.Chat size={14} />
                  <span>Discussion</span>
                  {!isDiscussionOpen && unreadMessages > 0 && (
                    <span style={{
                      background: T.red, color: T.white,
                      borderRadius: 10, padding: "0 5px",
                      fontFamily: "JetBrains Mono, monospace", fontSize: 10, fontWeight: 700,
                    }}>{unreadMessages > 9 ? "9+" : unreadMessages}</span>
                  )}
                </button>
              </>
            ) : (
              <>
                <IconBtn onClick={onToggleParticipants} active={isParticipantsPanelOpen} title="Participants">
                  <Icon.Users size={15} />
                  {onlineCount > 0 && !isParticipantsPanelOpen && (
                    <span style={{ marginLeft: 2, fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: T.green }}>
                      {onlineCount}
                    </span>
                  )}
                </IconBtn>
                <IconBtn onClick={onToggleDiscussion} active={isDiscussionOpen} title="Discussion" badge={!isDiscussionOpen ? unreadMessages : 0}>
                  <Icon.Chat size={15} />
                </IconBtn>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Participants Sidebar ─────────────────────────────────────────────────────
interface ParticipantsSidebarProps {
  participants: Participant[];
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
}

export function ParticipantsSidebar({ participants, isOpen, onClose, isDesktop }: ParticipantsSidebarProps) {
  const online = participants.filter(p => p.status === "online");
  const away = participants.filter(p => p.status === "away");
  const offline = participants.filter(p => p.status === "offline");
  const statusColor = { online: T.green, away: "#f59e0b", offline: T.slate600 };
  const statusLabel = { online: "En ligne", away: "Absent", offline: "Déconnecté" };

  if (isDesktop) {
    return (
      <div style={{
        width: isOpen ? 240 : 0,
        overflow: "hidden",
        transition: "width 0.25s ease",
        background: T.navyMid,
        borderRight: `1px solid ${T.navyBorder}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}>
        <div style={{ width: 240, display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.slate400, letterSpacing: 0.8, textTransform: "uppercase" }}>
              Participants · {participants.length}
            </span>
          </div>
          <div style={{ padding: "8px 0", flex: 1 }}>
            {([["online", online], ["away", away], ["offline", offline]] as const).map(([status, group]) =>
              group.length > 0 && (
                <div key={status} style={{ marginBottom: 8 }}>
                  <div style={{ padding: "4px 16px", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, color: T.slate600, letterSpacing: 0.6, textTransform: "uppercase" }}>
                    {statusLabel[status]} — {group.length}
                  </div>
                  {group.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 6, margin: "1px 6px" }}>
                      <Avatar name={p.name} color={p.avatarColor} size={26} status={p.status} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: status === "online" ? T.slate200 : T.slate500, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.name}
                        </p>
                        {p.isAdmin && (
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.yellow, fontWeight: 600 }}>Admin</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile: bottom sheet
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: T.navyMid,
          borderRadius: "16px 16px 0 0",
          maxHeight: "60vh",
          overflow: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "12px 16px 8px", borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: T.slate50 }}>
            Participants ({participants.length})
          </span>
          <IconBtn onClick={onClose}><Icon.X /></IconBtn>
        </div>
        <div style={{ padding: "8px 0 20px" }}>
          {participants.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px" }}>
              <Avatar name={p.name} color={p.avatarColor} size={32} status={p.status} />
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate200, fontWeight: 500 }}>{p.name}</p>
                {p.isAdmin && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.yellow }}>Admin</span>}
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[p.status], display: "inline-block" }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate500 }}>{statusLabel[p.status]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── App Shell ────────────────────────────────────────────────────────────────
interface AppShellProps {
  children: React.ReactNode;
  navbar: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  isDesktop: boolean;
}

export function AppShell({ children, navbar, leftPanel, rightPanel, isDesktop }: AppShellProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.navy, overflow: "hidden" }}>
      {navbar}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {leftPanel}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        {rightPanel}
      </div>
    </div>
  );
}
