import AppShell from "@/components/AppShell";
import { ShoppingBag, Palette, Globe, Store, Laptop, TrendingUp, Users, Award, Handshake, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem, scaleReveal } from "@/lib/motionVariants";
import { FadeInText } from "@/components/ui/FadeInText";

const stats = [
  { value: "240+", label: "Artisans accompagnés" },
  { value: "1 200+", label: "Œuvres référencées" },
  { value: "35", label: "Artisans formés Phase 1" },
  { value: "17", label: "Pays acheteurs" },
  { value: "6", label: "Corps de métiers" },
  { value: "2026", label: "Année de lancement" },
];

const MISSION_BORDERS = ["#C3622D", "#A55427", "#864521"];
const PARTNER_COLORS = ["#C3622D", "#A55427", "#864521"];

const missions = [
  {
    title: "Générer des revenus durables",
    body: "Dans un contexte où l'économie locale cherche à se diversifier et à renforcer l'employabilité des jeunes et des femmes, la plateforme offre aux artisans un espace de vente professionnel et une visibilité numérique leur permettant d'accéder à des marchés jusqu'alors inaccessibles.",
  },
  {
    title: "Valoriser le patrimoine artisanal",
    body: "San Pedro abrite des artisans talentueux dont les savoir-faire — transmis de génération en génération — constituent un patrimoine culturel vivant. La plateforme leur confère une légitimité numérique et préserve ces traditions en les rendant accessibles au monde entier.",
  },
  {
    title: "Attirer les acheteurs internationaux",
    body: "En valorisant l'authenticité et l'excellence artisanale de San Pedro, la plateforme positionne la région comme une destination incontournable pour les acheteurs et les touristes en quête de créations africaines authentiques et de haute qualité.",
  },
];

const values = [
  { icon: Heart, title: "Authenticité", desc: "Chaque œuvre est vérifiée, chaque artisan est certifié. Aucune contrefaçon, aucune production de masse." },
  { icon: Handshake, title: "Commerce équitable", desc: "100% du prix artisan lui est reversé directement. Transparence totale sur la chaîne de valeur." },
  { icon: Award, title: "Excellence", desc: "Une sélection rigoureuse, une présentation haut de gamme, une expérience d'achat digne des plus grandes galeries." },
  { icon: Globe, title: "Accessibilité", desc: "Paiements locaux (Wave, Orange Money, MTN) et internationaux (Stripe, PayPal). Livraison dans 17 pays." },
];

const partners = [
  { name: "Chambre des Métiers de San Pedro", role: "Partenaire institutionnel" },
  { name: "Conseil Citoyen", role: "Gouvernance locale" },
  { name: "SELLARS AFRICA", role: "Partenaire technique" },
  { name: "Mairie de San Pedro", role: "Autorité locale" },
  { name: "AMF-UEMOA", role: "Partenaire financier" },
];

const phases = [
  { phase: "Phase 1", period: "Jan — Mars 2026", title: "Lancement & Onboarding", desc: "Recrutement des 35 premiers artisans, formation numérique, mise en ligne de la plateforme beta.", status: "done" },
  { phase: "Phase 2", period: "Avr — Juin 2026", title: "Croissance & Marketing", desc: "Campagnes réseaux sociaux, partenariats internationaux, objectif 100 artisans actifs.", status: "active" },
  { phase: "Phase 3", period: "Juil — Déc 2026", title: "Consolidation & Scale", desc: "Expansion vers d'autres régions de Côte d'Ivoire, intégration logistique avancée, 240+ artisans.", status: "upcoming" },
];

const AboutPage = () => (
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
        Mains de San Pedro est la vitrine numérique officielle des artisans de la région de San Pedro, en Côte d'Ivoire. Portée par le programme PACTE — Partenariat pour une Administration Citoyenne et la Transformation de l'État — cette plateforme e-commerce connecte des créateurs d'exception aux marchés local, national et international. Elle réunit sept corps de métiers : Botterie, Bijouterie, Décoration, Vannerie, Sculpture, Sérigraphie et Tissage, à travers une expérience d'achat moderne, sécurisée et culturellement ancrée.
      </p>
    </ScrollReveal>

    {/* Mission */}
    <div className="px-6 py-10">
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
            <FadeInText
              text={m.body}
              className="text-sm font-light leading-relaxed text-on-surface-variant mt-2"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* Project Description */}
    <div className="px-6 py-8 bg-surface-container-low rounded-[2rem] mx-6 mb-6">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">LE PROJET</p>
      <h2 className="font-headline text-2xl italic mb-6">Une double infrastructure</h2>
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Store className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline text-base">La boutique physique</h3>
            <p className="font-body text-sm text-on-surface-variant font-light leading-relaxed mt-1">
              Située au cœur de San Pedro, la boutique physique sert de showroom permanent, de point de retrait pour les commandes en ligne, et de centre de formation pour les artisans. Elle incarne la passerelle entre le monde numérique et l'artisanat tangible.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Laptop className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline text-base">La plateforme numérique</h3>
            <p className="font-body text-sm text-on-surface-variant font-light leading-relaxed mt-1">
              Application web moderne permettant aux artisans de gérer leur catalogue, recevoir des commandes et suivre leurs revenus. Les acheteurs bénéficient d'une expérience e-commerce fluide avec paiements sécurisés et livraison internationale.
            </p>
          </div>
        </div>
      </div>
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

    {/* Values */}
    <div className="px-6 py-8">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">NOS VALEURS</p>
      <h2 className="font-headline text-2xl italic mb-6">Ce qui nous guide</h2>
      <div className="grid grid-cols-2 gap-3">
        {values.map((v) => (
          <div key={v.title} className="bg-surface-container-lowest rounded-[1.5rem] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <v.icon className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-headline text-sm">{v.title}</h3>
            <p className="text-[11px] text-on-surface-variant font-light leading-relaxed mt-1">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Roadmap */}
    <div className="px-6 py-8">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">FEUILLE DE ROUTE</p>
      <h2 className="font-headline text-2xl italic mb-6">Notre trajectoire 2026</h2>
      <div className="space-y-4">
        {phases.map((p) => (
          <div
            key={p.phase}
            className={`rounded-[1.5rem] p-5 ${
              p.status === "active"
                ? "bg-primary text-white"
                : "bg-surface-container-lowest"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[9px] uppercase tracking-widest font-bold ${p.status === "active" ? "text-white/70" : "text-primary"}`}>
                {p.phase}
              </span>
              <span className={`text-[9px] uppercase tracking-widest ${p.status === "active" ? "text-white/50" : "text-on-surface-variant"}`}>
                {p.period}
              </span>
            </div>
            <h3 className={`font-headline text-base ${p.status === "active" ? "text-white" : ""}`}>{p.title}</h3>
            <p className={`text-sm font-light leading-relaxed mt-1 ${p.status === "active" ? "text-white/70" : "text-on-surface-variant"}`}>
              {p.desc}
            </p>
            {p.status === "done" && (
              <span className="inline-block mt-3 text-[9px] uppercase tracking-widest text-green-600 font-bold">Complétée</span>
            )}
            {p.status === "active" && (
              <span className="inline-flex items-center gap-1 mt-3 text-[9px] uppercase tracking-widest text-white/80 font-bold">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> En cours
              </span>
            )}
            {p.status === "upcoming" && (
              <span className="inline-block mt-3 text-[9px] uppercase tracking-widest text-on-surface-variant">À venir</span>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Partners */}
    <div className="px-6 py-8">
      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">ÉCOSYSTÈME</p>
      <h2 className="font-headline text-2xl italic mb-6">Nos Partenaires</h2>
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {partners.map((p, i) => {
          const color = PARTNER_COLORS[i % PARTNER_COLORS.length];
          return (
          <motion.div key={p.name} variants={staggerItem} className="flex items-center gap-4 bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: `${color}1A`, color }}
            >
              {p.name.charAt(0)}
            </div>
            <div>
              <p className="font-headline text-sm">{p.name}</p>
              <p className="text-[9px] uppercase tracking-widest text-on-surface-variant mt-0.5">{p.role}</p>
            </div>
          </motion.div>
          );
        })}
      </motion.div>
    </div>

    {/* CTA */}
    <div className="mx-6 mb-6 bg-[#2C1810] rounded-[2rem] p-8 text-center">
      <p className="text-[10px] uppercase tracking-widest text-primary mb-3">REJOIGNEZ LE MOUVEMENT</p>
      <h2 className="font-serif text-2xl italic text-white mb-3">
        Soutenez l'artisanat de San Pedro
      </h2>
      <p className="text-sm font-light leading-relaxed text-white/70 mb-6 max-w-md mx-auto">
        Chaque achat sur la plateforme soutient directement un artisan et sa famille. Découvrez des créations uniques, faites avec passion et savoir-faire ancestral.
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

export default AboutPage;
