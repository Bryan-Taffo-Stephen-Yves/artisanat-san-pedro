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
  "h-[54px] px-4 w-full rounded-[14px] border border-ink/[0.14] bg-white text-base text-ink outline-none focus:border-primary transition-colors placeholder:text-ink-muted";
const labelClass = "text-sm font-semibold text-ink mb-1.5 block";

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
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-20 text-center">
        <span className="w-24 h-24 rounded-full bg-pacte-tint grid place-items-center animate-fade-in">
          <Check className="w-11 h-11 text-pacte" strokeWidth={2.2} />
        </span>
        <h1 className="text-[28px] md:text-4xl leading-tight mt-7">
          {outcome === "paid" ? "Paiement reçu, merci !" : "Commande enregistrée !"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Référence {order.reference}</p>
        <p className="text-2xl font-bold mt-5">{order.total.toLocaleString("fr-FR")} FCFA</p>
        <p className="text-base text-ink-soft mt-4 max-w-sm leading-relaxed">
          {outcome === "paid"
            ? `Votre paiement est confirmé. Les artisans préparent votre commande avec soin ; l'équipe PACTE vous contacte au ${form.phone} pour la livraison.`
            : `L'équipe PACTE vous contacte au ${form.phone} pour confirmer la livraison et le paiement.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto">
          {user && (
            <Link to="/mon-espace" className="h-[54px] px-8 inline-flex items-center justify-center rounded-full border border-ink/[0.18] bg-white text-base font-semibold">
              Suivre ma commande
            </Link>
          )}
          <button
            onClick={() => navigate("/")}
            className="h-[54px] px-8 rounded-full bg-primary hover:bg-[#8E4219] text-white text-base font-semibold active:scale-[0.98] transition"
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
    <div className="min-h-screen bg-paper pb-10">
      <header className="sticky top-0 z-50 bg-paper/95 border-b border-ink/[0.08]">
        <div className="max-w-xl mx-auto h-16 px-4 grid grid-cols-[1fr_auto_1fr] items-center">
          <button
            onClick={() => (step === 2 && !order ? setStep(1) : navigate(-1))}
            className="justify-self-start inline-flex items-center gap-2 h-11 -ml-2 px-2 rounded-full text-[15px] font-semibold"
          >
            <ArrowLeft className="w-[18px] h-[18px]" /> Retour
          </button>
          <span className="text-[17px] font-semibold">Commande</span>
          <span />
        </div>
      </header>

      <div className="px-4 pt-6 pb-6 max-w-xl mx-auto">
        <ol className="flex items-center gap-3" aria-label="Étapes de la commande">
          {[{ n: 1, label: "Livraison" }, { n: 2, label: "Paiement" }].map(({ n, label }, i) => (
            <li key={n} className="flex items-center gap-2.5 flex-1 last:flex-none" aria-current={step === n ? "step" : undefined}>
              <span className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold ${step >= n ? "bg-primary text-white" : "bg-sand text-ink-soft"}`}>
                {step > n ? <Check className="w-4 h-4" strokeWidth={2.4} /> : n}
              </span>
              <span className={`text-[15px] font-semibold ${step >= n ? "text-ink" : "text-ink-muted"}`}>{label}</span>
              {i === 0 && <span className="flex-1 h-px bg-ink/[0.12]" />}
            </li>
          ))}
        </ol>
      </div>

      {step === 1 && (
        <div className="px-4 space-y-4 animate-fade-in max-w-xl mx-auto">
          <h1 className="text-[28px] leading-tight mb-2">Où livrer votre commande ?</h1>
          {!user && (
            <p className="text-sm text-ink-soft bg-sand rounded-2xl p-3.5 leading-normal">
              Vous avez un compte ? <Link to="/mon-espace" className="text-primary font-semibold underline underline-offset-4">Connectez-vous</Link> pour
              préremplir vos informations et suivre votre commande.
            </p>
          )}
          <div>
            <label htmlFor="co-name" className={labelClass}>Nom complet</label>
            <input id="co-name" autoComplete="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="co-phone" className={labelClass}>Téléphone</label>
            <div className="h-[54px] px-4 rounded-[14px] border border-ink/[0.14] bg-white flex items-center gap-2.5 focus-within:border-primary">
              <span className="text-[15px] text-ink-muted shrink-0">+225</span>
              <input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="07 00 00 00 00" className="flex-1 min-w-0 bg-transparent border-0 outline-none text-base text-ink placeholder:text-ink-muted" />
            </div>
          </div>
          <div>
            <label htmlFor="co-email" className={labelClass}>E-mail <span className="font-normal text-ink-muted">(facultatif)</span></label>
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
            className="w-full h-[58px] mt-4 rounded-full bg-primary hover:bg-[#8E4219] text-white text-[17px] font-semibold active:scale-[0.98] transition disabled:opacity-40"
          >
            Continuer vers le paiement
          </button>
          {!deliveryValid && (
            <p className="text-[13px] text-ink-soft text-center">Nom, téléphone et adresse sont nécessaires pour la livraison.</p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="px-4 animate-fade-in max-w-xl mx-auto">
          <h1 className="text-[28px] leading-tight mb-4">Récapitulatif</h1>
          <div className="bg-white rounded-[18px] border border-ink/[0.08] p-4 md:p-5">
            {(order ? [] : items).map((i) => (
              <div key={i.product.id} className="flex justify-between gap-3 py-1.5 text-[15px] text-ink-soft">
                <span className="truncate">{i.quantity} × {i.product.name}</span>
                <span className="whitespace-nowrap">{(i.product.price * i.quantity).toLocaleString("fr-FR")} FCFA</span>
              </div>
            ))}
            {!order && <div className="bg-ink/[0.08] h-px my-3" />}
            <div className="flex justify-between items-baseline">
              <span className="text-[17px] font-semibold">Total</span>
              <span className="text-xl font-bold">{(order?.total ?? subtotal).toLocaleString("fr-FR")} FCFA</span>
            </div>
            <p className="text-[13px] text-ink-soft mt-2">Frais de livraison confirmés par l'équipe selon votre adresse.</p>
          </div>

          {error && <p className="text-sm text-destructive mt-4" role="alert">{error}</p>}

          {!order ? (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full h-[58px] mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-[#8E4219] text-white text-[17px] font-semibold active:scale-[0.98] transition disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Valider la commande et payer
            </button>
          ) : (
            <div className="mt-8">
              <p className="text-sm text-ink-soft mb-1">Commande {order.reference} enregistrée</p>
              <h2 className="text-xl font-semibold mb-4">Payer avec Mobile Money</h2>
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
