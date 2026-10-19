import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Search, ShoppingBag, User } from "lucide-react";
import SearchOverlay from "@/components/SearchOverlay";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";

const links = [
  { to: "/boutique", label: "Boutique" },
  { to: "/artisans", label: "Artisans" },
  { to: "/decouverte", label: "Découverte" },
  { to: "/a-propos", label: "Le projet" },
];

// En-tête de la charte : fond papier plein, filet en bas, pas d'effet de verre.
const TopNav = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <>
      <header className="sticky top-0 z-50 bg-paper/95 border-b border-ink/[0.08] backdrop-saturate-150">
        <div className="max-w-[1280px] mx-auto h-16 md:h-[76px] px-4 md:px-12 flex items-center gap-4 md:gap-8">
          <Link to="/" className="shrink-0" aria-label="Mains de San Pedro, accueil">
            <img
              src="/logo/logo-horizontal-terracotta.svg"
              alt="Mains de San Pedro"
              className="h-9 md:h-11 w-auto"
            />
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-7 text-[15px] font-medium">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-ink no-underline underline-offset-8 decoration-2 decoration-terracotta-bright hover:underline ${isActive ? "underline" : ""}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex flex-1 items-center gap-3 h-11 px-[18px] rounded-full bg-white border border-ink/[0.12] text-ink-muted text-[15px] hover:border-ink/25 transition-colors"
            aria-label="Rechercher une œuvre, un artisan, un métier"
          >
            <Search className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
            <span className="truncate">Rechercher une œuvre, un artisan, un métier…</span>
          </button>

          <div className="flex items-center gap-1 ml-auto md:ml-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden w-11 h-11 grid place-items-center rounded-full text-ink hover:bg-ink/5"
              aria-label="Rechercher"
            >
              <Search className="w-[22px] h-[22px]" strokeWidth={1.8} />
            </button>
            <Link
              to="/mon-espace"
              className="hidden md:grid w-11 h-11 place-items-center rounded-full text-ink hover:bg-ink/5"
              aria-label="Mon compte"
            >
              <User className="w-[22px] h-[22px]" strokeWidth={1.8} />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-11 h-11 grid place-items-center rounded-full text-ink hover:bg-ink/5"
              aria-label={`Panier, ${totalItems} article${totalItems > 1 ? "s" : ""}`}
            >
              <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.8} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-[5px] rounded-full bg-primary text-white text-[11px] font-bold grid place-items-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default TopNav;
