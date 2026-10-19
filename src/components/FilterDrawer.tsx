import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { open: boolean; onClose: () => void; }

const CATEGORIES = ["Botterie", "Bijouterie", "Accessoires", "Sculpture", "Sérigraphie", "Tressage", "Tissage", "Peinture"];
const PRICE_RANGES = [
  { label: "< 20 000 FCFA", value: "0-20000" },
  { label: "20 000 – 50 000", value: "20000-50000" },
  { label: "50 000 – 100 000", value: "50000-100000" },
  { label: "> 100 000", value: "100000-999999" },
];

const FilterDrawer = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState("");

  const toggleCat = (cat: string) => {
    setSelectedCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const apply = () => {
    const params = new URLSearchParams();
    if (selectedCats.length) params.set("category", selectedCats.join(","));
    if (selectedPrice) params.set("price", selectedPrice);
    navigate(`/boutique?${params.toString()}`);
    onClose();
  };

  const reset = () => { setSelectedCats([]); setSelectedPrice(""); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-inverse-surface/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed top-0 left-0 bottom-0 z-[91] w-full sm:w-[380px] bg-background flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/20">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h2 className="font-serif italic text-xl text-inverse-surface">Filtres</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-inverse-surface" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Catégorie</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCats.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCat(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-container-low text-inverse-surface hover:bg-surface-container"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Fourchette de prix</p>
                <div className="space-y-2">
                  {PRICE_RANGES.map((p) => {
                    const active = selectedPrice === p.value;
                    return (
                      <button
                        key={p.value}
                        onClick={() => setSelectedPrice(active ? "" : p.value)}
                        className={`w-full text-left px-4 py-3 rounded-bento transition-all flex items-center justify-between ${
                          active
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-surface-container-low text-inverse-surface hover:bg-surface-container"
                        }`}
                      >
                        <span className="text-sm">{p.label}</span>
                        {active && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-border/20 px-6 py-5 space-y-2">
              <button
                onClick={apply}
                className="w-full py-3 rounded-full bg-primary text-primary-foreground uppercase tracking-widest text-[10px] font-bold"
              >
                Appliquer les filtres
              </button>
              <button
                onClick={reset}
                className="w-full py-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary"
              >
                Réinitialiser
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;