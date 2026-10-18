import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

import AppShell from "@/components/AppShell";
import { useArtisans } from "@/hooks/useArtisans";
import ArtisanAvatar from "@/components/ArtisanAvatar";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem, slideLeft, scaleReveal } from "@/lib/motionVariants";

const METIERS = ["Tous", "Botterie", "Bijouterie", "Peinture", "Sculpture", "Accessoires", "Tressage", "Sérigraphie"];

const ArtisansPage = () => {
  const [selectedMetier, setSelectedMetier] = useState("Tous");
  const { data: allArtisans = [], isLoading } = useArtisans();

  const featured = allArtisans.find((a) => a.featured) || allArtisans[0];

  const filtered = useMemo(() => {
    if (selectedMetier === "Tous") return allArtisans;
    return allArtisans.filter((a) => a.metierCategory === selectedMetier);
  }, [selectedMetier, allArtisans]);

  return (
    <AppShell>
      {/* Header */}
      <ScrollReveal variants={slideLeft} className="px-6 pt-24 pb-6">
        <span className="label-caps text-[10px] text-muted-foreground mb-1 block">Nos créateurs</span>
        <h1 className="font-serif text-4xl italic text-inverse-surface leading-tight">
          Le Village des
          <br />
          Maîtres Artisans
        </h1>
        <p className="text-sm text-muted-foreground font-light mt-2">
          {allArtisans.length > 0 ? `${allArtisans.length} créateurs` : "Les créateurs"} de San Pedro, Côte d'Ivoire
        </p>
      </ScrollReveal>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 mb-6">
        {METIERS.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMetier(m)}
            className={`shrink-0 rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${
              selectedMetier === m
                ? "bg-primary text-primary-foreground"
                : "bg-surface-container-low text-muted-foreground hover:bg-surface-container"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="px-6 pb-16">
        {/* Featured artisan */}
        {featured && selectedMetier === "Tous" && (
          <ScrollReveal variants={scaleReveal} className="mb-6">
          <Link
            to={`/artisans/${featured.slug}`}
            className="bg-[#2C1810] rounded-bento p-5 flex gap-4 items-center group"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
              <ArtisanAvatar
                src={featured.avatar}
                initials={featured.initials}
                accentColor={featured.accentColor}
                name={featured.name}
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-primary text-[9px] uppercase tracking-widest font-bold">À la une</span>
              <p className="font-serif text-xl text-primary-foreground italic truncate">{featured.name}</p>
              <p className="text-primary-foreground/70 text-xs line-clamp-2 mt-1">{featured.bio}</p>
            </div>
            <div className="w-9 h-9 rounded-full glass-dark flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <ArrowRight className="w-4 h-4 text-primary-foreground" />
            </div>
          </Link>
          </ScrollReveal>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-bento aspect-[3/4] bg-surface-container-low animate-pulse" />
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
        <motion.div
          className="grid grid-cols-2 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {filtered.map((artisan) => (
            <motion.div key={artisan.id} variants={staggerItem}>
            <Link
              to={`/artisans/${artisan.slug}`}
              className="group cursor-pointer block"
            >
              <div className="rounded-bento overflow-hidden relative aspect-[3/4]">
                <ArtisanAvatar
                  src={artisan.avatar}
                  initials={artisan.initials}
                  accentColor={artisan.accentColor}
                  name={artisan.name}
                  className="w-full h-full grayscale-[0.2] sepia-[0.1] group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/70 via-transparent to-transparent" />
                {artisan.featured && (
                  <span className="absolute top-3 right-3 glass-card px-2.5 py-1 rounded-full text-[8px] uppercase tracking-wider font-bold text-primary">
                    Vedette
                  </span>
                )}
                <div className="absolute bottom-4 left-4">
                  <span className="text-[9px] uppercase tracking-widest text-primary-foreground/70">{artisan.metier}</span>
                  <p className="font-serif text-base font-medium text-primary-foreground">{artisan.name}</p>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">
                  {artisan.location} · Depuis {artisan.since}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.round(artisan.rating) ? "fill-primary text-primary" : "text-border"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{artisan.rating}</span>
                  <span className="text-[9px] text-muted-foreground">({artisan.reviews} avis)</span>
                </div>
              </div>
            </Link>
            </motion.div>
          ))}
        </motion.div>
        )}
      </div>
    </AppShell>
  );
};

export default ArtisansPage;
