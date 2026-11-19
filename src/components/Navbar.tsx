import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import SteleWordmark from './SteleWordmark';
import { useLanguage } from '@/contexts/LanguageContext';

const HEADER_H = 72;
const SPY = ['prodotto', 'visione', 'mission', 'team', 'contatti'];

/**
 * Header. Over the hero: night blue with light links and the white wordmark. After the hero: a Sabbia bar.
 * On the other pages there is no hero, so it is always the Sabbia bar.
 */
const Navbar = () => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const home = pathname === '/';
  const [over, setOver] = useState(home);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    // any page hero carries data-hero; the home hero is found by its id
    const hero = document.querySelector<HTMLElement>('[data-hero]') ?? (home ? document.getElementById('hero') : null);
    if (!hero) {
      setOver(false);
      return;
    }
    const check = () => setOver(hero.getBoundingClientRect().bottom > HEADER_H);
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [home, pathname]);

  // scrollspy: the section under a line a little below the header; none while the hero is in view
  useEffect(() => {
    if (!home) {
      setCurrent(null);
      return;
    }
    let raf = 0;
    const read = () => {
      raf = 0;
      const line = HEADER_H + window.innerHeight * 0.3;
      let found: string | null = null;
      for (const id of SPY) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) found = id;
      }
      setCurrent(found);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [home]);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  const prefix = home ? '' : '/';
  const links = [
    { name: t('navProduct'), href: `${prefix}#prodotto`, id: 'prodotto' },
    { name: t('navVision'), href: `${prefix}#visione`, id: 'visione' },
    { name: t('navMission'), href: `${prefix}#mission`, id: 'mission' },
    { name: t('navTeam'), href: `${prefix}#team`, id: 'team' },
    { name: t('navContact'), href: `${prefix}#contatti`, id: 'contatti' },
    { name: t('navCareers'), href: '/lavora-con-noi/', badge: t('navBadge') },
  ];

  return (
    <>
      <a className="skip" href="#main">
        {t('skipLink')}
      </a>
      <header className={`top${over ? ' over' : ''}${open ? ' menu-open' : ''}`} id="top">
        <div className="c">
          <a className="brand" href={home ? '#hero' : '/'} aria-label={t('navHomeLabel')}>
            <SteleWordmark tone={over ? 'light' : 'brand'} height={30} />
          </a>
          <nav className="nav" aria-label={t('navMain')}>
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} aria-current={l.id && l.id === current ? 'true' : undefined}>
                    <span className="lt" data-t={l.name}>{l.name}</span>
                    {l.badge && <span className="badge">{l.badge}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="top-actions">
            <a className="btn btn-primary top-cta" href={`${prefix}#prodotto`}>
              {t('ctaSprintAct')}
            </a>
            <LanguageSwitcher />
            <button
              ref={button}
              type="button"
              className="menu-btn"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? t('menuClose') : t('menuOpen')}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
        <nav id={menuId} className="menu" aria-label={t('navMain')} hidden={!open}>
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} aria-current={l.id && l.id === current ? 'true' : undefined} onClick={() => setOpen(false)}>
                  <span className="lt" data-t={l.name}>{l.name}</span>
                  {l.badge && <span className="badge">{l.badge}</span>}
                </a>
              </li>
            ))}
          </ul>
          <a className="btn btn-primary" href={`${prefix}#prodotto`} onClick={() => setOpen(false)}>
            {t('ctaSprintAct')}
          </a>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
