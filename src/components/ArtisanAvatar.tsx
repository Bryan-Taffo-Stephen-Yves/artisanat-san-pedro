interface Props {
  src?: string;
  initials: string;
  accentColor: string;
  name: string;
  className?: string;
}

const ArtisanAvatar = ({ src, initials, accentColor, name, className = "" }: Props) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: accentColor }}
      aria-label={name}
    >
      <span
        style={{
          fontFamily: "Oswald, sans-serif",
          fontStyle: "normal",
          color: "#F6E7DD",
          fontWeight: 600,
          fontSize: "1.4em",
          letterSpacing: "-0.02em",
        }}
      >
        {initials}
      </span>
    </div>
  );
};

export default ArtisanAvatar;