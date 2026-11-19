import { useEffect, useState } from 'react';

/** Tracks a media query. Starts from the real value, so there is no flash of the wrong layout. */
export const useMedia = (query: string): boolean => {
  const get = () => typeof window !== 'undefined' && typeof matchMedia !== 'undefined' && matchMedia(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
};

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
