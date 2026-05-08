import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import StatsSection from "../components/StatsSection";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="bg-black">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <StatsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
