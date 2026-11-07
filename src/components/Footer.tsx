import { useLanguage } from '@/contexts/LanguageContext';
import SerifLogoFooter from './SerifLogoFooter';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();

  return (
    <footer id="footer" className="border-t border-border bg-background/95 py-10 backdrop-blur-sm dark:bg-gray-950/90">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-8">
          <div className="min-w-0 space-y-2 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">Stele S.r.l.</p>
            <address className="not-italic">
              Via per Curnasco, 52<br />
              24127 Bergamo (BG), {language === 'it' ? 'Italia' : 'Italy'}
            </address>
            <p>{language === 'it' ? 'P. IVA' : 'VAT no.'} <span className="whitespace-nowrap">04953820166</span></p>
          </div>

          <div className="order-first justify-self-center md:order-none">
            <SerifLogoFooter size={52} className="max-w-full" />
          </div>

          <nav aria-label={language === 'it' ? 'Collegamenti nel footer' : 'Footer links'} className="flex flex-wrap items-start gap-x-6 gap-y-1 md:justify-end">
            <a className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground" href="/lavora-con-noi/">{language === 'it' ? 'Lavora con noi' : 'Careers'}</a>
            <a
              href="https://www.iubenda.com/privacy-policy/94489167"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footerPrivacy')}
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/94489167/cookie-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footerCookie')}
            </a>
          </nav>
        </div>

        <p className="mt-7 border-t border-border pt-6 text-xs leading-6 text-muted-foreground md:text-center">
          &copy; {currentYear} Stele S.r.l. {t('allRights')}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
