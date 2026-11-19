/**
 * The effect kit (public/fx) is loaded at runtime, the way the approved preview loads it:
 * a dynamic import from the public folder, resolved against Vite's base.
 */
export interface FxController {
  destroy: () => void;
  pause: () => void;
  resume: () => void;
}

interface FxKit {
  mount: (
    el: HTMLElement,
    id: string,
    opts?: { seed?: number; params?: Record<string, number>; palette?: Record<string, string> }
  ) => Promise<FxController>;
}

let kit: Promise<FxKit> | null = null;

export const loadFx = (): Promise<FxKit> => {
  if (!kit) {
    const url = `${import.meta.env.BASE_URL}fx/fx.js`;
    kit = import(/* @vite-ignore */ url).then((m) => m.default as FxKit);
  }
  return kit;
};
