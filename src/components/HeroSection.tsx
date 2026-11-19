import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { loadFx, type FxController } from '@/lib/fx';
import { SteleBlocks, SteleDefs, STELE_VIEWBOX } from './SteleSymbol';

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Y of each label as a share of the stele height (from the approved preview). */
const LABEL_Y = ['77.018%', '60.550%', '44.081%', '27.613%'];

const HeroSection = () => {
  const { t } = useLanguage();
  // reduced motion: the final state at once, no intro, a still shader frame
  const [anim] = useState(() => !reducedMotion());
  const [done, setDone] = useState(!anim);

  const root = useRef<HTMLElement>(null);
  const fx1 = useRef<HTMLDivElement>(null);
  const fx2 = useRef<HTMLDivElement>(null);
  const stele = useRef<SVGSVGElement>(null);
  const refl = useRef<SVGSVGElement>(null);

  const phases = [
    t('visionStep1Title'),
    t('visionStep2Title'),
    t('visionStep3Title'),
    t('visionStep4Title'),
  ];

  /* intro: blocks land one by one with their labels, then the ridge highlight, then still (about 3.5 s) */
  useEffect(() => {
    if (!anim || !root.current || !stele.current || !refl.current) return;
    const r = root.current;
    const T0 = 200, STEP = 680, DUR = 600, HI = 2850;
    const running: Animation[] = [];
    const A = (el: Element | null, kf: Keyframe[], o: KeyframeAnimationOptions) => {
      if (!el) return;
      const a = el.animate(kf, { ...o, fill: 'both' });
      running.push(a);
    };
    const fade = (el: Element | null, delay: number, dur?: number) =>
      A(el, [{ opacity: 0 }, { opacity: 1 }], { duration: dur || 380, delay, easing: 'ease-out' });
    const blocks = Array.from(stele.current.querySelectorAll('.bl'));
    const lbs = Array.from(r.querySelectorAll('.lb'));
    const ridge = stele.current.querySelector('.ridge');
    const mob = matchMedia('(max-width:600px)').matches;
    blocks.forEach((g, i) => {
      const d = T0 + i * STEP, ld = d + DUR * 0.7;
      A(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 140, delay: d, easing: 'linear' });
      A(
        g,
        [
          { transform: 'translateY(-150px)', easing: 'cubic-bezier(.55,0,.9,.5)', offset: 0 },
          { transform: 'translateY(4px)', easing: 'cubic-bezier(.2,.7,.3,1)', offset: 0.74 },
          { transform: 'translateY(-1.2px)', easing: 'ease-in-out', offset: 0.9 },
          { transform: 'translateY(0)', offset: 1 },
        ],
        { duration: DUR, delay: d }
      );
      A(
        lbs[i],
        [
          { opacity: 0, transform: `translateY(-50%) translateX(${mob ? 10 : -10}px)` },
          { opacity: 1, transform: 'translateY(-50%) translateX(0)' },
        ],
        { duration: 380, delay: ld, easing: 'cubic-bezier(.2,.7,.3,1)' }
      );
      r.querySelectorAll(`.ld[data-i="${i}"]`).forEach((el) => fade(el, ld + 80, 360));
      refl.current!.querySelectorAll(`.bl[data-i="${i}"]`).forEach((el) => fade(el, d + DUR * 0.6, 420));
      if (i === 0) {
        fade(r.querySelector('#spr'), ld + 260, 420);
        r.querySelectorAll('.ldS').forEach((el) => fade(el, ld + 260, 360));
      }
    });
    /* a highlight runs once along the ridge */
    A(
      ridge,
      [
        { opacity: 0, transform: 'translateY(1100px)' },
        { opacity: 1, transform: 'translateY(520px)', offset: 0.3 },
        { opacity: 1, transform: 'translateY(60px)', offset: 0.75 },
        { opacity: 0, transform: 'translateY(-170px)' },
      ],
      { duration: 700, delay: HI, easing: 'cubic-bezier(.45,0,.35,1)' }
    );
    /* once the last block has landed, swap the four blocks for the one whole group */
    const timer = window.setTimeout(() => setDone(true), T0 + 3 * STEP + DUR + 40);
    return () => {
      window.clearTimeout(timer);
      running.forEach((a) => a.cancel());
    };
  }, [anim]);

  /* the two shader grounds: god-rays over the whole hero, dot-terrain on the left (masked) */
  useEffect(() => {
    let dead = false;
    const made: FxController[] = [];
    const keep = (p: Promise<FxController>) =>
      p.then((c) => {
        if (dead) c.destroy();
        else made.push(c);
      });
    loadFx()
      .then((fx) => {
        if (dead || !fx1.current || !fx2.current) return;
        keep(
          fx.mount(fx1.current, 'god-rays', {
            seed: 21,
            params: {
              originX: innerWidth < 900 ? 0.3 : 0.78,
              originY: -0.25,
              tilt: 4,
              spread: 46,
              intensity: 0.8,
              speed: 0.028,
              calmX: 0.25,
              calmY: 0.5,
            },
          })
        );
        keep(fx.mount(fx2.current, 'dot-terrain', { seed: 21, params: { speed: 0.017, calmX: 0.25, calmY: 0.4 } }));
      })
      .catch((e) => console.error(e));
    return () => {
      dead = true;
      made.forEach((c) => c.destroy());
    };
  }, []);

  const cls = `hero${anim ? ' anim' : ''}`;
  return (
    <section ref={root} className={cls} id="hero" aria-labelledby="h1">
      <div className="hero-fx" id="heroFx" ref={fx1} aria-hidden="true" />
      <div className="hero-fx hero-fx2" id="heroFx2" ref={fx2} aria-hidden="true" />
      <div className="c">
        <div className="hero-grid">
          <div className="hero-text">
            <h1 id="h1">{t('heroTitle')}</h1>
            <p className="lede">{t('heroDesc')}</p>
            <div className="cta">
              <a className="btn btn-primary" href="#prodotto">
                {t('ctaSprintAct')}
              </a>
              <a className="btn btn-ghost" href="#visione">
                {t('heroCtaVision')}
              </a>
            </div>
          </div>
          <div className="stagewrap">
            <div className="stage" id="stage">
              <span className="sr-only">{t('heroSteleSr')}</span>
              <svg
                className={`stele refl${done ? ' done' : ''}`}
                ref={refl}
                id="refl"
                viewBox={STELE_VIEWBOX}
                aria-hidden="true"
                focusable="false"
              >
                <g className="whole">
                  <use href="#sh" />
                </g>
                <SteleBlocks />
              </svg>
              <svg
                className={`stele${done ? ' done' : ''}`}
                ref={stele}
                id="stele"
                viewBox={STELE_VIEWBOX}
                aria-hidden="true"
                focusable="false"
              >
                <SteleDefs />
                <g className="whole">
                  <use href="#sh" />
                </g>
                <SteleBlocks />
                <g clipPath="url(#cs)">
                  <rect className="ridge" x="331" y="0" width="8" height="260" fill="url(#gHi)" filter="url(#fHi)" />
                </g>
              </svg>
              <svg className="lead" viewBox={STELE_VIEWBOX} aria-hidden="true" focusable="false">
                <g className="ll">
                  <path className="ld" data-i="0" d="M40 1002H191.9" />
                  <circle className="ld" data-i="0" cx="191.9" cy="1002" r="5" />
                  <path className="ld" data-i="1" d="M40 787.8H211.9" />
                  <circle className="ld" data-i="1" cx="211.9" cy="787.8" r="5" />
                  <path className="ld" data-i="2" d="M40 573.5H231.9" />
                  <circle className="ld" data-i="2" cx="231.9" cy="573.5" r="5" />
                  <path className="ld" data-i="3" d="M40 359.2H251.9" />
                  <circle className="ld" data-i="3" cx="251.9" cy="359.2" r="5" />
                </g>
                <g className="lr">
                  <path className="ld" data-i="0" d="M630 1002H478.1" />
                  <circle className="ld" data-i="0" cx="478.1" cy="1002" r="5" />
                  <path className="ld" data-i="1" d="M630 787.8H458.1" />
                  <circle className="ld" data-i="1" cx="458.1" cy="787.8" r="5" />
                  <path className="ld" data-i="2" d="M630 573.5H438.1" />
                  <circle className="ld" data-i="2" cx="438.1" cy="573.5" r="5" />
                  <path className="ld" data-i="3" d="M630 359.2H418.1" />
                  <circle className="ld" data-i="3" cx="418.1" cy="359.2" r="5" />
                </g>
                <g className="ls">
                  <path className="ldS" d="M478.2 1002H575" />
                  <circle className="ldS" cx="478.2" cy="1002" r="5" />
                </g>
              </svg>
              <ol className="labels" aria-label={t('heroPhases')}>
                {phases.map((name, i) => (
                  <li
                    key={i}
                    className={`lb${i === 0 ? ' on' : ''}`}
                    data-i={i}
                    style={{ '--y': LABEL_Y[i] } as CSSProperties}
                  >
                    <span className="tx">
                      <span className="n">{`0${i + 1}`}</span>
                      <span className="nm">{name}</span>
                    </span>
                    <span className="mk" aria-hidden="true" />
                  </li>
                ))}
              </ol>
              <a className="spr" id="spr" href="#prodotto" aria-label={t('heroProductLink')}>
                <span className="cap">{t('heroProductCap')}</span>
                <span className="nmS">
                  SprintAct
                  <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                    <path
                      d="M2 7h9M7.5 3.2L11.3 7 7.5 10.8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
