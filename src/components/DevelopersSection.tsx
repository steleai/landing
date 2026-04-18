import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const DevelopersSection = () => {
  const { t } = useLanguage();

  const developerPoints = [t('developersPoint1'), t('developersPoint2'), t('developersPoint3')];

  return (
    <section id="developers" className="section-padding bg-white dark:bg-gray-900">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5" data-aos="fade-up">
          <p id="developers-label" className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-Stele-teal">
            {t('developersLabel')}
          </p>
          <h2 id="developers-title" className="text-3xl font-bold leading-tight text-Stele-blue dark:text-white md:text-5xl">
            {t('developersTitle')}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {t('developersDesc')}
          </p>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="mt-8 rounded-full border-Stele-blue/30 px-8 text-Stele-blue hover:bg-Stele-blue/10 dark:border-Stele-teal/50 dark:text-Stele-teal dark:hover:bg-Stele-teal/10"
          >
            <a href="https://github.com/Steleai" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-5 w-5" />
              {t('developersCta')}
            </a>
          </Button>
        </div>

        <div className="lg:col-span-7 space-y-5" data-aos="fade-up" data-aos-delay={100}>
          {developerPoints.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-Stele-blue/12 bg-slate-50/70 px-6 py-5 text-base leading-relaxed text-gray-700 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
            >
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DevelopersSection;
