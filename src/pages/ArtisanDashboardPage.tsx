import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Eye, ShoppingCart, Star, Sparkles, ChevronRight, AlertTriangle, Check, LogOut } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProductManager from "@/components/ProductManager";
import { useArtisan } from "@/hooks/useArtisans";
import { useProductsByArtisan } from "@/hooks/useProducts";

interface ArtisanSession {
  id: string;
  slug: string;
  name: string;
}

const mockOrders = [
  { id: "#SP-9402", client: "Chloé Martin", initials: "CM", amount: 45000, status: "pending" as const },
  { id: "#SP-8731", client: "Jean Dupont", initials: "JD", amount: 32000, status: "shipped" as const },
  { id: "#SP-7615", client: "Marie Koné", initials: "MK", amount: 18500, status: "pending" as const },
];

const ArtisanDashboardPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<ArtisanSession | null>(null);
  const [checked, setChecked] = useState(false);

  // Vérifie la session au chargement
  useEffect(() => {
    const stored = sessionStorage.getItem("artisan_connecte");
    if (!stored) {
      navigate("/espace-artisan/login");
      return;
    }
    try {
      setSession(JSON.parse(stored));
    } catch {
      navigate("/espace-artisan/login");
    }
    setChecked(true);
  }, [navigate]);

  const { data: artisan } = useArtisan(session?.slug);
  const { data: artisanProducts = [] } = useProductsByArtisan(session?.id);

  const handleLogout = () => {
    sessionStorage.removeItem("artisan_connecte");
    navigate("/espace-artisan/login");
  };

  // Tant qu'on n'a pas vérifié la session
  if (!checked || !session) {
    return (
      <AppShell>
        <div className="px-6 pt-24 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </AppShell>
    );
  }

  const lowStockProducts = artisanProducts.filter((p) => p.stock <= 2);
  const displayName = artisan?.name || session.name;
  const displayMetier = artisan?.metier || "";
  const displayRating = artisan?.rating || 0;

  return (
    <AppShell>
      {/* Header */}
      <div className="px-6 pt-24 pb-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">TABLEAU DE BORD</p>
          <h1 className="font-serif text-3xl italic text-foreground">{displayName}</h1>
          {displayMetier && (
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] uppercase tracking-widest backdrop-blur-sm">
              {displayMetier}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container-low text-muted-foreground text-[10px] uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Quitter
        </button>
      </div>

      {/* Stats Bento */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-3">
        {[
          { icon: Package, value: artisanProducts.length.toString(), label: "Total Produits", bg: "bg-surface-container-low", iconColor: "text-primary" },
          { icon: Eye, value: "1,2k", label: "Vues (mois)", bg: "bg-[#F6E7DD]", iconColor: "text-[#A55427]" },
          { icon: ShoppingCart, value: "8", label: "Commandes", bg: "bg-[#F6E7E0]", iconColor: "text-[#864521]" },
          { icon: Star, value: displayRating.toString(), label: "Note Globale", bg: "bg-surface-container-low", iconColor: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} p-5 rounded-xl`}>
            <stat.icon className={`w-5 h-5 mb-2 ${stat.iconColor}`} />
            <p className="font-serif text-3xl text-foreground">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="px-6 mt-6">
          <div className="bg-[#F6E7E0] p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#864521] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#864521] text-sm">Stock faible</p>
              <p className="text-xs text-[#864521]/80 mt-0.5">
                {lowStockProducts.length} produit(s) bientôt épuisé(s).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* IA Studio CTA */}
      <div className="px-6 mt-6">
        <button
          onClick={() => navigate("/espace-artisan/ia-studio")}
          className="w-full bg-gradient-to-br from-terracotta to-terracotta-light text-white p-5 rounded-xl flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div className="text-left">
              <p className="font-serif text-lg italic">Studio IA</p>
              <p className="text-xs text-white/80">Améliore tes photos et descriptions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mes Produits */}
      <div className="px-6 mt-8">
        <h2 className="font-serif text-xl italic text-foreground mb-4">Mes Créations</h2>
        {artisanProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun produit pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {artisanProducts.map((p) => (
              <div key={p.id} className="bg-surface-container-low rounded-xl overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "#E8E0D5" }}>
                      <span className="font-serif italic text-xs text-muted-foreground">{p.category}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-serif text-sm text-foreground line-clamp-1">{p.name}</p>
                  <p className="font-serif text-primary text-sm mt-0.5">{p.price.toLocaleString("fr-FR")} FCFA</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commandes récentes */}
      <div className="px-6 mt-8 pb-32">
        <h2 className="font-serif text-xl italic text-foreground mb-4">Commandes récentes</h2>
        <div className="space-y-3">
          {mockOrders.map((order) => (
            <div key={order.id} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xs font-bold">{order.initials}</span>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium">{order.client}</p>
                  <p className="text-[10px] text-muted-foreground">{order.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif text-foreground">{order.amount.toLocaleString("fr-FR")} F</p>
                <span className={`text-[9px] uppercase tracking-widest ${order.status === "pending" ? "text-[#864521]" : "text-[#A55427]"}`}>
                  {order.status === "pending" ? "En attente" : "Expédiée"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default ArtisanDashboardPage;
