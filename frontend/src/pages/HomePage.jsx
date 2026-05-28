import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import StatsSection from "../components/StatsSection";

const HomePage = () => {
  return (
    <div className="bg-slate-50">
      <HeroSection />
      <FeatureSection />
      <StatsSection />
    </div>
  );
};

export default HomePage;
