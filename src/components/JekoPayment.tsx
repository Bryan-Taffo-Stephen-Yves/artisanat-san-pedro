import { useEffect, useRef, useState } from "react";
import { Loader2, Smartphone, ShieldCheck, RotateCcw } from "lucide-react";
import { JEKO_METHODS, PAID_STATUSES, guessMethod, isValidCiMobile, jeko, type JekoMethod } from "@/lib/jeko";

interface Props {
  orderId: string;
  total: number;
  defaultPhone?: string;
  onPaid: () => void;
  // Paiement en ligne non configuré : la commande reste enregistrée
  onOffline: () => void;
}

const POLL_MS = 4000;
const WAIT_LIMIT_MS = 3 * 60 * 1000;

// Paiement Jèko en "API direct" : l'opérateur est appelé directement avec le
// numéro du client, sans formulaire de paiement intermédiaire.
const JekoPayment = ({ orderId, total, defaultPhone = "", onPaid, onOffline }: Props) => {
  const [phone, setPhone] = useState(defaultPhone);
  const [method, setMethod] = useState<JekoMethod>(() => guessMethod(defaultPhone) ?? "wave");
  const [state, setState] = useState<"idle" | "sending" | "waiting" | "slow">("idle");
  const [error, setError] = useState<string | null>(null);
  const timers = useRef<{ poll?: number; limit?: number }>({});

  const stopTimers = () => {
    window.clearInterval(timers.current.poll);
    window.clearTimeout(timers.current.limit);
  };
  useEffect(() => stopTimers, []);

  // Numéro du compte prérempli : on propose l'opérateur correspondant
  useEffect(() => {
    if (defaultPhone && !phone) {
      setPhone(defaultPhone);
      const m = guessMethod(defaultPhone);
      if (m) setMethod(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultPhone]);

  const current = JEKO_METHODS.find((m) => m.id === method)!;
  const digits = phone.replace(/\D/g, "").replace(/^225(?=\d{10}$)/, "");
  const prefixMismatch = !!current.prefix && digits.length >= 2 && !digits.startsWith(current.prefix);
  const canPay = isValidCiMobile(phone) && !prefixMismatch && state === "idle";

  const waitForPayment = () => {
    setState("waiting");
    timers.current.poll = window.setInterval(async () => {
      const res = await jeko.status(orderId);
      if (res.status && PAID_STATUSES.includes(res.status)) {
        stopTimers();
        onPaid();
      } else if (res.status === "failed") {
        stopTimers();
        setState("idle");
        setError("Le paiement n'a pas abouti (refusé ou annulé). Vous pouvez réessayer.");
      }
    }, POLL_MS);
    timers.current.limit = window.setTimeout(() => setState("slow"), WAIT_LIMIT_MS);
  };

  const pay = async () => {
    setError(null);
    setState("sending");
    const res = await jeko.pay(orderId, method, phone);
    if (res.offline) {
      setState("idle");
      onOffline();
      return;
    }
    if (res.status === "already_paid") {
      onPaid();
      return;
    }
    if (res.error || !res.mode) {
      setState("idle");
      setError(res.error ?? "Le paiement n'a pas pu être lancé.");
      return;
    }
    if (res.mode === "redirect" && res.redirectUrl) {
      // Wave, Orange, Djamo : validation dans l'application ou la page de l'opérateur
      window.location.href = res.redirectUrl;
      return;
    }
    // MTN, Moov : demande de code envoyée sur le téléphone (USSD)
    waitForPayment();
  };

  if (state === "waiting" || state === "slow") {
    return (
      <div className="rounded-bento border border-primary/30 bg-primary/5 p-6 text-center" role="status" aria-live="polite">
        <Smartphone className="w-10 h-10 text-primary mx-auto" strokeWidth={1.5} />
        <p className="font-serif text-xl italic mt-3">Validez sur votre téléphone</p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Une demande de paiement {current.label} de <strong>{total.toLocaleString("fr-FR")} FCFA</strong> a été envoyée au{" "}
          <strong>{phone}</strong>. Saisissez votre code secret pour confirmer.
        </p>
        {state === "waiting" ? (
          <p className="inline-flex items-center gap-2 text-xs text-muted-foreground mt-5">
            <Loader2 className="w-4 h-4 animate-spin" /> En attente de votre confirmation…
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-muted-foreground">
              Rien reçu ? Vérifiez que le téléphone est allumé et a du réseau. La demande reste valable 30 minutes.
            </p>
            <button
              onClick={() => { stopTimers(); setState("idle"); }}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-border/40 text-[10px] uppercase tracking-widest font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Changer de moyen de paiement
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Opérateur Mobile Money">
        {JEKO_METHODS.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={method === m.id}
            onClick={() => { setMethod(m.id); setError(null); }}
            className={`rounded-xl p-3 text-left border transition-colors ${method === m.id ? "border-2 border-primary bg-primary/5" : "border-border/30 bg-background"}`}
          >
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
              <span className="text-sm font-bold">{m.label}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">{current.hint}</p>

      <div>
        <label htmlFor="payer-phone" className="label-caps text-[10px] text-muted-foreground mb-1 block">
          Numéro qui paie {defaultPhone && "(celui de votre compte, modifiable)"}
        </label>
        <div className="flex gap-2">
          <span className="bg-surface-container-low rounded-xl px-3 py-3 text-sm text-muted-foreground shrink-0">+225</span>
          <input
            id="payer-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(null); }}
            placeholder={current.prefix ? `${current.prefix} 00 00 00 00` : "07 00 00 00 00"}
            className="bg-surface-container-low rounded-xl px-4 py-3 w-full border-none text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {prefixMismatch && (
          <p className="text-xs text-amber-700 mt-1.5">Un numéro {current.label} commence par {current.prefix}.</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <button
        onClick={pay}
        disabled={!canPay}
        className="w-full h-14 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition disabled:opacity-40"
      >
        {state === "sending" && <Loader2 className="w-4 h-4 animate-spin" />}
        Payer {total.toLocaleString("fr-FR")} FCFA avec {current.label}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5" /> Paiement sécurisé par Jèko · aucun code n'est saisi sur ce site
      </p>
    </div>
  );
};

export default JekoPayment;
