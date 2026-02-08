
import { useLanguage } from "@/contexts/LanguageContext";
import RocketLogo from "./RocketLogo";

const MissionSection = () => {
  const { t } = useLanguage();
  
  return (
    <section id="mission" className="section-padding bg-slate-50 dark:bg-gray-800 pt-0">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="mission-title" className="text-3xl md:text-6xl font-bold text-Stele-blue dark:text-white mb-4 py-[30px]">{t('missionTitle')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <p className="text-2xl text-gray-700 dark:text-gray-300 mb-6">
              {t('missionDesc1')}
            </p>
            <p className="text-2xl text-gray-700 dark:text-gray-300">
              {t('missionDesc2')}
            </p>
          </div>
          
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative h-64 w-64 rounded-full overflow-hidden bg-gradient-to-br from-Stele-blue to-Stele-teal p-10 flex items-center justify-center">
              <RocketLogo size={80} animated={true} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;