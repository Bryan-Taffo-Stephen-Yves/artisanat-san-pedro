import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CalendarPlus, Star, Sparkles, ChevronRight, AlertTriangle, LogOut, Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProductManager from "@/components/ProductManager";
import { useArtisan } from "@/hooks/useArtisans";
import { useArtisanAllProducts } from "@/hooks/useProducts";

interface ArtisanSession {
  id: string;
  slug: string;
  name: string;
}

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
  const { data: products = [], refetch } = useArtisanAllProducts(session?.id);

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

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  const monthName = now.toLocaleDateString("fr-FR", { month: "long" });

  const online = products.filter((p) => p.published).length;
  const pending = products.filter((p) => p.status === "pending").length;
  const addedThisMonth = products.filter((p) => new Date(p.created_at).getTime() >= monthStart).length;
  const lowStock = products.filter((p) => p.published && p.stock <= 2);

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
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] uppercase tracking-widest">
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

      {/* Rappel du mois : rien de publié ce mois-ci */}
      {addedThisMonth === 0 && (
        <div className="px-6 mt-4">
          <div className="rounded-2xl p-5 bg-[#1A120C] text-white" role="status">
            <div className="flex items-start gap-3">
              <CalendarPlus className="w-7 h-7 text-[#E8A27C] shrink-0" strokeWidth={1.6} />
              <div>
                <p className="font-serif text-xl italic">Nouvelle création en {monthName} ?</p>
                <p className="text-sm text-white/75 mt-1 leading-relaxed">
                  Vous n'avez encore rien ajouté ce mois-ci. Les clients reviennent voir les
                  nouveautés : ajoutez au moins une pièce
                  {daysLeft > 0 ? ` (il reste ${daysLeft} jour${daysLeft > 1 ? "s" : ""})` : " (dernier jour du mois)"}.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/espace-artisan/ia-studio")}
              className="mt-4 w-full h-14 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-white inline-flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest active:scale-[0.98] transition-transform"
            >
              <Plus className="w-5 h-5" /> Ajouter une création
            </button>
          </div>
        </div>
      )}

      {/* Chiffres réels */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-3">
        {[
          { icon: Package, value: online, label: "En ligne", bg: "bg-surface-container-low", iconColor: "text-primary" },
          { icon: Clock, value: pending, label: "En validation", bg: "bg-[#F6E7DD]", iconColor: "text-[#A55427]" },
          { icon: CalendarPlus, value: addedThisMonth, label: `Ajoutés en ${monthName}`, bg: "bg-[#F6E7E0]", iconColor: "text-[#864521]" },
          { icon: Star, value: displayRating || "—", label: "Note globale", bg: "bg-surface-container-low", iconColor: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} p-5 rounded-xl`}>
            <stat.icon className={`w-5 h-5 mb-2 ${stat.iconColor}`} />
            <p className="font-serif text-3xl text-foreground">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {pending > 0 && (
        <p className="px-6 mt-3 text-xs text-muted-foreground">
          {pending} création(s) en cours de vérification par l'équipe PACTE : elles apparaîtront sur le site dès leur validation.
        </p>
      )}

      {/* Stock faible */}
      {lowStock.length > 0 && (
        <div className="px-6 mt-6">
          <div className="bg-[#F6E7E0] p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#864521] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#864521] text-sm">Stock faible</p>
              <p className="text-xs text-[#864521]/80 mt-0.5">
                {lowStock.length} produit(s) bientôt épuisé(s) : {lowStock.slice(0, 3).map((p) => p.name).join(", ")}
                {lowStock.length > 3 ? "…" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ajouter un produit (Studio IA) */}
      <div className="px-6 mt-6">
        <button
          onClick={() => navigate("/espace-artisan/ia-studio")}
          className="w-full bg-gradient-to-br from-terracotta to-terracotta-light text-white p-5 rounded-xl flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div className="text-left">
              <p className="font-serif text-lg italic">Ajouter une création</p>
              <p className="text-xs text-white/80">Photo, prix, et l'IA écrit la description</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mes produits : modification, photos, suppression, statut de validation */}
      <div className="px-6 mt-8 pb-32">
        <ProductManager artisanId={session.id} title="Mes créations" onChange={() => refetch()} />
      </div>
    </AppShell>
  );
};

export default ArtisanDashboardPage;
