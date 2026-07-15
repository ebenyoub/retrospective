import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import { resolveLandingRoute } from "@/lib/sessionLanding";
import HomeHero from "./components/HomeHero";
import HomeTabsCard from "./components/HomeTabsCard";

interface HomeLocationState {
  tab?: "create" | "join";
  fromSessions?: boolean;
}

const Home = () => {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as HomeLocationState | null;
  const hasExplicitIntent = Boolean(state?.tab || state?.fromSessions);

  // Suppression de la redirection automatique vers une session active.
  // L'utilisateur authentifié reste sur l'accueil ou navigue de lui-même.
  useEffect(() => {
    // Inerte
  }, [isAuthenticated]);

  return (
    <div className="flex-1 flex items-center justify-center py-8 px-5">
      <div className="w-full max-w-[480px]">
        <HomeHero />
        <HomeTabsCard initialTab={state?.tab} />
      </div>
    </div>
  );
};

export default Home;
