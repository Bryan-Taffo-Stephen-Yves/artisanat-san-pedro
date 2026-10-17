import { Link } from "react-router-dom";

const navLinks: { label: string; to: string }[] = [
  { label: "Boutique", to: "/boutique" },
  { label: "Artisans", to: "/artisans" },
  { label: "Découverte", to: "/decouverte" },
  { label: "À propos", to: "/a-propos" },
  { label: "Contact", to: "/contact" },
];

const partenaires: { src: string; alt: string; className: string }[] = [
  {
    src: "/partenaires/pacte.webp",
    alt: "PACTE",
    className: "h-20 md:h-24",
  },
  {
    src: "/partenaires/prime.jpg",
    alt: "PRIME — Programme national d'appui aux réformes institutionnelles et à la modernisation de l'État",
    className: "h-14 md:h-16",
  },
  {
    src: "/partenaires/ministere-europe-affaires-etrangeres.jpg",
    alt: "Ministère de l'Europe et des Affaires étrangères — République française",
    className: "h-16 md:h-20",
  },
];

const Footer = () => {
  return (
    <footer>
      {/* Bande partenaires / bailleurs — fond clair */}
      <div className="bg-white border-y border-black/5 py-10">
        <div className="container mx-auto px-6">
          <p className="label-caps text-center text-neutral-500 mb-7 text-[11px] tracking-[0.18em] uppercase">
            Un projet soutenu par
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-7">
            {partenaires.map((p) => (
              <img
                key={p.src}
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className={`${p.className} w-auto object-contain`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer principal — fond sombre */}
      <div className="bg-surface-container pt-16 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <img
              src="/logo/logo-horizontal-blanc.svg"
              alt="Mains de San Pedro"
              className="h-12 w-auto mb-4"
            />
            <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-sm">
              Plateforme digitale du programme PACTE pour la promotion de
              l'artisanat à San Pedro, Côte d'Ivoire.
            </p>
            <div className="flex gap-2 mt-6 opacity-70">
              <span className="w-2 h-2 rounded-full" style={{ background: "#C3622D" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "#864521" }} />
              <span className="w-2 h-2 rounded-full" style={{ background: "#A55427" }} />
            </div>
          </div>

          <div>
            <span className="label-caps text-muted-foreground mb-5 block">
              Navigation
            </span>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm font-light text-inverse-surface hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="label-caps text-muted-foreground mb-5 block">
              Contact
            </span>
            <ul className="space-y-3 text-sm font-light text-inverse-surface">
              <li>San Pedro</li>
              <li>Côte d'Ivoire</li>
              <li>
                <a
                  href="mailto:info@artisanat-sanpedro.ci"
                  className="hover:text-primary transition-colors"
                >
                  info@artisanat-sanpedro.ci
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-muted-foreground text-xs font-light">
            © 2026 Mains de San Pedro — Programme PACTE.
          </p>
          <p className="label-caps text-muted-foreground text-[10px]">
            Côte d'Ivoire · 2026
          </p>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
