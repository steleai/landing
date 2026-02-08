interface SerifLogoFooterProps {
  size?: number;
  className?: string;
}

const SerifLogoFooter = ({ size = 80, className = '' }: SerifLogoFooterProps) => {
  return (
    <img
      src="/stele-logo-horizontal-01-transparent.png"
      alt="Stele logo"
      className={className}
      style={{ height: `${size}px`, width: 'auto' }}
      loading="lazy"
      decoding="async"
    />
  );
};

export default SerifLogoFooter;
