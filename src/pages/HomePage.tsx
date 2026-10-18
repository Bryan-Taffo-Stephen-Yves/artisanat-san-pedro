import { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "../components/ui/ScrollReveal";
import { useThemeSection } from "../hooks/useThemeSection";
import { ArtisansCardFlipSection } from "../components/sections/ArtisansCardFlipSection";
import { MetiersDeckSection } from "../components/sections/MetiersDeckSection";
import { PinnedProductsSection } from "../components/sections/PinnedProductsSection";
import MonthlySelectionSection from "@/components/sections/MonthlySelectionSection";
import TrustStrip from "@/components/sections/TrustStrip";
import AppShell from "@/components/AppShell";

import heroDesktop from "@/assets/home/hero-desktop.webp";
import heroMobile from "@/assets/home/hero-mobile.webp";

/* ─── SECTION 1: BANNIÈRE ─── */
const HeroSection = () => {
  const mediaRef = useRef<HTMLDivElement>(null);

  // Parallaxe légère, uniquement tant que la bannière est visible
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let rafId = 0;
    const render = () => {
      rafId = 0;
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      el.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
    };
    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(render);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden flex items-end bg-[#1A120C]">
      <div
        ref={mediaRef}
        className="absolute inset-0 will-change-transform"
        style={{
          clipPath: "ellipse(140% 96% at 50% 0%)",
          WebkitClipPath: "ellipse(140% 96% at 50% 0%)",
        }}
      >
        <picture>
          <source media="(min-width: 768px)" srcSet={heroDesktop} />
          <img
            src={heroMobile}
            alt="Sculpture de marlin dans un atelier d'artisans à San Pedro"
            className="hero-zoom w-full h-full object-cover"
            {...({ fetchpriority: "high" } as Record<string, string>)}
            width={1080}
            height={1920}
          />
        </picture>
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,13,13,0.35) 0%, rgba(14,13,13,0.15) 35%, rgba(14,13,13,0.85) 100%)",
        }}
      />

      <div className="relative z-10 w-full px-6 sm:px-10 pb-20 max-w-3xl">
        <span className="s-hero-line mb-4 block" style={{ "--index": 0 } as React.CSSProperties}>
          <span className="s-hero-word" style={{ animationDelay: "0.05s" }}>
            <p className="font-label text-[10px] uppercase tracking-widest text-white/75">
              ARTISANAT SAN PEDRO · PROGRAMME PACTE
            </p>
          </span>
        </span>
        <h1 className="font-serif text-5xl sm:text-6xl leading-[1.05] text-white mb-5">
          <span className="s-hero-line" style={{ "--index": 0 } as React.CSSProperties}>
            <span className="s-hero-word">
              L&apos;art <em className="not-italic text-[#E8A27C]">vivant</em> de
            </span>
          </span>
          <span className="s-hero-line" style={{ "--index": 1 } as React.CSSProperties}>
            <span className="s-hero-word">
              Côte <em className="italic text-[#E8A27C]">d&apos;Ivoire</em>
            </span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-sm sm:text-base font-light leading-relaxed text-white/80 max-w-md"
        >
          Les créations authentiques des artisans de San Pedro — bottiers, bijoutiers,
          peintres, sculpteurs — vendues directement par leurs auteurs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap gap-3 mt-7"
        >
          <Link
            to="/boutique"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition"
          >
            Découvrir la boutique <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/artisans"
            className="inline-flex items-center h-12 px-6 rounded-full border border-white/30 text-white uppercase tracking-widest text-[0.7rem] font-bold hover:bg-white/10 transition-colors"
          >
            Nos artisans
          </Link>
        </motion.div>
      </div>

      {/* Indicateur de scroll */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-5 h-5 text-white/50" />
      </div>
    </section>
  );
};

/* ─── NEWSLETTER ─── */
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
  const heroRef = useThemeSection<HTMLDivElement>("dark");
  const metiersRef = useThemeSection<HTMLDivElement>("light");
  const artisansRef = useThemeSection<HTMLDivElement>("forest");
  const productsRef = useThemeSection<HTMLDivElement>("light");

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
