// Paiement Jèko — API direct (le client paie avec le numéro de son compte,
// sans formulaire Jèko intermédiaire).
//
// POST { action: "create", order_id, payment_method, payer_phone }
//   -> { mode: "redirect" | "ussd", redirectUrl, reference }
// POST { action: "status", order_id }
//   -> { status, reference, total }
//
// Secrets à définir dans Supabase (Edge Functions > Secrets) :
//   JEKO_API_KEY, JEKO_API_KEY_ID, JEKO_STORE_ID, SITE_URL (facultatif)
import { createClient } from "jsr:@supabase/supabase-js@2";

const JEKO_API = "https://api.jeko.africa/partner_api";
const METHODS = ["wave", "orange", "mtn", "moov", "djamo"] as const;
type Method = (typeof METHODS)[number];
// Préfixes mobiles en Côte d'Ivoire : Orange 07, MTN 05, Moov 01
const PREFIX: Partial<Record<Method, string>> = { orange: "07", mtn: "05", moov: "01" };
const OPERATOR_NAME: Record<Method, string> = {
  wave: "Wave", orange: "Orange Money", mtn: "MTN MoMo", moov: "Moov Money", djamo: "Djamo",
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAID = ["paid", "preparing", "shipped", "delivered"];

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// "07 01 02 03 04", "0701020304", "+2250701020304" -> "+2250701020304"
function normalizePhone(raw: unknown): string | null {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("225") && digits.length === 13) digits = digits.slice(3);
  return /^(01|05|07)\d{8}$/.test(digits) ? `+225${digits}` : null;
}

function jekoHeaders() {
  return {
    "X-API-KEY": Deno.env.get("JEKO_API_KEY") ?? "",
    "X-API-KEY-ID": Deno.env.get("JEKO_API_KEY_ID") ?? "",
    "Content-Type": "application/json",
  };
}

const jekoConfigured = () =>
  !!(Deno.env.get("JEKO_API_KEY") && Deno.env.get("JEKO_API_KEY_ID") && Deno.env.get("JEKO_STORE_ID"));

function friendlyError(id: string | undefined): string {
  switch (id) {
    case "third_party_payment_provider_error":
      return "L'opérateur n'a pas pu lancer le paiement. Vérifiez le numéro et l'opérateur choisis, puis réessayez.";
    case "validation_error":
      return "Les informations de paiement sont invalides. Vérifiez le numéro.";
    case "unauthorized":
    case "business_not_enabled_for_api_access":
    case "store_not_found":
      return "Le paiement en ligne est momentanément indisponible. L'équipe va vous contacter.";
    default:
      return "Le paiement n'a pas pu être lancé. Réessayez dans un instant.";
  }
}

async function createPayment(body: any) {
  const orderId = String(body.order_id ?? "");
  const method = String(body.payment_method ?? "") as Method;
  const phone = normalizePhone(body.payer_phone);

  if (!UUID.test(orderId)) return json({ error: "Commande invalide." }, 400);
  if (!METHODS.includes(method)) return json({ error: "Moyen de paiement non pris en charge." }, 400);
  if (!phone) {
    return json({ error: "Numéro invalide : indiquez un numéro mobile ivoirien à 10 chiffres (01, 05 ou 07…)." }, 422);
  }
  const prefix = PREFIX[method];
  if (prefix && phone.slice(4, 6) !== prefix) {
    return json({ error: `Ce numéro n'est pas un numéro ${OPERATOR_NAME[method]} (il doit commencer par ${prefix}).` }, 422);
  }

  const { data: order, error: orderError } = await supabase
    .from("orders").select("id, reference, total, status").eq("id", orderId).maybeSingle();
  if (orderError || !order) return json({ error: "Commande introuvable." }, 404);
  if (PAID.includes(order.status)) return json({ status: "already_paid", reference: order.reference });
  if (order.status === "cancelled") return json({ error: "Cette commande a été annulée." }, 409);
  if (!jekoConfigured()) return json({ error: "jeko_non_configure" }, 503);

  // Une référence par tentative (exigence Jèko : une référence consommée ne se réutilise pas)
  const { count } = await supabase
    .from("payment_attempts").select("id", { count: "exact", head: true }).eq("order_id", orderId);
  const reference = `${order.reference}-T${(count ?? 0) + 1}`;

  // La tentative est enregistrée avant l'appel : le webhook peut arriver très vite
  const { error: insertError } = await supabase.from("payment_attempts").insert({
    order_id: orderId, reference, payment_method: method, payer_phone: phone,
  });
  if (insertError) return json({ error: "Le paiement n'a pas pu être préparé. Réessayez." }, 500);

  const site = (Deno.env.get("SITE_URL") ?? "https://artisanat-san-pedro.vercel.app").replace(/\/$/, "");
  const back = `${site}/paiement/retour?commande=${orderId}&ref=${encodeURIComponent(reference)}`;

  const res = await fetch(`${JEKO_API}/payment_requests`, {
    method: "POST",
    headers: jekoHeaders(),
    body: JSON.stringify({
      storeId: Deno.env.get("JEKO_STORE_ID"),
      amountCents: order.total * 100, // Jèko compte en centimes, même pour le franc CFA
      currency: "XOF",
      reference,
      paymentDetails: {
        type: "redirect",
        data: {
          paymentMethod: method,
          forceProviderDirect: true,
          payerPhone: phone,
          successUrl: `${back}&issue=succes`,
          errorUrl: `${back}&issue=erreur`,
        },
      },
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Jèko create error", res.status, payload?.id, payload?.message);
    await supabase.rpc("jeko_paiement_echoue", { p_reference: reference, p_reason: payload?.id ?? `http_${res.status}` });
    return json({ error: friendlyError(payload?.id) }, 502);
  }

  await supabase.from("payment_attempts").update({ payment_request_id: payload.id }).eq("reference", reference);
  await supabase.from("orders")
    .update({ payment_provider: "jeko", payment_method: method, status: "pending" })
    .eq("id", orderId)
    .in("status", ["pending", "failed"]);

  return json({
    // MTN et Moov : demande de code envoyée sur le téléphone (USSD), pas de page à ouvrir
    mode: method === "mtn" || method === "moov" ? "ussd" : "redirect",
    redirectUrl: payload.redirectUrl,
    reference,
  });
}

// Vérifie auprès de Jèko les tentatives en cours (un échec n'envoie pas de webhook)
async function checkStatus(body: any) {
  const orderId = String(body.order_id ?? "");
  if (!UUID.test(orderId)) return json({ error: "Commande invalide." }, 400);

  const { data: order } = await supabase
    .from("orders").select("id, reference, total, status").eq("id", orderId).maybeSingle();
  if (!order) return json({ error: "Commande introuvable." }, 404);

  if (!PAID.includes(order.status) && jekoConfigured()) {
    const { data: attempts } = await supabase
      .from("payment_attempts")
      .select("reference, payment_request_id")
      .eq("order_id", orderId)
      .eq("status", "pending")
      .not("payment_request_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(3);

    for (const a of attempts ?? []) {
      const res = await fetch(`${JEKO_API}/payment_requests/${a.payment_request_id}`, { headers: jekoHeaders() });
      if (!res.ok) continue;
      const pr = await res.json();
      if (pr.status === "success" && pr.transaction) {
        await supabase.rpc("jeko_paiement_reussi", {
          p_reference: a.reference,
          p_payment_request_id: pr.id,
          p_amount_cents: pr.transaction.amount?.amount ?? null,
          p_transaction_id: pr.transaction.id ?? null,
          p_method: pr.paymentMethod ?? null,
        });
      } else if (pr.status === "error") {
        await supabase.rpc("jeko_paiement_echoue", { p_reference: a.reference, p_reason: pr.errorReason ?? "error" });
      }
    }
  }

  const { data: fresh } = await supabase
    .from("orders").select("reference, total, status").eq("id", orderId).maybeSingle();
  return json(fresh ?? order);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  try {
    const body = await req.json();
    if (body?.action === "create") return await createPayment(body);
    if (body?.action === "status") return await checkStatus(body);
    return json({ error: "Action inconnue" }, 400);
  } catch (e) {
    console.error("jeko-pay", e);
    return json({ error: "Erreur inattendue." }, 500);
  }
});
