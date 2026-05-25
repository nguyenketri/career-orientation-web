import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import StatsSection from "../components/StatsSection";

const HomePage = () => {
  return (
    <div className="bg-black">
      <HeroSection />
      <FeatureSection />
      <StatsSection />
    </div>
  );
};

export default HomePage;
