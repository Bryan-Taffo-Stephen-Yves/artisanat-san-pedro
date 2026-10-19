import { useEffect, useRef, useState } from "react";
import { Loader2, Smartphone, ShieldCheck, RotateCcw, Check } from "lucide-react";
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
      <div className="py-6 flex flex-col items-center text-center" role="status" aria-live="polite">
        <span className="w-28 h-28 rounded-full bg-[#FFF4D6] grid place-items-center shadow-[0_0_0_14px_rgba(255,203,5,0.12)]">
          <Smartphone className="w-12 h-12 text-ink" strokeWidth={1.5} />
        </span>
        <p className="mt-9 text-[28px] leading-tight tracking-[-0.03em] font-[650]">Validez sur votre téléphone</p>
        <p className="mt-4 text-base md:text-[17px] leading-relaxed text-[#3F352E] max-w-sm">
          Une demande de paiement {current.label} de <strong className="font-bold">{total.toLocaleString("fr-FR")} FCFA</strong> vient
          d'être envoyée au <strong className="font-bold">{phone}</strong>. Tapez votre code secret pour confirmer.
        </p>
        {state === "waiting" ? (
          <p className="mt-7 inline-flex items-center gap-2.5 h-11 px-[18px] rounded-full bg-white border border-ink/10 text-[15px] text-ink-soft">
            <Loader2 className="w-[18px] h-[18px] text-primary animate-spin" /> En attente de votre confirmation
          </p>
        ) : (
          <p className="mt-7 text-[15px] font-semibold text-amber-ink">Toujours rien ? Pas d'inquiétude.</p>
        )}
        <p className="mt-6 w-full p-3.5 rounded-2xl bg-sand text-sm leading-normal text-[#3F352E] text-left">
          Rien reçu ? Vérifiez que le téléphone est allumé et capte le réseau. La demande reste valable 30 minutes.
        </p>
        <button
          onClick={() => { stopTimers(); setState("idle"); }}
          className="mt-3.5 w-full h-[54px] rounded-full border border-ink/[0.18] bg-white text-base font-semibold inline-flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Changer de moyen de paiement
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Opérateur Mobile Money">
        {JEKO_METHODS.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={method === m.id}
            onClick={() => { setMethod(m.id); setError(null); }}
            className={`h-14 px-3.5 rounded-[14px] text-left text-[15px] font-semibold flex items-center gap-2.5 transition-colors ${
              method === m.id ? "border-2 border-primary bg-[#FFF7F1]" : "border border-ink/[0.14] bg-white hover:border-ink/30"
            }`}
          >
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: m.color }} />
            <span className="flex-1">{m.label}</span>
            {method === m.id && <Check className="w-[18px] h-[18px] text-primary" strokeWidth={2.2} aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p className="text-[13px] text-ink-soft">{current.hint}</p>

      <div>
        <label htmlFor="payer-phone" className="block text-sm font-semibold mb-2">
          Numéro qui paie
        </label>
        <div className="h-[54px] px-4 rounded-[14px] border border-ink/[0.14] bg-white flex items-center gap-2.5 focus-within:border-primary">
          <span className="text-[15px] text-ink-muted shrink-0">+225</span>
          <input
            id="payer-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(null); }}
            placeholder={current.prefix ? `${current.prefix} 00 00 00 00` : "07 00 00 00 00"}
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[17px] font-semibold tracking-wide text-ink"
          />
          {defaultPhone && phone === defaultPhone && (
            <span className="shrink-0 text-xs font-semibold text-pacte-ink bg-pacte-tint px-2 py-1 rounded-full">Votre compte</span>
          )}
        </div>
        {prefixMismatch && (
          <p className="text-[13px] text-amber-ink mt-1.5">Un numéro {current.label} commence par {current.prefix}.</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <button
        onClick={pay}
        disabled={!canPay}
        className="w-full h-[58px] inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white text-[17px] font-semibold hover:bg-[#8E4219] active:scale-[0.98] transition disabled:opacity-40"
      >
        {state === "sending" && <Loader2 className="w-4 h-4 animate-spin" />}
        Payer {total.toLocaleString("fr-FR")} FCFA avec {current.label}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[13px] text-ink-soft text-center">
        <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.8} /> Vous validez chez votre opérateur, aucun code n'est saisi sur ce site
      </p>
    </div>
  );
};

export default JekoPayment;
