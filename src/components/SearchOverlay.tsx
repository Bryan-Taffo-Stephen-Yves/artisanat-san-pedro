import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { useArtisans } from "@/hooks/useArtisans";
import ArtisanAvatar from "@/components/ArtisanAvatar";

// Recherche insensible aux accents et à la casse ("serigraphie" trouve "Sérigraphie")
const normalize = (s: string) =>
  (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

interface Props { open: boolean; onClose: () => void; }

const SearchOverlay = ({ open, onClose }: Props) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: allProducts = [] } = useProducts();
  const { data: allArtisans = [] } = useArtisans();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const { products, artisans } = useMemo(() => {
    if (!query.trim()) return { products: [], artisans: [] };
    const q = normalize(query.trim());
    return {
      products: allProducts
        .filter((p) =>
          normalize(p.name).includes(q) ||
          normalize(p.category).includes(q) ||
          normalize(p.artisan).includes(q)
        )
        .slice(0, 4),
      artisans: allArtisans
        .filter((a) =>
          normalize(a.name).includes(q) ||
          normalize(a.metier).includes(q) ||
          normalize(a.metierCategory).includes(q)
        )
        .slice(0, 3),
    };
  }, [query, allProducts, allArtisans]);

  const submitSearch = (q: string) => {
    if (!q.trim()) return;
    navigate(`/boutique?q=${encodeURIComponent(q)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border/20">
            <Search className="w-5 h-5 text-primary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitSearch(query); }}
              placeholder="Rechercher une œuvre, un artisan, un métier…"
              className="flex-1 bg-transparent outline-none text-lg font-serif italic text-inverse-surface placeholder:text-muted-foreground placeholder:not-italic placeholder:font-sans placeholder:text-base"
            />
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-inverse-surface" />
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">
            {!query.trim() && (
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground mb-4">Suggestions populaires</p>
                <div className="flex flex-wrap gap-2">
                  {["Sandales", "Bijouterie", "Sculpture", "Peinture", "Sac"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-4 py-2 rounded-full border border-secondary/20 text-sm text-inverse-surface hover:bg-surface-container-low transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.trim() && products.length === 0 && artisans.length === 0 && (
              <p className="text-center font-serif italic text-muted-foreground mt-12">
                Aucun résultat pour « {query} »
              </p>
            )}

            {artisans.length > 0 && (
              <div className="mb-8">
                <p className="text-[13px] font-semibold text-muted-foreground mb-4">Artisans</p>
                <div className="space-y-2">
                  {artisans.map((a) => (
                    <Link
                      key={a.id}
                      to={`/artisans/${a.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 rounded-bento hover:bg-surface-container-low transition-colors"
                    >
                      <ArtisanAvatar
                        src={a.avatar}
                        initials={a.initials}
                        accentColor={a.accentColor}
                        name={a.name}
                        className="w-12 h-12 rounded-full shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-serif italic text-inverse-surface">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.metier} · {a.location}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {products.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground mb-4">Œuvres</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      to={`/boutique/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 rounded-bento hover:bg-surface-container-low transition-colors"
                    >
                      <img src={p.image} alt={p.name} loading="lazy" className="w-16 h-16 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif italic text-inverse-surface truncate">{p.name}</p>
                        <p className="text-[13px] font-semibold text-muted-foreground">{p.category}</p>
                        <p className="text-sm text-primary font-bold mt-1">{p.price.toLocaleString("fr-FR")} FCFA</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {products.length === 4 && (
                  <button
                    onClick={() => submitSearch(query)}
                    className="mt-6 w-full py-3 rounded-full border border-primary/40 text-primary text-[13px] font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Voir tous les résultats →
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;