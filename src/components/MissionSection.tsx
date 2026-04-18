import { useLanguage } from '@/contexts/LanguageContext';

const MissionSection = () => {
  const { t } = useLanguage();

  return (
    <section id="mission" className="section-padding bg-slate-50 dark:bg-gray-800/70">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-3xl" data-aos="fade-up">
          <p id="mission-label" className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-Stele-teal">{t('missionLabel')}</p>
          <h2 id="mission-title" className="text-3xl font-bold leading-tight text-Stele-blue dark:text-white md:text-5xl">
            {t('missionTitle')}
          </h2>
        </div>

        <div className="max-w-4xl" data-aos="fade-up" data-aos-delay={100}>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{t('missionDesc1')}</p>
          <p className="mt-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">{t('missionDesc2')}</p>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
