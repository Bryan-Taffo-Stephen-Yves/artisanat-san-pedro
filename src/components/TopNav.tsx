import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, Heart, ShoppingBag, User, SlidersHorizontal } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import NavigationDrawer from "@/components/NavigationDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import CartDrawer from "@/components/CartDrawer";
import FilterDrawer from "@/components/FilterDrawer";
import { useCart } from "@/context/CartContext";

const TopNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const { totalItems } = useCart();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      <motion.div
        style={{
          scaleX,
          transformOrigin: "left center",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, #C3622D, #A55427)",
          zIndex: 999,
          pointerEvents: "none",
        }}
      />
      <header className="glass-card fixed top-0 w-full z-50 px-4 md:px-6 py-3 flex items-center gap-3 md:gap-6">
        {/* Logo */}
        <Link to="/" className="shrink-0" aria-label="Mains de San Pedro — Accueil">
          {/* Icône seule sur mobile, logo horizontal complet sur desktop */}
          <img
            src="/logo/logo-icone-terracotta.svg"
            alt="Mains de San Pedro"
            className="h-9 w-auto md:hidden"
          />
          <img
            src="/logo/logo-horizontal-terracotta.svg"
            alt="Mains de San Pedro"
            className="hidden md:block h-9 w-auto"
          />
        </Link>

        {/* Search bar — desktop inline */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex flex-1 items-center gap-3 bg-surface-container-low hover:bg-surface-container transition-colors rounded-full px-4 py-2.5 text-left group"
          aria-label="Ouvrir la recherche"
        >
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="flex-1 text-sm text-muted-foreground font-light">
            Rechercher une œuvre, un artisan…
          </span>
          <span
            onClick={(e) => { e.stopPropagation(); setFilterOpen(true); }}
            className="ml-2 px-3 py-1 rounded-full border border-secondary/20 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setFilterOpen(true); }}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Filtres
          </span>
        </button>

        {/* Right icons */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* Mobile-only search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Rechercher"
          >
            <Search className="w-[18px] h-[18px] text-inverse-surface" />
          </button>

          {/* Heart — desktop only */}
          <Link
            to="/mon-espace"
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Favoris"
          >
            <Heart className="w-[18px] h-[18px] text-inverse-surface" />
          </Link>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors relative"
            aria-label={`Panier (${totalItems} articles)`}
          >
            <ShoppingBag className="w-[18px] h-[18px] text-inverse-surface" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* User — desktop only */}
          <Link
            to="/mon-espace"
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Mon espace"
          >
            <User className="w-[18px] h-[18px] text-inverse-surface" />
          </Link>

          {/* Burger — always visible */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-[18px] h-[18px] text-inverse-surface" />
          </button>
        </div>
      </header>

      {/* Overlays / drawers */}
      <NavigationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} />
    </>
  );
};

export default TopNav;
