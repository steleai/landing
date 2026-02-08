
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import SerifLogo from './SerifLogo';
import { useLanguage } from '@/contexts/LanguageContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const navLinks = [
    { name: t('home'), href: '#hero' },
    { name: t('about'), href: '#about' },
    { name: t('mission'), href: '#mission' },
    { name: t('team'), href: '#team' },
    { name: t('contact'), href: '#contact' }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white dark:bg-gray-900 shadow-md py-2' : 'bg-transparent dark:bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="#hero" className="flex items-center">
            <SerifLogo size={90} variant="full" className="mr-2" />
          </a>
        </div>
        
        {/* Desktop Menu - Properly centered */}
        <div className="hidden md:flex items-center justify-center flex-1 px-6">
          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-Stele-blue dark:hover:text-white transition-colors duration-300 font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
        
        {/* Call to Action Button, Language Switcher, and Theme Toggle */}
        <div className="hidden md:flex items-center space-x-3">
          <Button asChild className="bg-Stele-teal hover:bg-Stele-teal/90">
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSe87e569hyTGlgu5EsJzcgSbebtvBSSo3EmoAQm12WIaojcuA/viewform?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('takeSurvey')}
            </a>
          </Button>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3 ml-auto">
          <LanguageSwitcher />
          <ThemeToggle />
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-gray-700 dark:text-gray-300 hover:text-Stele-blue dark:hover:text-white transition-colors duration-300 py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Button asChild className="w-full mt-2 bg-Stele-teal hover:bg-Stele-teal/90">
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSe87e569hyTGlgu5EsJzcgSbebtvBSSo3EmoAQm12WIaojcuA/viewform?usp=sharing" 
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('takeSurvey')}
              </a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
