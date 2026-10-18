import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import JekoPayment from "@/components/JekoPayment";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useAuth, fetchProfile } from "@/hooks/useAuth";

type Step = 1 | 2;

interface CreatedOrder {
  id: string;
  reference: string;
  total: number;
}

const inputClass =
  "bg-surface-container-low rounded-xl px-4 py-3 w-full border-none text-sm outline-none focus:ring-1 focus:ring-primary transition-shadow text-foreground placeholder:text-muted-foreground";
const labelClass = "label-caps text-[10px] text-muted-foreground mb-1 block";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  // "paid" : paiement confirmé ; "offline" : paiement en ligne indisponible
  const [outcome, setOutcome] = useState<"paid" | "offline" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "San Pedro", country: "Côte d'Ivoire",
  });
  const updateField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  // Client connecté : on reprend les informations de son compte
  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then((p) => {
      setForm((prev) => ({
        ...prev,
        name: prev.name || p?.full_name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || p?.phone || "",
        address: prev.address || p?.delivery_address || "",
        city: (prev.city && prev.city !== "San Pedro") ? prev.city : (p?.delivery_city || prev.city),
      }));
    });
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && !order) navigate("/panier");
  }, [items.length, order, navigate]);

  if (items.length === 0 && !order) return null;

  if (order && outcome) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-fade-in">
          <Check className="w-12 h-12 text-primary" />
        </div>
        <h1 className="font-serif text-3xl italic text-inverse-surface mt-6">
          {outcome === "paid" ? "Paiement reçu, merci !" : "Commande enregistrée !"}
        </h1>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{order.reference}</span>
        <p className="font-serif text-2xl text-primary italic mt-6">{order.total.toLocaleString("fr-FR")} FCFA</p>
        <p className="text-sm text-muted-foreground font-light mt-4 max-w-sm leading-relaxed">
          {outcome === "paid"
            ? `Votre paiement est confirmé. Les artisans préparent votre commande avec soin ; l'équipe PACTE vous contacte au ${form.phone} pour la livraison.`
            : `L'équipe PACTE vous contacte au ${form.phone} pour confirmer la livraison et le paiement.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {user && (
            <Link to="/mon-espace" className="h-12 px-8 inline-flex items-center justify-center rounded-full border border-border/40 uppercase tracking-widest text-[0.7rem] font-bold">
              Suivre ma commande
            </Link>
          )}
          <button
            onClick={() => navigate("/")}
            className="h-12 px-8 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const deliveryValid = form.name.trim() && form.phone.replace(/\D/g, "").length >= 8 && form.address.trim();

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    // Le serveur recalcule les prix depuis la base : le panier n'envoie que des identifiants
    const { data, error: rpcError } = await (supabase as any).rpc("creer_commande", {
      p_items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      p_client: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        country: form.country,
        payment_method: "mobile_money",
      },
    });
    setSubmitting(false);
    if (rpcError) {
      setError(
        /plus disponible/.test(rpcError.message)
          ? "Un article de votre panier n'est plus disponible. Retirez-le puis réessayez."
          : /Could not find the function|schema cache|PGRST202/i.test(rpcError.message)
            ? "La commande en ligne ouvre très bientôt. Votre panier est conservé : revenez dans quelques jours."
            : "La commande n'a pas pu être enregistrée. Réessayez dans un instant."
      );
      return;
    }
    setOrder(data as CreatedOrder);
    clearCart();
  };


  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="glass-card fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => (step === 2 && !order ? setStep(1) : navigate(-1))}
          className="flex items-center gap-2 text-inverse-surface"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Retour</span>
        </button>
        <span className="font-serif text-base italic text-inverse-surface tracking-tight">Commande</span>
        <div className="w-16" />
      </header>

      <div className="px-6 pt-24 pb-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          {[{ n: 1, label: "Livraison" }, { n: 2, label: "Paiement" }].map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? "bg-primary text-primary-foreground" : "bg-surface-container text-muted-foreground"}`}>{n}</span>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${step >= n ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
              {i === 0 && <div className="flex-1 h-px bg-surface-container" />}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="px-6 space-y-4 animate-fade-in max-w-xl mx-auto">
          {!user && (
            <p className="text-xs text-muted-foreground bg-surface-container-low rounded-xl p-3">
              Vous avez un compte ? <Link to="/mon-espace" className="text-primary underline underline-offset-4">Connectez-vous</Link> pour
              préremplir vos informations et suivre votre commande.
            </p>
          )}
          <div>
            <label htmlFor="co-name" className={labelClass}>Nom complet</label>
            <input id="co-name" autoComplete="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="co-phone" className={labelClass}>Téléphone</label>
            <div className="flex gap-2">
              <span className="bg-surface-container-low rounded-xl px-3 py-3 text-sm text-muted-foreground shrink-0">+225</span>
              <input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="07 00 00 00 00" className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="co-email" className={labelClass}>E-mail (facultatif)</label>
            <input id="co-email" type="email" autoComplete="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="votre@email.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="co-address" className={labelClass}>Adresse de livraison</label>
            <input id="co-address" autoComplete="street-address" value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Quartier, rue, repère" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="co-city" className={labelClass}>Ville</label>
              <input id="co-city" autoComplete="address-level2" value={form.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="co-country" className={labelClass}>Pays</label>
              <input id="co-country" autoComplete="country-name" value={form.country} onChange={(e) => updateField("country", e.target.value)} className={inputClass} />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!deliveryValid}
            className="w-full h-14 mt-6 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40"
          >
            Continuer →
          </button>
          {!deliveryValid && (
            <p className="text-[11px] text-muted-foreground text-center">Nom, téléphone et adresse sont nécessaires pour la livraison.</p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="px-6 animate-fade-in max-w-xl mx-auto">
          <h2 className="font-serif text-xl italic text-inverse-surface mb-4">Récapitulatif</h2>
          <div className="bg-surface-container-low rounded-bento p-4">
            {(order ? [] : items).map((i) => (
              <div key={i.product.id} className="flex justify-between text-sm text-muted-foreground">
                <span className="truncate pr-3">{i.quantity} × {i.product.name}</span>
                <span className="whitespace-nowrap">{(i.product.price * i.quantity).toLocaleString("fr-FR")} FCFA</span>
              </div>
            ))}
            <div className="bg-border/20 h-px my-3" />
            <div className="flex justify-between items-center">
              <span className="font-serif text-lg text-inverse-surface">Total</span>
              <span className="font-serif text-lg text-primary font-bold">{(order?.total ?? subtotal).toLocaleString("fr-FR")} FCFA</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Frais de livraison confirmés par l'équipe selon votre adresse.</p>
          </div>

          {error && <p className="text-sm text-destructive mt-4" role="alert">{error}</p>}

          {!order ? (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full h-14 mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Valider la commande et payer →
            </button>
          ) : (
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Commande {order.reference} enregistrée
              </p>
              <h2 className="font-serif text-xl italic text-inverse-surface mb-4">Paiement Mobile Money</h2>
              <JekoPayment
                orderId={order.id}
                total={order.total}
                defaultPhone={form.phone}
                onPaid={() => setOutcome("paid")}
                onOffline={() => setOutcome("offline")}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
