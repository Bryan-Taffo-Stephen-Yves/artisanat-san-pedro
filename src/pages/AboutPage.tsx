import AppShell from "@/components/AppShell";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem, scaleReveal } from "@/lib/motionVariants";
import { useArtisans } from "@/hooks/useArtisans";
import { useProducts } from "@/hooks/useProducts";

// Chiffres réels, calculés en direct depuis la base
const useImpactStats = () => {
  const { data: artisans = [] } = useArtisans();
  const { data: products = [] } = useProducts();
  const metiers = new Set(artisans.map((a) => a.metierCategory)).size;
  const show = (n: number) => (n > 0 ? String(n) : "—");
  return [
    { value: show(artisans.length), label: "Artisans PACTE" },
    { value: show(products.length), label: "Œuvres en ligne" },
    { value: show(metiers), label: "Corps de métiers" },
    { value: "2026", label: "Année de lancement" },
  ];
};

const MISSION_BORDERS = ["#C3622D", "#A55427", "#864521"];

const missions = [
  {
    title: "Générer des revenus durables",
    body: "Offrir aux artisans un espace de vente professionnel et une visibilité numérique pour accéder à des marchés jusqu'alors inaccessibles.",
  },
  {
    title: "Valoriser le patrimoine artisanal",
    body: "Donner une légitimité numérique aux savoir-faire de San Pedro et préserver ces traditions en les rendant accessibles au monde entier.",
  },
  {
    title: "Attirer les acheteurs internationaux",
    body: "Positionner San Pedro comme une destination de référence pour les créations africaines authentiques et de haute qualité.",
  },
];

const partnerLogos = [
  { src: "/partenaires/pacte.webp", alt: "PACTE", className: "h-16 md:h-20" },
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
    {/* Hero */}
    <ScrollReveal variants={scaleReveal} className="bg-[#2C1810] rounded-[2rem] p-8 mx-6 mt-6">
      <p className="text-[10px] uppercase tracking-widest text-primary mb-3">
        PROGRAMME PACTE · SAN PEDRO
      </p>
      <h1 className="font-serif text-4xl italic text-white leading-tight">
        Mains de San Pedro
      </h1>
      <p className="font-serif text-lg italic text-primary mt-1">
        La Plateforme Numérique de l'Artisanat
      </p>
      <div className="w-16 h-px bg-white/20 mt-6 mb-6" />
      <p className="text-sm font-light leading-relaxed text-white/70">
        La vitrine numérique officielle des artisans de la région de San Pedro,
        en Côte d'Ivoire. Portée par le programme PACTE, la plateforme connecte
        des créateurs d'exception aux marchés local, national et international :
        botterie, bijouterie, peinture, sculpture, accessoires, vannerie et
        sérigraphie.
      </p>
    </ScrollReveal>

    {/* Le client / Porté par */}
    <div className="px-6 py-10">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">LE CLIENT</p>
      <h2 className="font-headline text-2xl italic mb-6">Un programme national</h2>

      <div className="bg-white rounded-[1.5rem] p-6 border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <img
          src="/partenaires/prime.jpg"
          alt="PRIME — Programme National d'Appui aux Réformes Institutionnelles et à la Modernisation de l'État"
          className="h-16 w-auto object-contain mb-5"
        />
        <p className="text-sm font-light leading-relaxed text-neutral-700">
          Cette plateforme est une initiative du <strong className="font-medium">PRIME</strong> —
          Programme National d'Appui aux Réformes Institutionnelles et à la Modernisation
          de l'État — à travers le programme <strong className="font-medium">PACTE</strong>.
          Le projet bénéficie du soutien du <strong className="font-medium">Ministère de
          l'Europe et des Affaires étrangères</strong> de la République française.
        </p>
      </div>

      <p className="text-[10px] uppercase tracking-[0.18em] text-center text-on-surface-variant mt-10 mb-6">
        Un projet soutenu par
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {partnerLogos.map((p) => (
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

    {/* Mission */}
    <div className="px-6 py-8 bg-surface-container-low rounded-[2rem] mx-6 mb-6">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">NOTRE MISSION</p>
      <h2 className="font-headline text-2xl italic mb-6">Pourquoi ce projet existe</h2>
      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {missions.map((m, i) => (
          <motion.div
            key={m.title}
            variants={staggerItem}
            className="bg-surface-container-lowest rounded-[1.5rem] p-6 border-l-4"
            style={{ borderLeftColor: MISSION_BORDERS[i % MISSION_BORDERS.length] }}
          >
            <h3 className="font-headline text-lg">{m.title}</h3>
            <p className="text-sm font-light leading-relaxed text-on-surface-variant mt-2">
              {m.body}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* Impact Stats */}
    <div className="px-6 py-10">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">NOTRE IMPACT</p>
      <h2 className="font-headline text-2xl italic mb-6">Les chiffres parlent</h2>
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={staggerItem} className="bg-surface-container-lowest rounded-xl p-4 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <p className="font-headline text-2xl text-primary">{s.value}</p>
            <p className="text-[8px] uppercase tracking-widest text-on-surface-variant mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* CTA */}
    <div className="mx-6 mb-6 bg-[#2C1810] rounded-[2rem] p-8 text-center">
      <p className="text-[10px] uppercase tracking-widest text-primary mb-3">REJOIGNEZ LE MOUVEMENT</p>
      <h2 className="font-serif text-2xl italic text-white mb-3">
        Soutenez l'artisanat de San Pedro
      </h2>
      <p className="text-sm font-light leading-relaxed text-white/70 mb-6 max-w-md mx-auto">
        Chaque achat soutient directement un artisan et sa famille. Découvrez des
        créations uniques, faites avec passion et savoir-faire ancestral.
      </p>
      <a
        href="/boutique"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white px-8 py-3 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Explorer la boutique <ArrowRight className="w-4 h-4" />
      </a>
    </div>

    <div className="pb-16" />
  </AppShell>
  );
};

export default AboutPage;
