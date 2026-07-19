import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import HomeHero from "./components/HomeHero";
import HomeTabsCard from "./components/HomeTabsCard";
import ResumeSessionCard from "./components/ResumeSessionCard";
import HomeSessionList from "./components/HomeSessionList";
import type { HomeLocationState } from "./types/Home.types";

const Home = () => {
  const location = useLocation();
  const state = location.state as HomeLocationState | null;
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex-grow flex items-center justify-center py-8 px-5">
      <div className={`w-full flex flex-col md:flex-row md:items-start md:justify-center gap-8 md:gap-12 transition-all duration-300 ${
        isAuthenticated ? 'max-w-[480px] md:max-w-[960px]' : 'max-w-[480px]'
      }`}>
        <div className="w-full max-w-[480px] shrink-0">
          <HomeHero />
          <ResumeSessionCard />
          <HomeTabsCard initialTab={state?.tab} />
        </div>
        {isAuthenticated && (
          <div className="hidden md:block w-full max-w-[440px] flex-grow">
            <HomeSessionList />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
