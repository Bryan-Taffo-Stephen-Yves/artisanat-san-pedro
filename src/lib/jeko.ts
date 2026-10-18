import { supabase } from "@/integrations/supabase/client";

export type JekoMethod = "wave" | "orange" | "mtn" | "moov" | "djamo";

export const JEKO_METHODS: { id: JekoMethod; label: string; hint: string; prefix?: string; color: string }[] = [
  { id: "wave", label: "Wave", hint: "Vous validez dans l'application Wave", color: "#1DC8F2" },
  { id: "orange", label: "Orange Money", hint: "Numéro en 07", prefix: "07", color: "#FF7900" },
  { id: "mtn", label: "MTN MoMo", hint: "Numéro en 05 · code à valider sur votre téléphone", prefix: "05", color: "#FFCB05" },
  { id: "moov", label: "Moov Money", hint: "Numéro en 01 · code à valider sur votre téléphone", prefix: "01", color: "#0066B3" },
  { id: "djamo", label: "Djamo", hint: "Vous validez dans l'application Djamo", color: "#5B2EFF" },
];

// Opérateur le plus probable d'après le préfixe du numéro (01 Moov, 05 MTN, 07 Orange)
export function guessMethod(phone: string): JekoMethod | null {
  const d = phone.replace(/\D/g, "").replace(/^225(?=\d{10}$)/, "");
  if (d.startsWith("07")) return "orange";
  if (d.startsWith("05")) return "mtn";
  if (d.startsWith("01")) return "moov";
  return null;
}

export const isValidCiMobile = (phone: string) =>
  /^(01|05|07)\d{8}$/.test(phone.replace(/\D/g, "").replace(/^225(?=\d{10}$)/, ""));

export interface PayResult {
  mode?: "redirect" | "ussd";
  redirectUrl?: string;
  reference?: string;
  status?: string;
  error?: string;
  offline?: boolean;
}

// Les fonctions Edge renvoient leurs messages d'erreur dans le corps de la réponse
async function invoke(body: Record<string, unknown>): Promise<PayResult> {
  const { data, error } = await supabase.functions.invoke("jeko-pay", { body });
  if (!error) return data as PayResult;
  let payload: any = {};
  try {
    payload = await (error as any).context?.json?.();
  } catch {
    /* corps illisible */
  }
  if (payload?.error === "jeko_non_configure" || (error as any).context?.status === 404) {
    return { offline: true };
  }
  return { error: payload?.error || "Le paiement n'a pas pu être lancé. Réessayez dans un instant." };
}

export const jeko = {
  pay: (orderId: string, method: JekoMethod, phone: string) =>
    invoke({ action: "create", order_id: orderId, payment_method: method, payer_phone: phone }),
  status: (orderId: string) => invoke({ action: "status", order_id: orderId }),
};

export const PAID_STATUSES = ["paid", "preparing", "shipped", "delivered"];
