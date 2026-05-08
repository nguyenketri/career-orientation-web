import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";

const HomePage = () => {
  return (
    <div className="bg-black">
      <Navbar />
      <HeroSection />
      <FeatureSection />
    </div>
  );
};

export default HomePage;
