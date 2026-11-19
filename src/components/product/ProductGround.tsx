import { useEffect, useRef } from 'react';
import { loadFx, type FxController } from '@/lib/fx';

/**
 * The ground of the Prodotto section: the hero's dot terrain carried on in light tones.
 * One viewport-sized layer that stays in place while the section scrolls past it (sticky inside a layer
 * as tall as the section), still (speed 0), and masked with soft contour-like curves so the dots live
 * in the empty areas (the bottom and the right) and fade out before the copy and the tab texts.
 */
const ProductGround = () => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let dead = false;
    let ctl: FxController | null = null;
    loadFx()
      .then((fx) => {
        if (dead || !el.current) return;
        return fx.mount(el.current, 'dot-terrain', {
          seed: 33,
          palette: { bg: '#F0E9DD', surface: '#FBF7F0', ink: '#17223B', muted: '#4D5568', accent: '#2456D6', accentInk: '#FFFFFF' },
          params: { speed: 0.006, opacity: 0.8, spacing: 13, dot: 3.6, crest: 0.5, shade: 1, haze: 0, calm: 0, fog: 0.15, horizon: 0.3 },
        }).then((c) => {
          if (dead) c.destroy();
          else ctl = c;
        });
      })
      .catch((e) => console.error(e));
    return () => {
      dead = true;
      ctl?.destroy();
    };
  }, []);

  return (
    <div className="pc-groundwrap" aria-hidden="true">
      <div className="pc-ground" ref={el} />
    </div>
  );
};

export default ProductGround;
