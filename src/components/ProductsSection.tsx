import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductsSection = () => {
  const { t } = useLanguage();

  return (
    <section id="products" className="section-padding bg-slate-50 dark:bg-slate-900/60">
      <div className="mx-auto max-w-6xl" data-aos="fade-up">
        <p id="products-label" className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-Stele-teal">
          {t('productsLabel')}
        </p>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h2 id="products-title" className="text-3xl font-bold leading-tight text-Stele-blue dark:text-white md:text-5xl">
              {t('productsTitle')}
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {t('productsDesc')}
            </p>
          </div>

          <div className="lg:col-span-4 lg:justify-self-end">
            <Button asChild size="lg" className="rounded-full bg-Stele-blue px-8 text-white hover:bg-Stele-blue/90">
              <a href="https://sprintact.eu" target="_blank" rel="noopener noreferrer">
                {t('productsCta')}
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 border-t border-Stele-blue/15 pt-8 text-center sm:grid-cols-3 dark:border-gray-700">
          <p className="text-xl font-semibold tracking-wide text-Stele-blue dark:text-white">
            {t('productsTaglinePrecision')}
          </p>
          <p className="text-xl font-semibold tracking-wide text-Stele-blue dark:text-white">
            {t('productsTaglineSpeed')}
          </p>
          <p className="text-xl font-semibold tracking-wide text-Stele-blue dark:text-white">
            {t('productsTaglineVersatility')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
