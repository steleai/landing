import { useLanguage } from '@/contexts/LanguageContext';
import RocketLogo from './RocketLogo';

const MissionSection = () => {
  const { t } = useLanguage();

  return (
    <section id="mission" className="section-padding bg-slate-50 dark:bg-gray-800/70">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-3xl" data-aos="fade-up">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-Stele-teal">{t('missionLabel')}</p>
          <h2 id="mission-title" className="text-3xl font-bold leading-tight text-Stele-blue dark:text-white md:text-5xl">
            {t('missionTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2" data-aos="fade-up" data-aos-delay={100}>
          <div>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{t('missionDesc1')}</p>
            <p className="mt-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">{t('missionDesc2')}</p>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-Stele-blue/20 bg-gradient-to-br from-Stele-blue to-Stele-teal p-10 shadow-xl dark:border-Stele-teal/40">
              <RocketLogo size={86} animated className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
