/**
 * The Stele symbol, as drawn in the approved preview: a vector stele built from four blocks
 * (viewBox 675 x 1301). Never altered. `p` prefixes every id so that two copies can share a page.
 */
export const STELE_VIEWBOX = '0 0 675 1301';

/** The six faces of the symbol. With a colour they are flat (one-colour mark); without, they take their real blues. */
export const SteleShape = ({ p = '', color }: { p?: string; color?: string }) => {
  const f = (own: string) => color ?? own;
  return (
    <>
      <polygon points="335,120 263,240 335,208" fill={f('#3159b5')} stroke={f('#3159b5')} />
      <polygon points="335,120 407,240 335,208" fill={f('#5689d8')} stroke={f('#5689d8')} />
      <polygon points="263,240 335,208 335,1066 183,1097" fill={f(`url(#${p}gSL)`)} stroke={f(`url(#${p}gSL)`)} />
      <polygon points="334.4,208 407,240 487,1096 334.4,1066" fill={f(`url(#${p}gSR)`)} stroke={f(`url(#${p}gSR)`)} />
      <polygon points="148,1122 335,1084 335,1166 148,1192" fill={f(`url(#${p}gPL)`)} stroke={f(`url(#${p}gPL)`)} />
      <polygon points="334.4,1084 522,1122 522,1192 334.4,1166" fill={f('#5790e1')} stroke={f('#5790e1')} />
    </>
  );
};

/** The gradients, the shape group and the clip paths. */
export const SteleDefs = ({ p = '' }: { p?: string }) => (
  <defs>
    <linearGradient id={`${p}gSL`} gradientUnits="userSpaceOnUse" x1="0" y1="208" x2="0" y2="1097">
      <stop offset="0" stopColor="#214192" />
      <stop offset=".5" stopColor="#182d73" />
      <stop offset="1" stopColor="#122261" />
    </linearGradient>
    <linearGradient id={`${p}gSR`} gradientUnits="userSpaceOnUse" x1="0" y1="208" x2="0" y2="1097">
      <stop offset="0" stopColor="#3462bc" />
      <stop offset=".5" stopColor="#4a7dd0" />
      <stop offset="1" stopColor="#578ee0" />
    </linearGradient>
    <linearGradient id={`${p}gPL`} gradientUnits="userSpaceOnUse" x1="0" y1="1084" x2="0" y2="1192">
      <stop offset="0" stopColor="#172a70" />
      <stop offset="1" stopColor="#141f66" />
    </linearGradient>
    <linearGradient id={`${p}gHi`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="260">
      <stop offset="0" stopColor="#fff" stopOpacity="0" />
      <stop offset=".5" stopColor="#fff" stopOpacity=".85" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    <filter id={`${p}fHi`} x="-200%" y="-5%" width="500%" height="110%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
    <g id={`${p}sh`} strokeWidth="1.4" strokeLinejoin="round">
      <SteleShape p={p} />
    </g>

    <clipPath id={`${p}cs`}>
      <polygon points="335,120 263,240 183,1097 335,1066 487,1096 407,240" />
      <polygon points="148,1122 335,1084 522,1122 522,1192 335,1166 148,1192" />
    </clipPath>
    <clipPath id={`${p}c1`}>
      <polygon points="0,942.8 335,883.1 675,942.8 675,1301 0,1301" />
    </clipPath>
    <clipPath id={`${p}c2`}>
      <polygon points="0,708.3 335,648.6 675,708.3 675,944.0 335,884.3 0,944.0" />
    </clipPath>
    <clipPath id={`${p}c3`}>
      <polygon points="0,521.4 335,461.7 675,521.4 675,709.5 335,649.8 0,709.5" />
    </clipPath>
    <clipPath id={`${p}c4`}>
      <polygon points="0,0 675,0 675,522.6 335,462.9 0,522.6" />
    </clipPath>
  </defs>
);

/** The four blocks as separate groups (used while the stele lands in the hero), each cut with its clip path. */
export const SteleBlocks = ({ p = '' }: { p?: string }) => (
  <>
    {[1, 2, 3, 4].map((n, i) => (
      <g className="bl" data-i={i} key={n}>
        <g clipPath={`url(#${p}c${n})`}>
          <use href={`#${p}sh`} />
        </g>
      </g>
    ))}
  </>
);
