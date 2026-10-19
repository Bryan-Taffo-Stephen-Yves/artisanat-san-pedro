import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CalendarPlus, AlertTriangle, LogOut, Check } from "lucide-react";
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
        <div className="px-4 pt-16 flex items-center justify-center">
          <p className="text-ink-soft">Chargement…</p>
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
  const firstName = displayName.split(" ")[0];
  const displayMetier = artisan?.metier || "";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[28px] md:text-4xl leading-tight">Bonjour, {firstName}</h1>
            {displayMetier && <p className="mt-1 text-base text-ink-soft">{displayMetier}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-full border border-ink/[0.14] bg-white text-[15px] font-semibold text-ink-soft hover:text-destructive hover:border-destructive/40 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Quitter
          </button>
        </div>

        {/* Rappel du mois */}
        {addedThisMonth === 0 ? (
          <div className="mt-6 rounded-[22px] p-5 md:p-6 bg-ink text-white" role="status">
            <div className="flex items-start gap-3.5">
              <span className="w-11 h-11 shrink-0 rounded-full bg-white/10 grid place-items-center">
                <CalendarPlus className="w-5 h-5 text-[#F2B48C]" strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-xl font-semibold leading-snug">Une nouvelle création en {monthName} ?</p>
                <p className="text-[15px] text-white/75 mt-1.5 leading-relaxed">
                  Rien d'ajouté ce mois-ci. Les clients reviennent voir les nouveautés : ajoutez au moins une pièce
                  {daysLeft > 0 ? ` (il reste ${daysLeft} jour${daysLeft > 1 ? "s" : ""}).` : " (dernier jour du mois)."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-pacte-ink bg-pacte-tint px-3.5 py-2 rounded-full">
            <Check className="w-4 h-4" strokeWidth={2.4} />
            {addedThisMonth} création{addedThisMonth > 1 ? "s" : ""} ajoutée{addedThisMonth > 1 ? "s" : ""} en {monthName}
          </p>
        )}

        {/* Action principale : une photo suffit */}
        <button
          onClick={() => navigate("/espace-artisan/ia-studio")}
          className="mt-4 w-full min-h-[88px] rounded-[22px] bg-primary hover:bg-[#8E4219] text-white px-5 py-4 flex items-center gap-4 text-left active:scale-[0.99] transition"
        >
          <span className="w-14 h-14 shrink-0 rounded-full bg-white/15 grid place-items-center">
            <Camera className="w-7 h-7" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-xl font-semibold">Ajouter une création</span>
            <span className="block text-[15px] text-white/85 mt-0.5">Une photo et un prix, l'assistant écrit la description</span>
          </span>
        </button>

        {/* Chiffres réels */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[18px] bg-white border border-ink/[0.08] p-4">
            <p className="text-[32px] font-bold leading-none">{online}</p>
            <p className="mt-2 text-[15px] text-ink-soft">En ligne</p>
          </div>
          <div className="rounded-[18px] bg-white border border-ink/[0.08] p-4">
            <p className="text-[32px] font-bold leading-none">{pending}</p>
            <p className="mt-2 text-[15px] text-ink-soft">En validation</p>
          </div>
        </div>
        {pending > 0 && (
          <p className="mt-3 text-sm text-ink-soft leading-normal">
            L'équipe PACTE vérifie vos nouvelles créations : elles apparaissent sur le site dès leur validation.
          </p>
        )}

        {/* Stock faible */}
        {lowStock.length > 0 && (
          <div className="mt-4 bg-amber-tint p-4 rounded-[18px] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-ink shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-ink text-[15px]">Bientôt épuisé</p>
              <p className="text-sm text-amber-ink mt-0.5">
                {lowStock.slice(0, 3).map((p) => p.name).join(", ")}
                {lowStock.length > 3 ? ` et ${lowStock.length - 3} autre(s)` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Mes créations : statut, photos, modification */}
        <div className="mt-10">
          <ProductManager artisanId={session.id} title="Mes créations" onChange={() => refetch()} />
        </div>
      </div>
    </AppShell>
  );
};

export default ArtisanDashboardPage;
