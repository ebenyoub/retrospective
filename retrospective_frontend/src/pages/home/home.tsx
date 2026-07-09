import { useNavigate } from "react-router-dom";
import Container from "@/components/ui/Container";
import { useAuth } from "@/context/auth/useAuth";
import HomeHero from "./components/HomeHero";
import HomeTabsCard from "./components/HomeTabsCard";
import HomeFeatureSection from "./components/HomeFeatureSection";

// Valeur d'attente en dur : sera remplacée par le nombre réel de participants
// quand la page sera branchée au backend (hors périmètre de ce ticket).
const CONNECTED_PARTICIPANTS = 7;

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // La création et la jointure de session nécessitent un compte :
  // connecté → vers le vrai formulaire ; sinon → vers l'inscription/connexion.
  const handleCreateSession = () => {
    navigate(isAuthenticated ? "/session" : "/signup");
  };

  const handleJoinSession = () => {
    navigate(isAuthenticated ? "/profile" : "/login");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 flex items-center justify-center py-12">
      <Container className="flex flex-col items-center">
        <HomeHero connectedCount={CONNECTED_PARTICIPANTS} />
        <HomeTabsCard onCreateSession={handleCreateSession} onJoinSession={handleJoinSession} />
        <HomeFeatureSection />
      </Container>
    </div>
  );
};

export default Home;
