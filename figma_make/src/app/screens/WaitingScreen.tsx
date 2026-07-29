import { T, Btn, Icon, Avatar } from "../components/ui";
import { Participant } from "../types";

interface WaitingScreenProps {
  sessionName: string;
  participants: Participant[];
  onStart: () => void;
  isDesktop: boolean;
}

export function WaitingScreen({ sessionName, participants, onStart, isDesktop }: WaitingScreenProps) {
  const online = participants.filter(p => p.status === "online").length;

  if (isDesktop) {
    return (
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: session info + actions */}
        <div style={{ width: 400, flexShrink: 0, borderRight: `1px solid ${T.navyBorder}`, overflowY: "auto", padding: "32px 32px" }}>
          {/* Status badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.green, fontWeight: 600 }}>
              {online}/{participants.length} participants connectés
            </span>
          </div>

          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 28, color: T.slate50, marginBottom: 8, letterSpacing: -0.5, lineHeight: 1.2 }}>
            {sessionName}
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate400, lineHeight: 1.5, marginBottom: 28 }}>
            Partagez le lien ci-dessous pour inviter vos coéquipiers dans la session.
          </p>

          {/* Session link */}
          <div style={{
            background: T.navyMid,
            border: `1px solid ${T.navyBorder}`,
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 28,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <Icon.Copy size={14} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: T.slate400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                retroflow.app/join/A4F7K2
              </span>
            </div>
            <Btn size="sm" variant="secondary" icon={<Icon.Copy size={12} />}>
              Copier
            </Btn>
          </div>

          {/* Session meta */}
          <div style={{ marginBottom: 32 }}>
            {[
              { label: "Code session", value: "A4F7K2", mono: true },
              { label: "Participants", value: `${participants.length} inscrits, ${online} en ligne`, mono: false },
              { label: "Format", value: "Start / Stop / Continue", mono: false },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.navyBorder}` }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate500 }}>{row.label}</span>
                <span style={{ fontFamily: row.mono ? "JetBrains Mono, monospace" : "'Inter', sans-serif", fontSize: 12, color: T.slate200, fontWeight: row.mono ? 700 : 500, letterSpacing: row.mono ? 1 : 0 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn variant="primary" size="lg" full icon={<Icon.Plus size={16} />} onClick={onStart}>
              Lancer la rétro
            </Btn>
            <Btn variant="danger" size="md" full icon={<Icon.Logout size={16} />}>
              Quitter la session
            </Btn>
          </div>
        </div>

        {/* Right: participants grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.slate500, letterSpacing: 0.8, textTransform: "uppercase" }}>
              Participants
            </span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate500 }}>{participants.length}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {participants.map(p => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
          </div>

          {/* Invitation placeholder slots */}
          {participants.length < 8 && (
            <div style={{ marginTop: 20 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: T.slate600 }}>
                Invitez jusqu'à {8 - participants.length} participant{8 - participants.length > 1 ? "s" : ""} de plus…
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "100%" }}>
        {/* Status */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.green, fontWeight: 600 }}>
              {online}/{participants.length} participants connectés
            </span>
          </div>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 22, color: T.slate50, marginBottom: 8, letterSpacing: -0.4 }}>
            En attente des participants
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: T.slate400, lineHeight: 1.5 }}>
            Partagez le lien de la session pour que vos coéquipiers puissent rejoindre.
          </p>
        </div>

        {/* Session link */}
        <div style={{
          background: T.navyMid,
          border: `1px solid ${T.navyBorder}`,
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <Icon.Copy size={14} />
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: T.slate400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              retroflow.app/join/A4F7K2
            </span>
          </div>
          <Btn size="sm" variant="secondary" icon={<Icon.Copy size={12} />}>
            Copier
          </Btn>
        </div>

        {/* Participants grid */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: T.slate500, letterSpacing: 0.8, textTransform: "uppercase" }}>
              Participants
            </span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: T.slate500 }}>{participants.length}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {participants.map(p => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
          <Btn variant="primary" size="lg" full icon={<Icon.Plus size={16} />} onClick={onStart}>
            Lancer la rétro
          </Btn>
          <Btn variant="danger" size="lg" icon={<Icon.Logout size={16} />}>
            Quitter
          </Btn>
        </div>
      </div>
    </div>
  );
}

function ParticipantCard({ participant: p }: { participant: Participant }) {
  const statusColor = { online: T.green, away: "#f59e0b", offline: T.slate600 };
  const statusLabel = { online: "En ligne", away: "Absent", offline: "Déconnecté" };

  return (
    <div style={{
      background: T.navyMid,
      border: `1px solid ${T.navyBorder}`,
      borderRadius: 12,
      padding: "12px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <Avatar name={p.name} color={p.avatarColor} size={32} status={p.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: p.status === "online" ? T.slate100 : T.slate500, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
          {p.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[p.status], display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.slate600 }}>{statusLabel[p.status]}</span>
          {p.isAdmin && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: T.yellow, fontWeight: 600, marginLeft: 4 }}>Admin</span>}
        </div>
      </div>
    </div>
  );
}
