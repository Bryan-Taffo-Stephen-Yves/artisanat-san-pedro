import { Home, LayoutGrid, Users, ShoppingBag, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCart } from "@/context/CartContext";

const items = [
  { icon: Home, label: "Accueil", to: "/", end: true },
  { icon: LayoutGrid, label: "Boutique", to: "/boutique", end: false },
  { icon: Users, label: "Artisans", to: "/artisans", end: false },
  { icon: ShoppingBag, label: "Panier", to: "/panier", end: false },
  { icon: User, label: "Compte", to: "/mon-espace", end: false },
];

// Barre d'onglets mobile : navigation à portée de pouce (masquée sur ordinateur)
const BottomNav = () => {
  const { totalItems } = useCart();
  return (
    <nav
      aria-label="Navigation principale"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-ink/10 shadow-[0_-6px_20px_rgba(29,23,18,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-[68px] px-2">
        {items.map(({ icon: Icon, label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 text-[11px] no-underline ${
                isActive ? "text-primary font-semibold" : "text-ink-soft font-medium"
              }`
            }
          >
            <Icon className="w-[22px] h-[22px]" strokeWidth={1.8} aria-hidden="true" />
            {label}
            {to === "/panier" && totalItems > 0 && (
              <span className="absolute top-2 left-1/2 ml-1.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
