import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import AppShell from "@/components/AppShell";
import JekoPayment from "@/components/JekoPayment";
import { jeko, PAID_STATUSES } from "@/lib/jeko";
import { useAuth, fetchProfile } from "@/hooks/useAuth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHECK_MS = 3000;
const CHECK_LIMIT = 40; // environ 2 minutes de vérification au retour de l'opérateur

type View = "checking" | "paid" | "pay" | "pending" | "offline" | "invalid";

// Retour de Wave / Orange / Djamo après paiement, ou reprise du paiement d'une
// commande en attente. La redirection n'est pas une preuve : on vérifie auprès de Jèko.
const PaymentReturnPage = () => {
  const [params] = useSearchParams();
  const orderId = params.get("commande") ?? "";
  const cameBackFromOperator = params.has("issue");
  const { user } = useAuth();
  const [view, setView] = useState<View>(UUID.test(orderId) ? "checking" : "invalid");
  const [info, setInfo] = useState<{ reference?: string; total?: number }>({});
  const [phone, setPhone] = useState("");
  const tries = useRef(0);

  useEffect(() => {
    if (user) fetchProfile(user.id).then((p) => p?.phone && setPhone(p.phone));
  }, [user]);

  useEffect(() => {
    if (!UUID.test(orderId)) return;
    let timer: number | undefined;
    let stopped = false;

    const check = async () => {
      const res = await jeko.status(orderId);
      if (stopped) return;
      if (res.offline) {
        setView("offline");
        return;
      }
      if (res.error && !res.status) {
        setView("invalid");
        return;
      }
      setInfo({ reference: (res as any).reference, total: (res as any).total });
      if (res.status && PAID_STATUSES.includes(res.status)) {
        setView("paid");
        return;
      }
      if (res.status === "failed" || !cameBackFromOperator) {
        setView("pay");
        return;
      }
      // Retour de l'opérateur : la confirmation peut prendre quelques secondes
      tries.current += 1;
      if (tries.current >= CHECK_LIMIT) {
        setView("pending");
        return;
      }
      timer = window.setTimeout(check, CHECK_MS);
    };
    check();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [orderId, cameBackFromOperator]);

  return (
    <AppShell>
      <div className="px-6 pt-28 pb-20 max-w-md mx-auto">
        {view === "checking" && (
          <div className="text-center py-16" role="status" aria-live="polite">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="font-serif text-2xl italic mt-6">Vérification du paiement…</p>
            <p className="text-sm text-muted-foreground mt-2">Cela prend généralement quelques secondes.</p>
          </div>
        )}

        {view === "paid" && (
          <div className="text-center py-10">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-serif text-3xl italic mt-6">Paiement reçu, merci !</h1>
            {info.reference && <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{info.reference}</p>}
            {info.total != null && <p className="font-serif text-2xl text-primary italic mt-4">{info.total.toLocaleString("fr-FR")} FCFA</p>}
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Les artisans préparent votre commande. L'équipe PACTE vous contacte pour la livraison.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              {user && (
                <Link to="/mon-espace" className="h-12 inline-flex items-center justify-center rounded-full border border-border/40 uppercase tracking-widest text-[0.7rem] font-bold">
                  Voir mes commandes
                </Link>
              )}
              <Link to="/boutique" className="h-12 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground uppercase tracking-widest text-[0.7rem] font-bold">
                Continuer mes achats
              </Link>
            </div>
          </div>
        )}

        {view === "pay" && (
          <div>
            {cameBackFromOperator && (
              <p className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 rounded-xl p-3 mb-6" role="alert">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                Le paiement n'a pas abouti. Vous pouvez réessayer, avec le même opérateur ou un autre.
              </p>
            )}
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Commande {info.reference}</p>
            <h1 className="font-serif text-3xl italic mt-1 mb-6">Payer ma commande</h1>
            {info.total != null && (
              <JekoPayment
                orderId={orderId}
                total={info.total}
                defaultPhone={phone}
                onPaid={() => setView("paid")}
                onOffline={() => setView("offline")}
              />
            )}
          </div>
        )}

        {view === "pending" && (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 text-primary mx-auto" />
            <h1 className="font-serif text-2xl italic mt-6">Paiement en cours de confirmation</h1>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              L'opérateur n'a pas encore confirmé. Si vous avez validé le paiement, la commande passera
              automatiquement en « payée » dans quelques minutes. Sinon, vous pouvez réessayer.
            </p>
            <button
              onClick={() => setView("pay")}
              className="mt-6 h-12 px-8 rounded-full border border-border/40 uppercase tracking-widest text-[0.7rem] font-bold"
            >
              Réessayer le paiement
            </button>
          </div>
        )}

        {view === "offline" && (
          <div className="text-center py-10">
            <h1 className="font-serif text-2xl italic">Commande enregistrée</h1>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Le paiement en ligne est momentanément indisponible. L'équipe PACTE vous contacte pour le règlement.
            </p>
            <Link to="/" className="mt-6 inline-flex h-12 px-8 items-center rounded-full border border-border/40 uppercase tracking-widest text-[0.7rem] font-bold">
              Retour à l'accueil
            </Link>
          </div>
        )}

        {view === "invalid" && (
          <div className="text-center py-16">
            <p className="font-serif text-2xl italic text-muted-foreground">Commande introuvable</p>
            <Link to="/boutique" className="mt-6 inline-flex h-12 px-8 items-center rounded-full border border-border/40 uppercase tracking-widest text-[0.7rem] font-bold">
              Aller à la boutique
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default PaymentReturnPage;
