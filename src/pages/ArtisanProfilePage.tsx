import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Share2, Star, Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";
import { motion } from "framer-motion";

import { useArtisan } from "@/hooks/useArtisans";
import { useProductsByArtisan } from "@/hooks/useProducts";
import ArtisanAvatar from "@/components/ArtisanAvatar";
import BoutiqueProductCard from "@/components/BoutiqueProductCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

const ArtisanProfilePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: artisan, isLoading } = useArtisan(slug);
  const { data: products = [] } = useProductsByArtisan(artisan?.id);
  const favorites = useFavorites("artisan");

  const share = async () => {
    const url = window.location.href;
    const title = artisan ? `${artisan.name} — Mains de San Pedro` : "Mains de San Pedro";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié");
      }
    } catch {
      /* partage annulé */
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-32 px-6">
        <div className="h-[280px] rounded-bento bg-surface-container-low animate-pulse" />
        <div className="mt-8 h-40 rounded-bento bg-surface-container-low animate-pulse" />
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-serif text-2xl italic text-muted-foreground">Artisan introuvable</p>
          <button
            onClick={() => navigate("/artisans")}
            className="mt-4 inline-flex items-center justify-center h-10 px-6 rounded-full border border-secondary/20 text-primary text-base font-semibold hover:bg-primary/5 transition-colors"
          >
            Retour aux artisans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Nav */}
      <header className="glass-card fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-inverse-surface" />
        </button>
        <Link to="/" className="font-serif text-base italic text-inverse-surface tracking-tight hover:text-primary transition-colors">
          Mains de San Pedro
        </Link>
        <button onClick={share} aria-label="Partager cette page" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors">
          <Share2 className="w-[18px] h-[18px] text-inverse-surface" />
        </button>
      </header>

      {/* Hero section */}
      <div className="relative h-[280px] overflow-hidden">
        {artisan.coverImage ? (
          <img
            src={artisan.coverImage}
            alt={artisan.metier}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.5) sepia(0.2)" }}
            width={1200}
            height={600}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${artisan.accentColor}, #1a1a1a)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Floating identity card */}
      <div className="relative px-6 -mt-14">
        <div className="bg-background rounded-bento p-5 flex items-end gap-4 shadow-luxury">
          <div className="w-20 h-20 rounded-[1rem] overflow-hidden border-4 border-background -mt-12">
            <ArtisanAvatar
              src={artisan.avatar}
              initials={artisan.initials}
              accentColor={artisan.accentColor}
              name={artisan.name}
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl italic text-inverse-surface">{artisan.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="glass-card text-primary text-[13px] font-semibold px-3 py-1 rounded-full">
                {artisan.metier}
              </span>
              <span className="text-xs text-muted-foreground">{artisan.location}, Côte d'Ivoire</span>
            </div>
          </div>
          <button
            onClick={() => favorites.toggle(artisan.id, artisan.name)}
            aria-pressed={favorites.isFavorite(artisan.id)}
            aria-label={favorites.isFavorite(artisan.id) ? `Retirer ${artisan.name} des favoris` : `Ajouter ${artisan.name} aux favoris`}
            className="w-11 h-11 shrink-0 rounded-full border border-border/30 flex items-center justify-center hover:bg-primary/5 transition-colors"
          >
            <Heart className={`w-5 h-5 ${favorites.isFavorite(artisan.id) ? "fill-primary text-primary" : "text-inverse-surface"}`} />
          </button>
        </div>
      </div>

      {/* Stats bento */}
      <motion.div
        className="mt-6 px-6 grid grid-cols-4 gap-2"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          { value: products.length, label: "Œuvres" },
          { value: artisan.reviews, label: "Avis" },
          { value: artisan.rating.toString(), label: "Note" },
          { value: artisan.since.toString(), label: "Depuis" },
        ].map((s) => (
          <motion.div key={s.label} variants={staggerItem} className="bg-surface-container-low rounded-xl p-3 text-center">
            <span className="font-serif text-2xl text-primary block">{s.value}</span>
            <span className="label-caps text-[9px] text-muted-foreground">{s.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Bio */}
      <ScrollReveal className="px-6 mt-8">
        <span className="label-caps text-[10px] text-muted-foreground mb-3 block">À propos</span>
        <div className="bg-surface-container-low rounded-bento p-6">
          <span className="font-serif text-4xl text-primary leading-none opacity-30 block">"</span>
          <p className="font-serif text-base italic font-light text-inverse-surface leading-relaxed -mt-4">
            {artisan.bio}
          </p>
        </div>
      </ScrollReveal>

      {/* Products */}
      {products.length > 0 && (
        <div className="px-6 mt-8">
          <h2 className="font-serif text-2xl italic text-inverse-surface mb-6">Ses Créations</h2>
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {products.map((p) => (
              <motion.div key={p.id} variants={staggerItem}>
                <BoutiqueProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ArtisanProfilePage;
