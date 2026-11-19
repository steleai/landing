import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMedia, useReducedMotion } from '@/hooks/use-media';
import ProductPanel from './product/ProductPanel';
import ProductGround from './product/ProductGround';

const HEADER_H = 72;
const STEPS = 4;

/**
 * Prodotto: the page's main moment. Four capabilities act as tabs; one product panel shows a real view of each.
 * From 1024px up (and without reduced motion) the block pins for four steps and scroll advances the tab.
 * Below 1024px, or with reduced motion: plain tabs, instant change, no pinning, no auto-advance.
 */
const ProductsSection = () => {
  const { t } = useLanguage();
  const reduced = useReducedMotion();
  const wide = useMedia('(min-width: 1024px)');
  const pinned = wide && !reduced;

  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [stepPx, setStepPx] = useState(360);

  const caps = [1, 2, 3, 4].map((n) => ({
    title: t(`productCap${n}Title` as 'productCap1Title'),
    desc: t(`productCap${n}Desc` as 'productCap1Desc'),
    panel: t(`productPanel${n}` as 'productPanel1'),
  }));

  // the length of one scroll step follows the viewport height
  useEffect(() => {
    const on = () => setStepPx(Math.round(Math.max(260, Math.min(420, window.innerHeight * 0.42))));
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  // the details of a view animate once the panel has been on screen
  useEffect(() => {
    const el = stage.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  // scroll advances the selected capability while the block is pinned
  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const scrolled = HEADER_H - el.getBoundingClientRect().top;
      const i = Math.min(STEPS - 1, Math.max(0, Math.floor(scrolled / stepPx)));
      setIndex(i);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pinned, stepPx]);

  const select = useCallback(
    (i: number, focus = false) => {
      setIndex(i);
      if (pinned && track.current) {
        // keep the scroll position in step with the tab, so scrolling and clicking never fight
        const scrolled = HEADER_H - track.current.getBoundingClientRect().top;
        const target = (i + 0.5) * stepPx;
        window.scrollTo({ top: window.scrollY + (target - scrolled), behavior: 'instant' as ScrollBehavior });
      }
      if (focus) tabs.current[i]?.focus({ preventScroll: true });
    },
    [pinned, stepPx]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: STEPS - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select((keys[e.key] + STEPS) % STEPS, true);
  };

  return (
    <section className="sec" id="prodotto" aria-labelledby="h-prodotto">
      <div className="c">
        <p className="label">{t('productLabel')}</p>
        <h2 id="h-prodotto">{t('productTitle')}</h2>
        <p className="sec-text">{t('productDesc')}</p>
      </div>

      <ProductGround />
      <div className="pc-zone">
      <div
        ref={track}
        className={`pc-track${pinned ? ' is-pinned' : ''}`}
        style={pinned ? ({ '--pc-scroll': `${STEPS * stepPx}px` } as CSSProperties) : undefined}
      >
        <div className="pc-stage">
          <div className="c">
            <div className="pc-grid">
              <div
                className="pc-tabs"
                role="tablist"
                aria-label={t('productTabs')}
                aria-orientation="vertical"
                onKeyDown={onKeyDown}
              >
                {caps.map((c, i) => (
                  <button
                    key={i}
                    ref={(el) => (tabs.current[i] = el)}
                    type="button"
                    role="tab"
                    id={`pc-tab-${i}`}
                    aria-selected={i === index}
                    aria-controls="pc-panel"
                    tabIndex={i === index ? 0 : -1}
                    className="pc-tab"
                    onClick={() => select(i)}
                  >
                    <span className="pc-num" aria-hidden="true">{`0${i + 1}`}</span>
                    <span className="pc-tt">
                      <span className="pc-title">{c.title}</span>
                      <span className="pc-desc">{c.desc}</span>
                    </span>
                    <ChevronRight className="pc-chev" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div ref={stage} className="pc-right">
                <ProductPanel
                  index={index}
                  motionOn={pinned && seen}
                  label={caps[index].panel}
                  tabId={`pc-tab-${index}`}
                  panelId="pc-panel"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="c pc-cta">
        <a className="btn btn-primary" href="https://sprintact.eu" target="_blank" rel="noopener noreferrer">
          {t('productCta')}
          <ExternalLink aria-hidden="true" />
          <span className="sr-only">({t('newTab')})</span>
        </a>
      </div>
      </div>
    </section>
  );
};

export default ProductsSection;
