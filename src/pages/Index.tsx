
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProductsSection from "@/components/ProductsSection";
import DevelopersSection from "@/components/DevelopersSection";
import MissionSection from "@/components/MissionSection";
import TeamSection from "@/components/TeamSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-aos]');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100 && rect.bottom >= 0;
        
        if (isVisible) {
          el.classList.add('animate-fade-in-up');
          el.removeAttribute('data-aos');
        }
      });
    };

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      event.preventDefault();

      const navbarHeight = document.querySelector('nav')?.getBoundingClientRect().height || 0;
      const extraOffset = 12;
      const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - navbarHeight - extraOffset);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleAnchorClick);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-900">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProductsSection />
        <DevelopersSection />
        <MissionSection />
        <TeamSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
