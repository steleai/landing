import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import VisionSection from "@/components/VisionSection";
import MissionSection from "@/components/MissionSection";
import TeamSection from "@/components/TeamSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="wrap">
    <Navbar />
    <main id="main" tabIndex={-1}>
      <HeroSection />
      <ProductsSection />
      <VisionSection />
      <MissionSection />
      <TeamSection />
      <ContactSection />
    </main>
    <Footer />
  </div>
);

export default Index;
