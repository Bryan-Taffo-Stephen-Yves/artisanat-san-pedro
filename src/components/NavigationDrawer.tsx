import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Home, ShoppingBag, Users, Compass, User, Palette, Info, Mail, Shield } from "lucide-react";
import { HoverShuffle } from "@/components/ui/HoverShuffle";

const navLinks = [
  { label: "Accueil", path: "/", icon: Home },
  { label: "Boutique", path: "/boutique", icon: ShoppingBag },
  { label: "Artisans", path: "/artisans", icon: Users },
  { label: "Découverte", path: "/decouverte", icon: Compass },
  { label: "Mon Espace", path: "/mon-espace", icon: User },
  { label: "Espace Artisan", path: "/espace-artisan", icon: Palette },
  { label: "À propos", path: "/a-propos", icon: Info },
  { label: "Contact", path: "/contact", icon: Mail },
  { label: "Admin", path: "/admin", icon: Shield, admin: true },
] as const;

const paymentBadges = ["Wave", "Orange Money", "MTN MoMo", "Stripe", "PayPal"];

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationDrawer = ({ isOpen, onClose }: NavigationDrawerProps) => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  if (!isOpen && !visible) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-inverse-surface/90 backdrop-blur-xl transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`absolute inset-0 flex flex-col px-6 py-8 transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link to="/" onClick={onClose} className="font-serif text-2xl italic text-primary-foreground hover:text-primary transition-colors">
              Mains de San Pedro
            </Link>
            <p className="text-[10px] uppercase tracking-widest text-primary-foreground/50 mt-1">
              Programme PACTE · Côte d'Ivoire
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary-foreground/10 transition-colors"
          >
            <X className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-10 space-y-0 flex-1">
          {navLinks.map((link, i) => {
            const isActive = location.pathname === link.path;
            const isAdmin = "admin" in link && link.admin;
            return (
              <div
                key={link.path}
                className="transition-all duration-300 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-20px)",
                  transitionDelay: visible ? `${100 + i * 50}ms` : "0ms",
                }}
              >
                {isAdmin && <div className="h-px bg-primary-foreground/10 my-2" />}
                <Link
                  to={link.path}
                  className={`py-4 px-2 flex items-center justify-between transition-colors ${
                    isAdmin
                      ? "text-primary"
                      : isActive
                        ? "text-primary"
                        : "text-primary-foreground hover:text-primary"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <link.icon className="w-5 h-5" />
                    <HoverShuffle text={link.label.toUpperCase()} className="font-serif text-xl italic" />
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </Link>
                {i < navLinks.length - 1 && !isAdmin && (
                  <div className="h-px bg-primary-foreground/10" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Payment badges */}
        <div className="flex gap-2 flex-wrap justify-center pt-6">
          {paymentBadges.map((m) => (
            <span
              key={m}
              className="glass-card text-primary-foreground/60 text-[9px] uppercase px-3 py-1 rounded-full"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationDrawer;
