import Container from "@/components/ui/Container";
import HomeHero from "./components/HomeHero";
import HomeTabsCard from "./components/HomeTabsCard";
import HomeFeatureSection from "./components/HomeFeatureSection";

// Valeur d'attente en dur : sera remplacée par le nombre réel de participants
// quand la page sera branchée au backend (hors périmètre de ce ticket).
const CONNECTED_PARTICIPANTS = 7;

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 flex items-center justify-center py-12">
      <Container className="flex flex-col items-center">
        <HomeHero connectedCount={CONNECTED_PARTICIPANTS} />
        <HomeTabsCard />
        <HomeFeatureSection />
      </Container>
    </div>
  );
};

export default Home;
