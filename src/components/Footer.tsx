import { Link } from "react-router-dom";

const partenaires: { src: string; alt: string; className: string }[] = [
  { src: "/partenaires/pacte.webp", alt: "PACTE", className: "h-14 md:h-[72px]" },
  {
    src: "/partenaires/prime.jpg",
    alt: "PRIME, programme national d'appui aux réformes institutionnelles et à la modernisation de l'État",
    className: "h-11 md:h-14",
  },
  {
    src: "/partenaires/ministere-europe-affaires-etrangeres.jpg",
    alt: "Ministère de l'Europe et des Affaires étrangères, République française",
    className: "h-14 md:h-[72px]",
  },
];

const colonnes: { titre: string; liens: { label: string; to: string }[] }[] = [
  {
    titre: "Boutique",
    liens: [
      { label: "Toutes les créations", to: "/boutique" },
      { label: "Les artisans", to: "/artisans" },
      { label: "Mon compte", to: "/mon-espace" },
    ],
  },
  {
    titre: "Le projet",
    liens: [
      { label: "Le programme PACTE", to: "/a-propos" },
      { label: "Découverte", to: "/decouverte" },
      { label: "Espace artisan", to: "/espace-artisan/login" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

const Footer = () => (
  <footer>
    {/* Bande partenaires */}
    <div className="bg-white border-t border-ink/[0.08]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10 md:py-11 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <p className="m-0 max-w-[440px] text-[15px] md:text-base leading-relaxed text-ink-soft">
          Une initiative du <strong className="text-ink font-semibold">PRIME</strong>, à travers le programme{" "}
          <strong className="text-ink font-semibold">PACTE</strong>, avec le soutien du ministère de l'Europe et des
          Affaires étrangères de la République française.
        </p>
        <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10">
          {partenaires.map((p) => (
            <img key={p.src} src={p.src} alt={p.alt} loading="lazy" className={`${p.className} w-auto object-contain`} />
          ))}
        </div>
      </div>
    </div>

    {/* Pied de page */}
    <div className="bg-sand pb-24 md:pb-0">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 pt-14 md:pt-16 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="flex flex-col gap-3.5">
          <img src="/logo/logo-horizontal-terracotta.svg" alt="Mains de San Pedro" className="h-[52px] w-auto self-start" />
          <p className="m-0 text-[15px] leading-relaxed text-ink-soft max-w-[22em]">
            La boutique en ligne des artisans de San Pedro, Côte d'Ivoire.
          </p>
        </div>
        {colonnes.map((c) => (
          <nav key={c.titre} aria-label={c.titre} className="flex flex-col gap-2.5 text-[15px]">
            <span className="font-semibold text-ink mb-1">{c.titre}</span>
            {c.liens.map((l) => (
              <Link key={l.to} to={l.to} className="text-ink-soft no-underline hover:text-primary hover:underline underline-offset-4">
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
        <div className="flex flex-col gap-2.5 text-[15px] text-ink-soft">
          <span className="font-semibold text-ink mb-1">Contact</span>
          <span>San Pedro, Côte d'Ivoire</span>
          <a href="mailto:info@artisanat-sanpedro.ci" className="text-ink-soft no-underline hover:text-primary hover:underline underline-offset-4">
            info@artisanat-sanpedro.ci
          </a>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-6 md:pb-8 border-t border-ink/10 text-[13px] text-ink-muted">
        © 2026 Mains de San Pedro, programme PACTE
      </div>
    </div>
  </footer>
);

export default Footer;
