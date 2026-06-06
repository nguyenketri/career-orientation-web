import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import StatsSection from "../components/StatsSection";
import CTASection from "../components/CTASection";

const HomePage = () => {
  return (
    <div className="bg-slate-50">
      <HeroSection />
      <FeatureSection />
      <StatsSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
