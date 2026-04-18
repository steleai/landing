import { useLanguage } from '@/contexts/LanguageContext';
import SerifLogoFooter from './SerifLogoFooter';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer id="footer" className="border-t border-border bg-background/95 py-10 backdrop-blur-sm dark:bg-gray-950/90">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <SerifLogoFooter size={52} />
            <span className="text-sm text-muted-foreground">{t('footerTagline')}</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://www.iubenda.com/privacy-policy/94489167"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footerPrivacy')}
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/94489167/cookie-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('footerCookie')}
            </a>
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-muted-foreground">
          &copy; {currentYear} Stele AI. {t('allRights')}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
