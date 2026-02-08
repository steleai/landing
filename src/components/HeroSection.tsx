
import { Button } from '@/components/ui/button';
import SerifLogo from './SerifLogo';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section id="hero" className="relative pt-28 pb-20 md:py-36 overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-Stele-teal/10 text-Stele-teal dark:bg-Stele-teal/20 dark:text-Stele-teal animate-fade-in">
              <span className="mr-1">✨</span> {t('transformingData')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-Stele-blue dark:text-white leading-tight animate-fade-in">
              {t('heroTitle')} <span className="text-Stele-teal">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 md:text-xl animate-fade-in">
              {t('heroDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in">
              <Button asChild size="lg" className="bg-Stele-blue hover:bg-Stele-blue/90 text-white">
                <a href="#about">{t('learnMore')}</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-Stele-teal text-Stele-teal hover:bg-Stele-teal/10 dark:border-Stele-teal dark:text-Stele-teal dark:hover:bg-Stele-teal/20 dark:bg-gray-700/50">
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSe87e569hyTGlgu5EsJzcgSbebtvBSSo3EmoAQm12WIaojcuA/viewform?usp=sharing" target="_blank" rel="noopener noreferrer">
                  {t('takeOurSurvey')}
                </a>
              </Button>
            </div>
          </div>
          <div className="hidden md:flex justify-center relative animate-float">
            <div className="w-72 h-72 lg:w-96 lg:h-96 relative">
              <div className="absolute inset-0 rounded-full bg-Stele-blue/5 dark:bg-Stele-blue/10 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full bg-Stele-blue/10 dark:bg-Stele-blue/20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <SerifLogo
                  size={320}
                  variant="mark"
                  className="drop-shadow-xl"
                />
              </div>
              
              {/* Floating elements with Stele's Goals */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg animate-float">
                <div className="text-sm font-bold dark:text-white">{t('aiChatbot')}</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg animate-float" style={{
                animationDelay: '1s'
              }}>
                <div className="text-sm font-bold dark:text-white">{t('customReports')}</div>
              </div>
              <div className="absolute top-1/2 -right-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg animate-float" style={{
                animationDelay: '2s'
              }}>
                <div className="text-sm font-bold dark:text-white">{t('factChecking')}</div>
              </div>
              <div className="absolute bottom-1/3 -left-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg animate-float" style={{
                animationDelay: '1.5s'
              }}>
                <div className="text-sm font-bold dark:text-white">{t('policySim')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-40 left-10 w-20 h-20 bg-Stele-teal/10 dark:bg-Stele-teal/20 rounded-full -z-10"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-Stele-orange/10 dark:bg-Stele-orange/20 rounded-full -z-10"></div>
    </section>
  );
};

export default HeroSection;
