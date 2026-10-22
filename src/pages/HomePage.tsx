import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Smartphone } from "lucide-react";
import AppShell from "@/components/AppShell";
import BoutiqueProductCard from "@/components/BoutiqueProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useArtisans } from "@/hooks/useArtisans";
import { useFavorites } from "@/hooks/useFavorites";

// Bannière servie depuis /public : préchargée dès le HTML (voir index.html)
const heroDesktop = "/home/hero-desktop.webp";
const heroMobile = "/home/hero-mobile.webp";
import imgBotterie from "@/assets/metiers/botterie.webp";
import imgBijouterie from "@/assets/metiers/bijouterie.webp";
import imgPeinture from "@/assets/metiers/peinture.webp";
import imgSculpture from "@/assets/metiers/sculpture.webp";
import imgAccessoires from "@/assets/metiers/accessoires.webp";
import imgTressage from "@/assets/metiers/tressage.webp";
import imgSerigraphie from "@/assets/metiers/serigraphie.webp";

// Les 7 corps de métiers des artisans PACTE (Vannerie regroupe Tressage et Tissage)
const METIERS = [
  { name: "Botterie", cats: ["Botterie"], img: imgBotterie, filtre: "Botterie" },
  { name: "Bijouterie", cats: ["Bijouterie"], img: imgBijouterie, filtre: "Bijouterie" },
  { name: "Accessoires", cats: ["Accessoires"], img: imgAccessoires, filtre: "Accessoires" },
  { name: "Sculpture", cats: ["Sculpture"], img: imgSculpture, filtre: "Sculpture" },
  { name: "Peinture", cats: ["Peinture"], img: imgPeinture, filtre: "Peinture" },
  { name: "Vannerie et tressage", cats: ["Tressage", "Tissage"], img: imgTressage, filtre: "Tressage" },
  { name: "Sérigraphie", cats: ["Sérigraphie"], img: imgSerigraphie, filtre: "Sérigraphie" },
];

const FILTRES = ["Tout", "Botterie", "Bijouterie", "Peinture", "Sculpture"];
const OPERATEURS = [
  { label: "Wave", color: "#1DC8F2" },
  { label: "Orange Money", color: "#FF7900" },
  { label: "MTN MoMo", color: "#FFCB05" },
  { label: "Moov Money", color: "#0066B3" },
];

const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;
const premierePhrase = (t: string) => {
  const s = (t || "").trim();
  const i = s.search(/[.!?](\s|$)/);
  return i > 0 ? s.slice(0, i + 1) : s;
};

const HomePage = () => {
  const { data: produits = [] } = useProducts();
  const { data: artisans = [] } = useArtisans();
  const favorisArtisans = useFavorites("artisan");
  const [filtre, setFiltre] = useState("Tout");

  // Pièce mise en avant sur la bannière
  const vedette = useMemo(
    () => produits.find((p) => /cabosse/i.test(p.name)) ?? produits.find((p) => p.image),
    [produits]
  );

  const comptes = useMemo(() => {
    const c: Record<string, number> = {};
    produits.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, [produits]);

  const nouveautes = useMemo(
    () => produits.filter((p) => p.image && (filtre === "Tout" || p.category === filtre)).slice(0, 8),
    [produits, filtre]
  );

  // Artisan du mois : celui marqué "featured", sinon Gnango Sowi, sinon le premier
  const artisan = useMemo(
    () => artisans.find((a) => a.featured) ?? artisans.find((a) => a.slug === "gnango-sowi") ?? artisans[0],
    [artisans]
  );
  const oeuvresArtisan = useMemo(
    () => (artisan ? produits.filter((p) => p.artisanSlug === artisan.slug) : []),
    [produits, artisan]
  );
  const suivi = artisan ? favorisArtisans.isFavorite(artisan.id) : false;

  return (
    <AppShell>
      {/* Bannière */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-12 pt-4 md:pt-14 pb-14 md:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div className="order-2 lg:order-1">
          <h1 className="intro-rise m-0 text-[42px] sm:text-6xl lg:text-[80px] leading-none tracking-[-0.035em] font-[650]">
            Les mains de San Pedro, <span className="text-terracotta-bright">chez vous.</span>
          </h1>
          <p className="intro-rise intro-d1 mt-4 md:mt-6 text-base md:text-[19px] leading-relaxed text-ink-soft max-w-[32em]">
            Sandales en cuir, bijoux, toiles, sculptures : {produits.length || "des"} créations faites main par{" "}
            {artisans.length || "les"} artisans du programme PACTE, vendues directement par celles et ceux qui les
            fabriquent.
          </p>
          <div className="intro-rise intro-d2 flex flex-col sm:flex-row gap-3 mt-6 md:mt-8">
            <Link
              to="/boutique"
              className="h-[54px] px-7 rounded-full bg-primary text-white text-base font-semibold no-underline inline-flex items-center justify-center gap-2.5 hover:bg-[#8E4219] transition-colors"
            >
              Découvrir les créations <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />
            </Link>
            <Link
              to="/artisans"
              className="h-[54px] px-[26px] rounded-full border border-ink/[0.18] text-ink text-base font-semibold no-underline inline-flex items-center justify-center hover:border-ink/40 transition-colors"
            >
              Rencontrer les artisans
            </Link>
          </div>
          <div className="intro-rise intro-d3 mt-6 md:mt-10 flex items-center gap-2 md:gap-2.5 flex-wrap text-[13px] md:text-sm text-ink-soft">
            <span className="hidden md:inline-flex items-center gap-2 font-semibold text-ink">
              <Smartphone className="w-[18px] h-[18px]" strokeWidth={1.8} /> Paiement Mobile Money
            </span>
            {OPERATEURS.map((o) => (
              <span key={o.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink/[0.12] bg-white">
                <span className="w-2 h-2 rounded-full" style={{ background: o.color }} />
                {o.label}
              </span>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2 relative">
          <picture>
            <source media="(min-width: 1024px)" srcSet={heroDesktop} />
            <img
              src={heroMobile}
              alt="Atelier de sculpture à San Pedro"
              {...({ fetchpriority: "high" } as Record<string, string>)}
              className="intro-image w-full h-[400px] lg:h-[620px] object-cover rounded-[20px] lg:rounded-3xl bg-sand"
            />
          </picture>
          {vedette && (
            <Link
              to={`/boutique/${vedette.slug}`}
              className="intro-rise intro-d4 hidden sm:flex absolute left-5 bottom-5 w-[316px] max-w-[calc(100%-40px)] items-center gap-3.5 p-3 rounded-[18px] bg-white text-ink no-underline shadow-[0_14px_36px_rgba(29,23,18,0.22)] hover:-translate-y-0.5 transition-transform"
            >
              <img src={vedette.image} alt="" className="w-[68px] h-[68px] rounded-xl object-cover shrink-0" />
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[15px] font-semibold leading-tight">{vedette.name}</span>
                <span className="text-[13px] text-ink-muted truncate">{vedette.artisan}</span>
                <span className="text-[15px] font-bold mt-0.5">{fcfa(vedette.price)}</span>
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* Métiers */}
      <section id="metiers" className="max-w-[1280px] mx-auto px-4 md:px-12 pb-16 md:pb-[88px]">
        <div data-san-scroll className="flex justify-between items-end gap-4 flex-wrap mb-5 md:mb-7">
          <h2 className="m-0 text-[26px] md:text-[40px] leading-tight tracking-[-0.025em] font-semibold">Sept savoir-faire</h2>
          <Link to="/boutique" className="text-[15px] font-semibold no-underline inline-flex items-center gap-1.5 hover:underline underline-offset-4">
            Toute la boutique <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-[18px] overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 snap-x">
          {METIERS.map((m, i) => {
            const n = m.cats.reduce((s, c) => s + (comptes[c] ?? 0), 0);
            return (
              <Link
                key={m.name}
                to={`/boutique?cat=${encodeURIComponent(m.filtre)}`}
                data-san-scroll="zoom"
                data-san-delay={Math.min(i, 5)}
                className="group shrink-0 w-32 md:w-auto flex flex-col gap-2 md:gap-2.5 text-ink no-underline snap-start"
              >
                <span className="block rounded-2xl overflow-hidden bg-sand">
                  <img src={m.img} alt="" loading="lazy" className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </span>
                <span className="text-sm md:text-base font-semibold leading-tight">{m.name}</span>
                {n > 0 && <span className="hidden md:block text-[13px] text-ink-muted -mt-1.5">{n} création{n > 1 ? "s" : ""}</span>}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="bg-white border-y border-ink/[0.06]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10 md:py-20">
          <div data-san-scroll className="flex justify-between items-end gap-5 flex-wrap mb-6 md:mb-8">
            <h2 className="m-0 text-[26px] md:text-[40px] leading-tight tracking-[-0.025em] font-semibold">Nouveautés de l'atelier</h2>
            <div role="group" aria-label="Filtrer par métier" className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              {FILTRES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltre(f)}
                  aria-pressed={filtre === f}
                  className={`h-10 px-4 rounded-full text-sm whitespace-nowrap transition-colors ${
                    filtre === f ? "bg-ink text-white font-semibold" : "bg-white text-ink border border-ink/[0.14] font-medium hover:border-ink/35"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-7 md:gap-y-9">
            {nouveautes.map((p, i) => (
              <BoutiqueProductCard key={p.id} product={p} reveal={i % 4} />
            ))}
          </div>
          <div className="flex justify-center mt-8 md:mt-12">
            <Link
              to={filtre === "Tout" ? "/boutique" : `/boutique?cat=${encodeURIComponent(filtre)}`}
              className="h-[52px] w-full sm:w-auto px-7 rounded-full border border-ink/[0.18] text-ink text-[15px] font-semibold no-underline inline-flex items-center justify-center hover:border-ink/40 transition-colors"
            >
              {filtre === "Tout" ? `Voir les ${produits.length} créations` : `Toute la ${filtre.toLowerCase()}`}
            </Link>
          </div>
        </div>
      </section>

      {/* Artisan mis en avant */}
      {artisan && (
        <section className="bg-ink text-[#F3ECE4]">
          <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-10 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">
            {artisan.avatar ? (
              <img
                src={artisan.avatar}
                alt={`Portrait de ${artisan.name}`}
                loading="lazy"
                data-san-scroll="zoom"
                className="w-full aspect-[4/5] max-h-[420px] lg:max-h-[640px] object-cover rounded-[20px] lg:rounded-3xl bg-[#2A211B]"
              />
            ) : (
              <div className="w-full aspect-[4/5] max-h-[420px] rounded-3xl grid place-items-center text-6xl font-semibold" style={{ background: artisan.accentColor }}>
                {artisan.initials}
              </div>
            )}
            <div data-san-scroll data-san-delay="2">
              <h2 className="m-0 text-[32px] md:text-5xl leading-[1.02] tracking-[-0.03em] font-[650] text-white">
                Ce mois-ci, {artisan.name}, {artisan.metier.toLowerCase()}
              </h2>
              {artisan.bio && (
                <p className="mt-4 md:mt-6 text-base md:text-lg leading-relaxed text-[#D7CABE] max-w-[30em]">
                  {premierePhrase(artisan.bio)}
                </p>
              )}
              {oeuvresArtisan[0] && (
                <Link
                  to={`/boutique/${oeuvresArtisan[0].slug}`}
                  className="mt-6 md:mt-8 flex items-center gap-4 max-w-[420px] p-3.5 rounded-[18px] bg-white/[0.06] border border-white/10 text-[#F3ECE4] no-underline hover:bg-white/10 transition-colors"
                >
                  <img src={oeuvresArtisan[0].image} alt="" className="w-[84px] h-[104px] object-cover rounded-xl shrink-0" />
                  <span className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-white">{oeuvresArtisan[0].name}</span>
                    <span className="text-base font-bold text-white">{fcfa(oeuvresArtisan[0].price)}</span>
                  </span>
                </Link>
              )}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-7">
                <Link
                  to={`/artisans/${artisan.slug}`}
                  className="h-[52px] px-[26px] rounded-full bg-[#F3ECE4] text-ink text-base font-semibold no-underline inline-flex items-center justify-center hover:bg-white transition-colors"
                >
                  Voir ses {oeuvresArtisan.length} créations
                </Link>
                <button
                  onClick={() => favorisArtisans.toggle(artisan.id, artisan.name)}
                  aria-pressed={suivi}
                  className="h-[52px] px-[22px] rounded-full border border-white/30 bg-transparent text-white text-base font-semibold inline-flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <Heart className={`w-[18px] h-[18px] ${suivi ? "fill-white" : ""}`} strokeWidth={1.8} />
                  {suivi ? "Artisan suivi" : "Suivre cet artisan"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Comment acheter */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-12 py-10 md:py-[88px]">
        <h2 data-san-scroll className="m-0 mb-5 md:mb-10 text-[26px] md:text-[40px] leading-tight tracking-[-0.025em] font-semibold">Acheter en trois temps</h2>
        <ol className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-3 md:border-t border-ink/[0.12]">
          {[
            { t: "Choisissez une pièce", d: "Chaque création est vérifiée par l'équipe PACTE avant sa mise en ligne." },
            { t: "Payez avec votre téléphone", d: "Wave, Orange Money, MTN MoMo ou Moov Money, avec le numéro de votre compte : pas de carte, pas de formulaire en plus." },
            { t: "Recevez votre commande", d: "L'équipe PACTE vous appelle pour convenir de la livraison." },
          ].map((s, i) => (
            <li key={s.t} data-san-scroll data-san-delay={i + 1} className="flex md:flex-col gap-4 md:gap-2.5 py-4 md:pt-7 md:pr-8 border-t md:border-t-0 border-ink/[0.12] last:border-b md:last:border-b-0">
              <span className="text-[28px] md:text-[44px] font-[650] tracking-[-0.03em] text-terracotta-bright leading-none w-6 md:w-auto shrink-0">{i + 1}</span>
              <span className="flex flex-col gap-1 md:gap-2.5">
                <span className="text-[17px] md:text-xl font-semibold">{s.t}</span>
                <span className="text-[15px] md:text-base leading-relaxed text-ink-soft">{s.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
};

export default HomePage;
