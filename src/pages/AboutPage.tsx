import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useArtisans } from "@/hooks/useArtisans";
import { useProducts } from "@/hooks/useProducts";

// Chiffres réels, calculés en direct depuis la base
const useImpactStats = () => {
  const { data: artisans = [] } = useArtisans();
  const { data: products = [] } = useProducts();
  const metiers = new Set(artisans.map((a) => a.metierCategory)).size;
  const show = (n: number) => (n > 0 ? n.toLocaleString("fr-FR") : "—");
  return [
    { value: show(artisans.length), label: "artisans accompagnés" },
    { value: show(products.length), label: "créations en ligne" },
    { value: show(metiers), label: "savoir-faire" },
    { value: "2026", label: "année de lancement" },
  ];
};

const missions = [
  {
    title: "Des revenus pour les artisans",
    body: "Un espace de vente professionnel et une visibilité en ligne, pour toucher des clients jusqu'ici hors de portée.",
  },
  {
    title: "Un patrimoine mis en valeur",
    body: "Les savoir-faire de San Pedro, présentés par celles et ceux qui les pratiquent, accessibles partout.",
  },
  {
    title: "Des acheteurs d'ici et d'ailleurs",
    body: "Faire de San Pedro une adresse de référence pour l'artisanat ivoirien authentique.",
  },
];

const partnerLogos = [
  { src: "/partenaires/pacte.webp", alt: "PACTE", className: "h-14 md:h-16" },
  {
    src: "/partenaires/prime.jpg",
    alt: "PRIME — Programme National d'Appui aux Réformes Institutionnelles et à la Modernisation de l'État",
    className: "h-12 md:h-14",
  },
  {
    src: "/partenaires/ministere-europe-affaires-etrangeres.jpg",
    alt: "Ministère de l'Europe et des Affaires étrangères — République française",
    className: "h-14 md:h-16",
  },
];

const AboutPage = () => {
  const stats = useImpactStats();
  return (
    <AppShell>
      <div className="max-w-[1080px] mx-auto px-4 md:px-8">
        {/* Introduction */}
        <section className="pt-10 md:pt-16 pb-10 md:pb-14 max-w-3xl">
          <h1 className="text-[34px] md:text-[56px] leading-[1.05]">Le projet Mains de San Pedro</h1>
          <p className="mt-5 text-lg md:text-xl leading-relaxed text-ink-soft">
            La boutique en ligne officielle des artisans de la région de San Pedro, en Côte d'Ivoire :
            botterie, bijouterie, peinture, sculpture, accessoires, vannerie et sérigraphie. Chaque
            achat rémunère directement l'artisan qui a créé la pièce.
          </p>
        </section>

        {/* Le client */}
        <section className="rounded-[24px] bg-white border border-ink/[0.08] p-6 md:p-10 grid md:grid-cols-[220px_1fr] gap-6 md:gap-10 items-center">
          <img
            src="/partenaires/prime.jpg"
            alt="PRIME — Programme National d'Appui aux Réformes Institutionnelles et à la Modernisation de l'État"
            className="h-16 md:h-20 w-auto object-contain"
          />
          <div>
            <h2 className="text-2xl md:text-[28px] leading-tight">Une initiative du PRIME</h2>
            <p className="mt-3 text-base md:text-[17px] leading-relaxed text-ink-soft">
              La plateforme est portée par le <strong className="font-semibold text-ink">PRIME</strong>, Programme National
              d'Appui aux Réformes Institutionnelles et à la Modernisation de l'État, à travers le programme{" "}
              <strong className="font-semibold text-ink">PACTE</strong>. Elle bénéficie du soutien du{" "}
              <strong className="font-semibold text-ink">ministère de l'Europe et des Affaires étrangères</strong> de la
              République française.
            </p>
          </div>
        </section>

        <div className="py-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {partnerLogos.map((p) => (
            <img key={p.src} src={p.src} alt={p.alt} loading="lazy" className={`${p.className} w-auto object-contain`} />
          ))}
        </div>

        {/* Mission */}
        <section className="py-10 md:py-14 border-t border-ink/[0.08]">
          <h2 className="text-[28px] md:text-4xl leading-tight">Pourquoi ce projet existe</h2>
          <ol className="mt-8 grid md:grid-cols-3 gap-6 md:gap-10">
            {missions.map((m, i) => (
              <li key={m.title}>
                <span className="text-sm font-semibold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-xl font-semibold">{m.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">{m.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Chiffres */}
        <section className="py-10 md:py-14 border-t border-ink/[0.08]">
          <h2 className="text-[28px] md:text-4xl leading-tight">En chiffres</h2>
          <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[18px] bg-white border border-ink/[0.08] p-5 flex flex-col-reverse">
                <dt className="mt-2 text-[15px] text-ink-soft">{s.label}</dt>
                <dd className="text-[34px] font-bold leading-none">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Appel à l'action */}
        <section className="mb-16 rounded-[24px] bg-ink text-white p-8 md:p-12 md:flex md:items-center md:justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-[28px] md:text-4xl leading-tight text-white">Soutenez l'artisanat de San Pedro</h2>
            <p className="mt-3 text-base md:text-[17px] leading-relaxed text-white/75">
              Des pièces uniques, faites main, vendues par celles et ceux qui les fabriquent.
            </p>
          </div>
          <Link
            to="/boutique"
            className="mt-6 md:mt-0 shrink-0 inline-flex items-center gap-2 h-[54px] px-7 rounded-full bg-primary hover:bg-[#8E4219] text-white text-base font-semibold transition-colors"
          >
            Voir la boutique <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </AppShell>
  );
};

export default AboutPage;
