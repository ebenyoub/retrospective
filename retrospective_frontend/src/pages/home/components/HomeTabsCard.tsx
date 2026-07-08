import { useState, type ChangeEvent } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/FormContainer";

type Tab = "create" | "join";

interface HomeTabsCardProps {
  onCreateSession?: (retroName: string, userName: string) => void;
  onJoinSession?: (code: string) => void;
}

const HomeTabsCard = ({ onCreateSession, onJoinSession }: HomeTabsCardProps) => {
  const [tab, setTab] = useState<Tab>("create");
  const [retroName, setRetroName] = useState("Sprint 42 – Revue");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const handleCreate = () => {
    onCreateSession?.(retroName, userName);
  };

  const handleJoin = () => {
    onJoinSession?.(code);
  };

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.replace(/\D/g, "").slice(0, 4));
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-figma-xl border border-navy-border bg-navy-mid overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <div className="flex border-b border-navy-border">
        <button
          type="button"
          onClick={() => setTab("create")}
          style={{
            borderBottom: `2px solid ${tab === "create" ? "var(--color-slate-50)" : "transparent"}`
          }}
          className={`flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer ${
            tab === "create" ? "text-slate-50" : "text-slate-500"
          }`}
        >
          Créer une rétro
        </button>
        <button
          type="button"
          onClick={() => setTab("join")}
          style={{
            borderBottom: `2px solid ${tab === "join" ? "var(--color-slate-50)" : "transparent"}`
          }}
          className={`flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer ${
            tab === "join" ? "text-slate-50" : "text-slate-500"
          }`}
        >
          Rejoindre
        </button>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {tab === "create" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Nom de la rétro
              </span>
              <Input
                value={retroName}
                onChange={(event) => setRetroName(event.target.value)}
                placeholder="Sprint 42 – Revue"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Votre prénom
              </span>
              <Input
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                placeholder="Ex : Elyas"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Mot de passe
              </span>
              <span className="text-[11px] text-slate-500 -mt-1 leading-normal">
                Pour revenir sur la session si vous êtes déconnecté.
              </span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••"
              />
            </div>

            <Button variant="primary" size="lg" className="w-full mt-2" onClick={handleCreate}>
              Lancer la rétro →
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="block font-sans text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Code de la session
              </span>
              <Input
                value={code}
                onChange={handleCodeChange}
                placeholder="1234"
                inputMode="numeric"
                maxLength={4}
                className="text-center tracking-widest text-lg"
              />
            </div>

            <Button variant="success" size="lg" className="w-full mt-2" onClick={handleJoin}>
              Rejoindre →
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeTabsCard;
