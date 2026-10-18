import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useProducts, type ProductUI } from "@/hooks/useProducts";
import { useArtisans } from "@/hooks/useArtisans";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";
import { categoryAccent } from "@/lib/categoryColors";

const MonthlySelectionSection = () => {
  const { data: allProducts = [] } = useProducts();
  const { data: allArtisans = [] } = useArtisans();

  const selection = useMemo<ProductUI[]>(() => {
    const targets = ["Sculpture", "Poterie", "Tissage", "Bijouterie"];
    const picked: ProductUI[] = [];
    for (const cat of targets) {
      const found = allProducts.find(
        (p) => p.category === cat && !picked.some((x) => x.id === p.id)
      );
      if (found) picked.push(found);
    }
    while (picked.length < 4 && picked.length < allProducts.length) {
      const next = allProducts.find((p) => !picked.some((x) => x.id === p.id));
      if (!next) break;
      picked.push(next);
    }
    return picked.slice(0, 4);
  }, [allProducts]);

  const getArtisan = (slug: string) => allArtisans.find((a) => a.slug === slug);

  if (selection.length === 0) return null;

  const [featured, ...others] = selection;
  const featuredArtisan = getArtisan(featured.artisanSlug);
  const featuredAccent = categoryAccent(featured.categoryCode);

  const now = new Date();
  const monthName = now.toLocaleDateString("fr-FR", { month: "long" });
  const dateLabel = `${monthName.toUpperCase()} ${now.getFullYear()} · NOTRE CURATION`;

  return (
    <section className="relative py-20 px-6 bg-surface-container-low">
      {/* Header */}
      <ScrollReveal>
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-8 h-px"
              style={{ background: featuredAccent.hex }}
            />
            <span className="label-caps text-[10px] text-muted-foreground tracking-widest">
              {dateLabel}
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-inverse-surface leading-[1.05]">
            Notre Sélection
            <br />
            <span className="italic text-primary">du Mois</span>
          </h2>
          <p className="text-sm md:text-base font-light text-muted-foreground mt-4 leading-relaxed max-w-xl">
            Quatre pièces d&apos;exception choisies ce mois-ci par l&apos;équipe
            PACTE parmi les créations de nos artisans.
          </p>
        </div>
      </ScrollReveal>

      {/* Editorial Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {/* LEFT — Featured */}
        <motion.div variants={staggerItem}>
          <Link
            to={`/boutique/${featured.slug}`}
            className="group relative block rounded-bento overflow-hidden aspect-[4/5] md:aspect-auto md:h-full shadow-luxury"
          >
            <img
              src={featured.image}
              alt={featured.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(14,13,13,0.85) 0%, rgba(14,13,13,0.15) 55%, transparent 100%)",
              }}
            />

            {/* Top badge */}
            <div className="absolute top-5 left-5">
              <span className="glass-card inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-inverse-surface">
                <Sparkles className="w-3 h-3" style={{ color: featuredAccent.hex }} />
                Pièce phare du mois
              </span>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span
                className="label-caps text-[10px] tracking-widest font-bold"
                style={{ color: featuredAccent.hex }}
              >
                {featured.category}
              </span>
              <h3 className="font-serif text-2xl md:text-3xl text-primary-foreground mt-2 leading-tight">
                {featured.name}
              </h3>
              {featuredArtisan && (
                <p className="text-xs md:text-sm font-light text-primary-foreground/75 mt-1 italic">
                  par {featuredArtisan.name}
                </p>
              )}
              <div className="flex items-end justify-between mt-5 gap-3">
                <span className="font-serif text-xl md:text-2xl text-primary-foreground">
                  {featured.price.toLocaleString("fr-FR")}{" "}
                  <span className="text-xs uppercase tracking-widest font-sans font-light text-primary-foreground/70">
                    FCFA
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-foreground/15 backdrop-blur-md border border-primary-foreground/20 text-[10px] uppercase tracking-widest font-bold text-primary-foreground transition-all group-hover:bg-primary-foreground group-hover:text-inverse-surface">
                  Découvrir
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* RIGHT — 3 stacked */}
        <div className="flex flex-col gap-4 md:gap-6">
          {others.map((product) => {
            const artisan = getArtisan(product.artisanSlug);
            const accent = categoryAccent(product.categoryCode);
            return (
              <motion.div key={product.id} variants={staggerItem} className="flex-1">
                <Link
                  to={`/boutique/${product.slug}`}
                  className="group relative flex gap-4 rounded-bento overflow-hidden bg-background border border-border/10 shadow-sm hover:shadow-luxury transition-shadow duration-500 h-full"
                >
                  <div className="relative w-32 sm:w-40 shrink-0 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col justify-center py-4 pr-4 flex-1 min-w-0">
                    <span
                      className="label-caps text-[9px] tracking-widest font-bold"
                      style={{ color: accent.hex }}
                    >
                      {product.category}
                    </span>
                    <h3 className="font-serif text-base md:text-lg text-inverse-surface mt-1 leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    {artisan && (
                      <p className="text-[11px] font-light text-muted-foreground italic mt-0.5 truncate">
                        {artisan.name}
                      </p>
                    )}
                    <span className="font-serif text-sm text-inverse-surface mt-2">
                      {product.price.toLocaleString("fr-FR")}{" "}
                      <span className="text-[10px] uppercase tracking-widest font-sans font-light text-muted-foreground">
                        FCFA
                      </span>
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Footer stamp */}
      <ScrollReveal delay={0.1}>
        <div className="flex items-center justify-center gap-3 mt-12">
          <span className="w-12 h-px bg-border" />
          <span className="label-caps text-[10px] text-muted-foreground tracking-widest">
            Curation par l&apos;équipe PACTE San Pedro
          </span>
          <span className="w-12 h-px bg-border" />
        </div>
      </ScrollReveal>
    </section>
  );
};

export default MonthlySelectionSection;