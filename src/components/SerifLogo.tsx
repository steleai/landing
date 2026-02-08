interface SerifLogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'mark';
  animated?: boolean;
}

const SerifLogo = ({ size = 80, className = '', variant = 'full', animated = false }: SerifLogoProps) => {
  const src = variant === 'mark'
    ? '/stele-logo-icon-vertical-transparent.png'
    : '/stele-logo-horizontal-01-transparent.png';

  return (
    <img
      src={src}
      alt="Stele logo"
      className={`${animated ? 'animate-pulse' : ''} ${className}`.trim()}
      style={{ height: `${size}px`, width: 'auto' }}
      loading="eager"
      decoding="async"
    />
  );
};

export default SerifLogo;
