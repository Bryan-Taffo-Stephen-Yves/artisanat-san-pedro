// Webhook Jèko : confirmation définitive des paiements.
// URL à déclarer dans le Dashboard Jèko Business > Paramètres > API & Webhooks :
//   https://ghzrzlkezdgnldlpnlbc.supabase.co/functions/v1/jeko-webhook
// Secret : JEKO_WEBHOOK_SECRET (Supabase > Edge Functions > Secrets)
// Cette fonction doit être déployée SANS vérification JWT (Jèko n'envoie pas de jeton Supabase).
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const encoder = new TextEncoder();

// HMAC-SHA256 du corps brut, en hexadécimal minuscule
async function hmacHex(secret: string, rawBody: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Comparaison en temps constant
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("JEKO_WEBHOOK_SECRET");
  if (!secret) {
    console.error("JEKO_WEBHOOK_SECRET manquant");
    return new Response("Not configured", { status: 500 });
  }

  // Le corps brut est lu une seule fois : la signature porte sur lui, pas sur le JSON reparsé
  const rawBody = await req.text();
  const signature = (req.headers.get("Jeko-Signature") ?? "").trim().toLowerCase();
  const expected = await hmacHex(secret, rawBody);
  if (!signature || !timingSafeEqual(signature, expected)) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  }

  const event = req.headers.get("Jeko-Event");
  if (event !== "TRANSACTION_COMPLETED") {
    return new Response(JSON.stringify({ received: true, ignored: event }), { status: 200 });
  }

  let tx: any;
  try {
    tx = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const reference = tx?.transactionDetails?.reference;
  if (tx?.transactionType === "payment" && tx?.status === "success" && reference) {
    // Idempotent : un webhook rejoué renvoie "already_paid" sans rien modifier
    const { data, error } = await supabase.rpc("jeko_paiement_reussi", {
      p_reference: reference,
      p_payment_request_id: tx.transactionDetails?.id ?? null,
      p_amount_cents: tx.amount?.amount ?? null,
      p_transaction_id: tx.id ?? null,
      p_method: tx.paymentMethod ?? null,
    });
    if (error) {
      console.error("jeko-webhook: mise à jour impossible", reference, error.message);
      return new Response(JSON.stringify({ error: "retry" }), { status: 500 }); // Jèko réessaiera
    }
    console.log("jeko-webhook", reference, data);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
