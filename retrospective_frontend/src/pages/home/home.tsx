import { useLocation } from "react-router-dom";
import HomeHero from "./components/HomeHero";
import HomeTabsCard from "./components/HomeTabsCard";

interface HomeLocationState {
  tab?: "create" | "join";
}

const Home = () => {
  const location = useLocation();
  const state = location.state as HomeLocationState | null;

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
