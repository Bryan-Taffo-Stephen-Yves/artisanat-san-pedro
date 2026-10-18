import { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowRight, Play, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { staggerContainer, staggerItem, slideLeft, scaleReveal } from "../lib/motionVariants";
import { lenisInstance } from "../hooks/useLenis";
import { FadeInText } from "../components/ui/FadeInText";
import { Cascade } from "../components/ui/Cascade";
import { useImageDistort } from "../hooks/useImageDistort";
import { useThemeSection } from "../hooks/useThemeSection";
import { ArtisansCardFlipSection } from "../components/sections/ArtisansCardFlipSection";
import { MetiersDeckSection } from "../components/sections/MetiersDeckSection";
import { PinnedProductsSection } from "../components/sections/PinnedProductsSection";
import MonthlySelectionSection from "@/components/sections/MonthlySelectionSection";
import TrustStrip from "@/components/sections/TrustStrip";

import AppShell from "@/components/AppShell";
import { ProductCard, mockProducts } from "@/components/ProductCard";
import { allProducts } from "@/data/products";
import { categoryAccent } from "@/lib/categoryColors";

import heroImg from "@/assets/hero-sculptor.jpg";
import catSculpture from "@/assets/cat-sculpture.jpg";
import catTressage from "@/assets/cat-tressage.jpg";
import catTissage from "@/assets/cat-tissage.jpg";
import catPottery from "@/assets/featured-pottery.jpg";
import catForge from "@/assets/cat-forge.jpg";
import catPeinture from "@/assets/cat-peinture.jpg";

import artisanKofi from "@/assets/artisan-kofi.jpg";
import artisanAma from "@/assets/artisan-ama.jpg";
import artisanYao from "@/assets/artisan-yao.jpg";

/* ─── SECTION 1: HERO ─── */
const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleSound = () => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted) videoRef.current.play().catch(() => {});
  };

  const heroRef = useRef(null);
  const distortRef = useImageDistort();

  useEffect(() => {
    const heroImg = document.querySelector('.hero-parallax-img') as HTMLElement | null;
    if (!heroImg) return;
    const handleScroll = ({ scroll }: { scroll: number }) => {
      const speed = 0.35;
      heroImg.style.transform = `translateY(${scroll * speed}px)`;
    };
    lenisInstance?.on('scroll', handleScroll);
    return () => { lenisInstance?.off('scroll', handleScroll); };
  }, []);

  return (
  <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden flex items-end">
    <div
      ref={distortRef}
      data-san-scroll
      className="clip-reveal absolute inset-0 will-change-transform"
      style={{
        clipPath: 'ellipse(140% 96% at 50% 0%)',
        WebkitClipPath: 'ellipse(140% 96% at 50% 0%)',
      }}
    >
      {prefersReducedMotion ? (
        <img
          src={heroImg}
          alt="Artisan sculpteur à San Pedro"
          className="hero-parallax-img w-full h-full object-cover will-change-transform"
          style={{ filter: "brightness(0.65) contrast(1.1) sepia(0.18)" }}
          width={1080}
          height={1920}
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={heroImg}
          preload="auto"
          className="hero-parallax-img w-full h-full object-cover will-change-transform"
          style={{ filter: "brightness(0.65) contrast(1.1) sepia(0.18)" }}
          aria-label="Vidéo d'ambiance — artisans de San Pedro"
        >
          <source
            src="https://videos.pexels.com/video-files/4881824/4881824-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
      )}
    </div>
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, rgba(45,74,45,0.30) 0%, rgba(139,26,26,0.15) 50%, rgba(14,13,13,0.85) 100%)",
      }}
    />

    {!prefersReducedMotion && (
      <button
        onClick={toggleSound}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none"
        aria-label={isMuted ? "Activer le son de la vidéo" : "Couper le son"}
      >
        <span
          className="absolute inset-0 rounded-full bg-white/15 animate-ping"
          style={{ animationDuration: '2.5s' }}
        />
        <div className="relative w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300 shadow-2xl">
          {isMuted ? (
            <VolumeX className="w-7 h-7 text-white" strokeWidth={1.8} />
          ) : (
            <Volume2 className="w-7 h-7 text-white" strokeWidth={1.8} />
          )}
        </div>
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-white/70 whitespace-nowrap font-light">
          {isMuted ? 'Cliquez pour activer le son' : 'Couper le son'}
        </span>
      </button>
    )}

    <div className="relative z-10 w-full px-6 pb-16">
      <span className="s-hero-line mb-4 block" style={{ "--index": 0 } as React.CSSProperties}>
        <span className="s-hero-word" style={{ animationDelay: '0.05s' }}>
          <p className="font-label text-[10px] uppercase tracking-widest text-white/70">
            ARTISANAT SAN PEDRO · PACTE
          </p>
        </span>
      </span>
      <h1 className="font-serif text-5xl leading-[1.05] text-white mb-6" style={{ mixBlendMode: "difference" }}>
        <span className="s-hero-line" style={{ "--index": 0 } as React.CSSProperties}>
          <span className="s-hero-word">
            L&apos;art <em className="not-italic text-[#D28962]">vivant</em> de
          </span>
        </span>
        <span className="s-hero-line" style={{ "--index": 1 } as React.CSSProperties}>
          <span className="s-hero-word">
            Côte <em className="italic text-primary">d&apos;Ivoire</em>
          </span>
        </span>
      </h1>

      {/* Brand signature dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="flex gap-2 mt-4 opacity-60"
      >
        <span className="w-2 h-2 rounded-full" style={{ background: "#C3622D" }} />
        <span className="w-2 h-2 rounded-full" style={{ background: "#864521" }} />
        <span className="w-2 h-2 rounded-full" style={{ background: "#A55427" }} />
      </motion.div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
      <ChevronDown className="w-5 h-5 text-foreground/40" />
    </div>
  </section>
  );
};

/* ─── SECTION 2: STATS BENTO ─── */
const StatsBento = () => (
  <section className="relative z-10 -mt-10 px-6">
    <motion.div
      className="grid grid-cols-2 gap-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      <motion.div variants={staggerItem} className="glass-card rounded-bento p-6 border border-border/10 shadow-luxury">
        <span className="font-serif text-3xl text-primary">240+</span>
        <p className="label-caps text-[10px] text-muted-foreground mt-1">Artisans</p>
      </motion.div>
      <motion.div variants={staggerItem} className="bg-primary/5 rounded-bento p-6 border border-primary/5">
        <span className="font-serif text-3xl text-inverse-surface">1 200</span>
        <p className="label-caps text-[10px] text-muted-foreground mt-1">Œuvres</p>
      </motion.div>
      <motion.div variants={staggerItem} className="glass-card col-span-2 rounded-bento p-6 border border-border/10 shadow-luxury flex items-center justify-between">
        <div>
          <span className="font-serif text-3xl text-inverse-surface">6</span>
          <p className="label-caps text-[10px] text-muted-foreground mt-1">Métiers d'Excellence</p>
        </div>
        <div className="flex -space-x-3">
          {[artisanKofi, artisanAma, artisanYao].map((src, i) => (
            <div key={i} className="w-10 h-10 rounded-full overflow-hidden border-2 border-background">
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" width={40} height={40} />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  </section>
);

/* ─── SECTION 3: CORPS DE MÉTIERS ─── */
const categories = [
  { code: "SCU", name: "Sculpture", image: catSculpture, count: 31 },
  { code: "TRE", name: "Tressage", image: catTressage, count: 22 },
  { code: "TIS", name: "Tissage", image: catTissage, count: 18 },
  { code: "POT", name: "Poterie", image: catPottery, count: 24 },
  { code: "PNT", name: "Peinture", image: catPeinture, count: 19 },
];

const MetiersSection = () => (
  <section className="py-12 px-6">
    <ScrollReveal variants={slideLeft}>
      <span className="label-caps text-[10px] text-muted-foreground block mb-2">Nos métiers</span>
    </ScrollReveal>
    <ScrollReveal delay={0.1}>
      <h2 className="font-serif text-2xl text-inverse-surface mb-8">Savoir-faire</h2>
    </ScrollReveal>
    <motion.div
      className="grid grid-cols-2 gap-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {categories.map((cat) => {
        const accent = categoryAccent(cat.code);
        return (
          <motion.a
            key={cat.code}
            variants={staggerItem}
            href="#"
            className="relative rounded-bento overflow-hidden group aspect-[4/5]"
          >
            <img
              src={cat.image}
              alt={cat.name}
              loading="lazy"
              width={800}
              height={1000}
              data-san-scroll
              className="clip-reveal absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${accent.hex}55 0%, rgba(14,13,13,0.25) 60%, transparent 100%)`,
              }}
            />
            <span
              className="absolute top-3 left-3 glass-card px-2 py-1 rounded-lg text-[9px] uppercase tracking-tight font-bold"
              style={{ color: accent.hex }}
            >
              {cat.code}
            </span>
            <div className="absolute bottom-4 left-4">
              <span className="font-serif italic text-lg text-primary-foreground block">
                {cat.name}
              </span>
              <span
                className="text-[9px] uppercase tracking-widest font-bold"
                style={{ color: accent.hex }}
              >
                {cat.count} pièces
              </span>
            </div>
          </motion.a>
        );
      })}
    </motion.div>
  </section>
);

/* ─── SECTION 4: ARTISANS EN VEDETTE ─── */
const artisans = [
  { name: "Kofi Asante", metier: "Sculpteur", since: "Depuis 1998", image: artisanKofi, slug: "kofi-asante" },
  { name: "Ama Diallo", metier: "Potière", since: "Depuis 2005", image: artisanAma, slug: "ama-diallo" },
  { name: "Yao Kouadio", metier: "Tisserand", since: "Depuis 1992", image: artisanYao, slug: "yao-kouadio" },
];

const metierAccent = (metier: string): string => {
  const m = metier.toLowerCase();
  if (m.startsWith("sculpt") || m.startsWith("pot")) return "#C3622D";
  if (m.startsWith("tisser") || m.startsWith("tiss")) return "#864521";
  if (m.startsWith("forge")) return "#864521";
  if (m.startsWith("tress") || m.startsWith("peintr")) return "#A55427";
  return "#C3622D";
};

const ArtisansSection = () => (
  <section className="relative bg-surface-container-low">
    <div className="s-sticky-heading px-6 py-8 bg-surface-container-low">
      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
        NOS CRÉATEURS
      </p>
      <h2 className="font-headline text-3xl italic">
        L&apos;Âme derrière<br />
        <span className="text-primary">l&apos;Œuvre</span>
      </h2>
    </div>
    <div className="overflow-x-auto no-scrollbar flex gap-4 px-6 pb-12">
      {artisans.map((a) => (
        <motion.div
          key={a.slug}
          variants={staggerItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="min-w-[260px] relative rounded-bento overflow-hidden shrink-0"
        >
          <div className="aspect-[3/4]">
            <img
              src={a.image}
              alt={a.name}
              loading="lazy"
              width={750}
              height={1000}
              className="w-full h-full object-cover img-warm"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 to-transparent" />
          <span className="absolute top-4 right-4 glass-card px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-inverse-surface">
            {a.metier}
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="font-serif text-lg text-primary-foreground">{a.name}</h3>
            <span
              className="block w-8 h-0.5 rounded-full mt-1 mb-1"
              style={{ background: metierAccent(a.metier) }}
            />
            <p className="text-xs text-primary-foreground/70">{a.since}</p>
          </div>
          <Link
            to={`/artisans/${a.slug}`}
            className="absolute bottom-4 right-4 w-9 h-9 rounded-full glass-card flex items-center justify-center"
          >
            <ArrowRight className="w-4 h-4 text-inverse-surface" />
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ─── SECTION 5: PIÈCES POPULAIRES ─── */

/* ─── SECTION 6: ÉDITO CULTUREL ─── */
const EditoSection = () => (
  <ScrollReveal variants={scaleReveal}>
  <section
    className="relative py-16 px-6 texture-overlay"
    style={{ backgroundColor: "#1A2D1A" }}
  >
    <span className="font-serif text-3xl italic text-primary-foreground block">L'Héritage</span>
    <span className="label-caps text-[10px] text-primary-foreground/60 mt-2 block">
      Chaque pièce, une histoire
    </span>
    <FadeInText
      text="À San Pedro, l'artisanat n'est pas un métier. C'est un langage transmis de génération en génération, façonné par des mains expertes qui transforment la matière brute en œuvres d'exception."
      className="text-sm font-light leading-relaxed text-on-surface-variant mt-4 max-w-sm"
      baseColor="rgba(255,255,255,0.25)"
      targetColor="rgb(255,255,255)"
    />
    <blockquote className="font-serif text-3xl italic text-primary-foreground mt-6 leading-snug">
      <span style={{ color: "#D28962" }}>“</span>Chaque pièce porte l'histoire de tout un peuple.<span style={{ color: "#D28962" }}>”</span>
    </blockquote>
    <p className="label-caps text-[10px] text-primary-foreground/50 mt-2 tracking-widest">
      — Kofi Asante, Sculpteur
    </p>
    <div className="flex gap-3 mt-8">
      <Link
        to="/boutique"
        className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition-all"
      >
        Explorer la Boutique
      </Link>
      <Link
        to="/artisans"
        className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-primary-foreground/20 text-primary-foreground uppercase tracking-widest text-[0.7rem] font-bold hover:bg-primary-foreground/10 transition-colors"
      >
        Nos Artisans
      </Link>
    </div>
  </section>
  </ScrollReveal>
);

/* ─── SECTION 7: NEWSLETTER ─── */
const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-12 px-6 pb-16 gradient-newsletter">
      <ScrollReveal>
        <span className="label-caps text-[10px] text-muted-foreground mb-2 block">Restez connecté</span>
        <h2 className="font-serif text-2xl text-inverse-surface">L'art au bout des doigts</h2>
      </ScrollReveal>
      <ScrollReveal delay={0.15}>
        <p className="text-sm text-muted-foreground font-light mt-2 mb-6 leading-relaxed">
          Nouvelles créations, portraits d'artisans et événements culturels — chaque mois dans votre boîte mail.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="bg-surface-container-low rounded-xl px-4 py-3 w-full border-none text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow"
        />
        <button className="mt-3 w-full py-3 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition-all">
          S'abonner
        </button>
      </ScrollReveal>
    </section>
  );
};

/* ─── PAGE ─── */
const HomePage = () => {
  const heroRef = useThemeSection<HTMLDivElement>('dark');
  const metiersRef = useThemeSection<HTMLDivElement>('light');
  const artisansRef = useThemeSection<HTMLDivElement>('forest');
  const productsRef = useThemeSection<HTMLDivElement>('light');

  return (
    <AppShell>
      <div ref={heroRef}><HeroSection /></div>
      <div ref={productsRef}><PinnedProductsSection /></div>
      <div ref={metiersRef}><MetiersDeckSection /></div>
      <div ref={artisansRef}><ArtisansCardFlipSection /></div>
      <MonthlySelectionSection />
      <TrustStrip />
      <NewsletterSection />
    </AppShell>
  );
};

export default HomePage;
