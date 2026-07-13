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

  // Retour d'un facilitateur (ou participant) déjà connecté sur l'accueil :
  // s'il a une session active, on l'y renvoie directement — sauf s'il vient
  // du menu Profil avec une intention explicite (ex. "Créer une rétrospective").
  useEffect(() => {
    if (!isAuthenticated || !token || hasExplicitIntent) return;

    let isActive = true;

    resolveLandingRoute(token).then((route) => {
      if (isActive && route !== "/") {
        navigate(route, { replace: true });
      }
    });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, token, navigate, hasExplicitIntent]);

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
