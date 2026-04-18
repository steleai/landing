import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative isolate min-h-[calc(100svh-72px)] overflow-hidden bg-[radial-gradient(circle_at_15%_20%,rgba(56,178,172,0.18),transparent_46%),radial-gradient(circle_at_80%_0%,rgba(26,54,93,0.2),transparent_42%),linear-gradient(160deg,#f8fbff_0%,#eef4ff_52%,#e8f7f5_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(56,178,172,0.22),transparent_46%),radial-gradient(circle_at_82%_0%,rgba(56,178,172,0.18),transparent_40%),linear-gradient(160deg,#050a14_0%,#0c1323_52%,#071a1a_100%)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,54,93,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,54,93,0.05)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] w-full max-w-6xl flex-col justify-center px-4 pb-16 pt-28 md:px-8 lg:px-12">
        <p className="mb-4 inline-flex w-fit items-center rounded-full border border-Stele-blue/20 bg-white/65 px-4 py-1 text-xs font-semibold tracking-[0.14em] text-Stele-blue uppercase backdrop-blur-sm dark:border-Stele-teal/35 dark:bg-gray-900/60 dark:text-Stele-teal animate-fade-in">
          {t('heroEyebrow')}
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
          <h1
            className="max-w-4xl text-balance text-4xl font-bold leading-tight text-Stele-blue dark:text-white sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in"
            style={{ animationDelay: '80ms' }}
          >
            {t('heroTitle')} <span className="text-Stele-teal">{t('heroTitleHighlight')}</span>
          </h1>

          <div className="hidden lg:flex justify-end animate-fade-in" style={{ animationDelay: '120ms' }}>
            <img
              src="/stele-logo-icon-vertical-transparent.png"
              alt="Stele logo icon"
              className="h-80 w-auto opacity-95"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-gray-700 dark:text-gray-300 md:text-xl animate-fade-in" style={{ animationDelay: '160ms' }}>
          {t('heroDesc')}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row animate-fade-in" style={{ animationDelay: '240ms' }}>
          <Button asChild size="lg" className="rounded-full bg-Stele-blue px-8 text-white hover:bg-Stele-blue/90">
            <a href="#products">{t('heroPrimaryCta')}</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-Stele-teal/60 bg-white/80 px-8 text-Stele-blue hover:bg-Stele-teal/10 dark:border-Stele-teal dark:bg-transparent dark:text-Stele-teal dark:hover:bg-Stele-teal/10"
          >
            <a href="https://sprintact.eu" target="_blank" rel="noopener noreferrer">
              {t('heroSecondaryCta')}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
