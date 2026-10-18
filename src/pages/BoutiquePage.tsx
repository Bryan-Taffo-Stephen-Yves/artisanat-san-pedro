import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sparkles, Search, X } from "lucide-react";
import { motion } from "framer-motion";

import AppShell from "@/components/AppShell";
import BoutiqueProductCard from "@/components/BoutiqueProductCard";
import { useProducts } from "@/hooks/useProducts";
import { categoryAccent } from "@/lib/categoryColors";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem } from "@/lib/motionVariants";

const CATEGORIES = ["Tout", "Botterie", "Bijouterie", "Peinture", "Sculpture", "Accessoires", "Tressage", "Tissage", "Sérigraphie"];
const SORT_OPTIONS = [
  { value: "populaires", label: "Populaires" },
  { value: "prix-asc", label: "Prix ↑" },
  { value: "prix-desc", label: "Prix ↓" },
  { value: "recents", label: "Récents" },
];

const BoutiquePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allProducts = [], isLoading } = useProducts();

  const selectedCategory = searchParams.get("cat") || "tout";
  const searchQuery = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "populaires";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "tout" && key === "cat" || value === "populaires" && key === "sort") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    let results = [...allProducts];

    if (selectedCategory !== "tout") {
      results = results.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.artisan.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "prix-asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "prix-desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "recents":
        results.sort((a, b) => b.date.localeCompare(a.date));
        break;
      default:
        results.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews);
    }

    return results;
  }, [selectedCategory, searchQuery, sortBy, allProducts]);

  const resetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  return (
    <AppShell>
      {/* Header */}
      <ScrollReveal className="pt-20 pb-4 px-6">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          {" / "}
          <span className="text-inverse-surface">Boutique</span>
        </p>
        <h1 className="font-serif text-3xl italic text-inverse-surface">La Boutique</h1>
      </ScrollReveal>

      {/* Search + Filter Bar */}
      <div
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 40,
          background: '#fcf9f4',
          paddingTop: '16px',
          paddingBottom: '12px',
          paddingLeft: '24px',
          paddingRight: '24px',
          boxShadow: '0 4px 16px rgba(14, 13, 13, 0.06)',
        }}
      >
        {/* Search input */}
        <div className="glass-card rounded-full flex items-center gap-3 px-4 py-3 border border-border/20 mb-3">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Rechercher une œuvre..."
            className="bg-transparent border-none outline-none flex-1 text-sm font-light text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button onClick={() => setParam("q", "")} className="shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = cat.toLowerCase() === selectedCategory.toLowerCase();
            const accent =
              cat === "Tout" ? { hex: "#C3622D" } : categoryAccent(cat);
            return (
              <button
                key={cat}
                onClick={() => setParam("cat", cat.toLowerCase())}
                style={isActive ? { backgroundColor: accent.hex, color: "#fcf9f4" } : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${
                  isActive
                    ? ""
                    : "bg-surface-container-low text-muted-foreground hover:bg-surface-container"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort + results */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {filteredProducts.length} œuvre{filteredProducts.length !== 1 ? "s" : ""}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setParam("sort", e.target.value)}
            className="bg-surface-container-low rounded-full px-3 py-2 text-[10px] uppercase tracking-widest border-none outline-none text-inverse-surface cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product grid */}
      <div className="px-6 pb-16" style={{ paddingTop: '220px' }}>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-bento aspect-[3/4] bg-surface-container-low animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {filteredProducts.map((p) => (
              <motion.div key={p.id} variants={staggerItem}>
                <BoutiqueProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center mt-16">
            <p className="font-serif text-2xl italic text-muted-foreground">
              Aucune œuvre trouvée
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center justify-center h-10 px-6 rounded-full border border-secondary/20 text-primary uppercase tracking-widest text-[0.7rem] font-bold hover:bg-primary/5 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default BoutiquePage;
