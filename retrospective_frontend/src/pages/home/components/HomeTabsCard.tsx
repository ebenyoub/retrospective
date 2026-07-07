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
    <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-slate-800 overflow-hidden shadow-xl">
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab("create")}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            tab === "create" ? "text-slate-50 border-slate-50" : "text-slate-500 border-transparent"
          }`}
        >
          Créer une rétro
        </button>
        <button
          type="button"
          onClick={() => setTab("join")}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            tab === "join" ? "text-slate-50 border-slate-50" : "text-slate-500 border-transparent"
          }`}
        >
          Rejoindre
        </button>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {tab === "create" ? (
          <>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Nom de la rétro
              <Input
                value={retroName}
                onChange={(event) => setRetroName(event.target.value)}
                placeholder="Sprint 42 – Revue"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Votre prénom
              <Input
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                placeholder="Ex : Elyas"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Mot de passe
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••"
              />
              <span className="text-xs text-slate-500">
                Pour revenir sur la session si vous êtes déconnecté.
              </span>
            </label>

            <Button className="w-full mt-1" onClick={handleCreate}>
              Lancer la rétro →
            </Button>
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Code de la session
              <Input
                value={code}
                onChange={handleCodeChange}
                placeholder="1234"
                inputMode="numeric"
                maxLength={4}
                className="text-center tracking-widest text-lg"
              />
            </label>

            <Button className="w-full mt-1" onClick={handleJoin}>
              Rejoindre →
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeTabsCard;
