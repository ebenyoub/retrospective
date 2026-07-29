import { useState } from "react";
import { T, Btn, Input } from "../components/ui";

interface HomeScreenProps {
  onCreateSession: (name: string, retroName: string) => void;
  onJoinSession: (name: string) => void;
}

export function HomeScreen({ onCreateSession, onJoinSession }: HomeScreenProps) {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [retroName, setRetroName] = useState("Sprint 42 – Revue");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const handleCode = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    if (d) {
      const nextEl = document.getElementById(`code-${i + 1}`);
      nextEl?.focus();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.navy, display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <div style={{ height: 56, background: T.navyMid, borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", paddingInline: 20 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 16, color: T.green, letterSpacing: -0.4 }}>
          Range ta chambre
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Btn size="sm" variant="ghost">Aide</Btn>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: 32, color: T.green, letterSpacing: -1 }}>Range ta chambre</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.navySurfaceMed, border: `1px solid ${T.navyBorderMed}`, borderRadius: 20, padding: "5px 12px", marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate400, fontWeight: 500 }}>7 participants connectés</span>
            </div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 28, color: T.slate50, letterSpacing: -0.6, marginBottom: 10, lineHeight: 1.2 }}>
              Rétrospective collaborative
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: T.slate400, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
              Collectez les retours de votre équipe, votez et définissez des actions en quelques minutes.
            </p>
          </div>

          {/* Card */}
          <div style={{ background: T.navyMid, border: `1px solid ${T.navyBorder}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${T.navyBorder}` }}>
              {(["create", "join"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: "13px 0",
                    fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
                    color: tab === t ? T.slate50 : T.slate500,
                    background: "transparent", border: "none",
                    borderBottom: `2px solid ${tab === t ? T.slate50 : "transparent"}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    marginBottom: -1,
                  }}
                >
                  {t === "create" ? "Créer une rétro" : "Rejoindre"}
                </button>
              ))}
            </div>

            {/* Form */}
            <div style={{ padding: "24px 24px 20px" }}>
              {tab === "create" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Input label="Nom de la rétro" placeholder="Sprint 42 – Revue" value={retroName} onChange={e => setRetroName(e.target.value)} />
                  <Input label="Votre prénom" placeholder="Ex : Elyas" value={userName} onChange={e => setUserName(e.target.value)} />
                  <Input label="Mot de passe" hint="Pour revenir sur la session si vous êtes déconnecté." placeholder="••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                  <div style={{ paddingTop: 4 }}>
                    <Btn variant="primary" size="lg" full onClick={() => onCreateSession(userName, retroName)}>
                      Lancer la rétro →
                    </Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: T.slate400, letterSpacing: 0.5, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Code de la session</label>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {code.map((d, i) => (
                        <input
                          key={i}
                          id={`code-${i}`}
                          maxLength={1}
                          value={d}
                          onChange={e => handleCode(i, e.target.value)}
                          style={{
                            width: 46, height: 54, textAlign: "center",
                            fontSize: 20, fontWeight: 700,
                            fontFamily: "JetBrains Mono, monospace",
                            borderRadius: 10,
                            border: `1px solid ${d ? "rgba(255,255,255,0.3)" : T.navyBorderMed}`,
                            background: d ? "rgba(255,255,255,0.08)" : T.navySurface,
                            color: T.slate50,
                            outline: "none",
                            transition: "all 0.15s",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${T.navyBorder}`, paddingTop: 16 }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: T.slate500, marginBottom: 12 }}>Ou reprendre une session en cours</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <Input label="Votre prénom" placeholder="Ex : Elyas" />
                      <Input label="Mot de passe" placeholder="••••••" type="password" />
                    </div>
                  </div>
                  <Btn variant="success" size="lg" full onClick={() => onJoinSession("Elyas")}>
                    Rejoindre →
                  </Btn>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
