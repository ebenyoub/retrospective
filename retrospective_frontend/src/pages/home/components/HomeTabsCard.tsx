import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import CreateAccountForm from "./CreateAccountForm";
import CreateSessionForm from "./CreateSessionForm";
import JoinSessionForm from "./JoinSessionForm";

type Tab = "create" | "join";

interface HomeTabsCardProps {
  initialTab?: Tab;
}

const HomeTabsCard = ({ initialTab = "create" }: HomeTabsCardProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>(initialTab);

  const goToSession = (sessionId: number) => navigate(`/session/${sessionId}`);

  return (
    <div className="w-full rounded-figma-xl border border-navy-border bg-navy-mid overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
      <div className="flex border-b border-navy-border">
        <button
          type="button"
          onClick={() => setTab("create")}
          style={{
            borderBottom: `2px solid ${tab === "create" ? "var(--color-slate-50)" : "transparent"}`
          }}
          className={`flex-1 py-[13px] text-[13px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-inset ${
            tab === "create" ? "text-slate-50" : "text-slate-500 hover:text-slate-300"
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
          className={`flex-1 py-[13px] text-[13px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-inset ${
            tab === "join" ? "text-slate-50" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Rejoindre
        </button>
      </div>

      <div className="px-6 pt-6 pb-5">
        {tab === "create" ? (
          isAuthenticated ? (
            <CreateSessionForm onSessionCreated={goToSession} />
          ) : (
            <CreateAccountForm onSessionCreated={goToSession} />
          )
        ) : (
          <JoinSessionForm onSessionJoined={goToSession} />
        )}
      </div>
    </div>
  );
};

export default HomeTabsCard;
