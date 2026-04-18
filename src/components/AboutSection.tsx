import { useLanguage } from '@/contexts/LanguageContext';

const AboutSection = () => {
  const { t } = useLanguage();

  const researchItems = [
    { title: t('researchPoint1Title'), description: t('researchPoint1Desc') },
    { title: t('researchPoint2Title'), description: t('researchPoint2Desc') },
    { title: t('researchPoint3Title'), description: t('researchPoint3Desc') }
  ];

  return (
    <section id="research" className="section-padding bg-white dark:bg-gray-900">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5" data-aos="fade-up">
          <p id="research-label" className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-Stele-teal">
            {t('researchLabel')}
          </p>
          <h2 id="research-title" className="text-3xl font-bold leading-tight text-Stele-blue dark:text-white md:text-5xl">
            {t('researchTitle')}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {t('researchDesc')}
          </p>
        </div>

        <div className="lg:col-span-7 space-y-8" data-aos="fade-up" data-aos-delay={100}>
          {researchItems.map((item, index) => (
            <article
              key={item.title}
              className="border-l border-Stele-blue/20 pl-6 transition-colors duration-300 hover:border-Stele-teal dark:border-gray-700 dark:hover:border-Stele-teal"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="text-xl font-semibold text-Stele-blue dark:text-white">{item.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
