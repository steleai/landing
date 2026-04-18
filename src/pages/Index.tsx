
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
    // Add scroll animations
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

    // Fix navbar scroll behavior
    const fixNavbarScrolling = () => {
      const navLinks = document.querySelectorAll('a[href^="#"]');
      
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          if (!targetId) return;
          
          // Get the target element
          const targetElement = document.querySelector(targetId);
          if (!targetElement) return;
          
          // Calculate position with offset for fixed navbar
          const navbarHeight = document.querySelector('nav')?.getBoundingClientRect().height || 0;
          const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight;
          
          // Smooth scroll to element
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        });
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on load
    fixNavbarScrolling(); // Fix navbar scrolling
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
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
