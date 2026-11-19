import { useLocation } from 'react-router-dom';
import SteleWordmark from './SteleWordmark';
import { useLanguage } from '@/contexts/LanguageContext';

const PRIVACY = 'https://www.iubenda.com/privacy-policy/94489167';
const COOKIE = 'https://www.iubenda.com/privacy-policy/94489167/cookie-policy';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const prefix = pathname === '/' ? '' : '/';

  const site = [
    [t('navProduct'), 'prodotto'],
    [t('navVision'), 'visione'],
    [t('navMission'), 'mission'],
    [t('navTeam'), 'team'],
  ];
  const external = (label: string, href: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
      <span className="sr-only"> ({t('newTab')})</span>
    </a>
  );

  return (
    <footer id="footer" className="foot">
      <div className="c">
        <div className="foot-grid">
          <div className="foot-co">
            <SteleWordmark tone="light" height={48} className="foot-logo" />
            <p className="foot-name">Stele S.r.l.</p>
            <address>
              Via per Curnasco, 52<br />
              24127 Bergamo (BG), {t('footerAddress')}
            </address>
            <p>
              {t('footerVat')} <span className="nowrap">04953820166</span>
            </p>
            <p>
              <a href="mailto:info@stele.it.com">info@stele.it.com</a>
            </p>
          </div>

          <nav className="foot-cols" aria-label={t('footerLinks')}>
            <div>
              <h2 className="foot-t">{t('footerSite')}</h2>
              <ul>
                {site.map(([name, id]) => (
                  <li key={id}>
                    <a href={`${prefix}#${id}`}>{name}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="foot-t">{t('footerCompany')}</h2>
              <ul>
                <li>
                  <a href={`${prefix}#contatti`}>{t('navContact')}</a>
                </li>
                <li>
                  <a href="/lavora-con-noi/">{t('navCareers')}</a>
                </li>
                <li>
                  <a href="/legal/">{t('footerLegalNotes')}</a>
                </li>
              </ul>
            </div>
            <div className="foot-c3">
              <div>
              <h2 className="foot-t">{t('footerInfo')}</h2>
              <ul>
                <li>{external(t('footerPrivacy'), PRIVACY)}</li>
                <li>{external(t('footerCookie'), COOKIE)}</li>
              </ul>
              </div>
              <div>
              <h2 className="foot-t">{t('footerFollow')}</h2>
              <ul>
                <li>{external('LinkedIn', 'https://www.linkedin.com/company/steleai/')}</li>
                <li>{external('GitHub', 'https://www.github.com/Steleai')}</li>
              </ul>
              </div>
            </div>
          </nav>
        </div>

        <p className="foot-legal">&copy; {currentYear} Stele S.r.l.</p>
      </div>
    </footer>
  );
};

export default Footer;
