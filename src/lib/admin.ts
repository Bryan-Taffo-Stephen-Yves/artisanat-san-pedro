import { supabase } from "@/integrations/supabase/client";

// Le code admin est vérifié par la base (fonction admin_verifier) et gardé
// pour la durée de l'onglet uniquement : il n'est jamais écrit dans le code.
const KEY = "sp_admin_code";

export function getAdminCode(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAdminCode(code: string | null) {
  try {
    if (code) sessionStorage.setItem(KEY, code);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* stockage indisponible */
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await (supabase as any).rpc(fn, args);
  if (error) throw new Error(error.message || "Erreur serveur");
  return data as T;
}

export const adminApi = {
  verifier: (code: string) => rpc<boolean>("admin_verifier", { p_code: code }),
  stats: (code: string) => rpc<AdminStats>("admin_stats", { p_code: code }),
  produits: (code: string) => rpc<AdminProduct[]>("admin_produits", { p_code: code }),
  artisans: (code: string) => rpc<AdminArtisan[]>("admin_artisans", { p_code: code }),
  commandes: (code: string) => rpc<AdminOrder[]>("admin_commandes", { p_code: code }),
  moderer: (code: string, productId: string, decision: "approve" | "reject" | "hide" | "show", note?: string) =>
    rpc<void>("admin_moderer_produit", {
      p_code: code,
      p_product_id: productId,
      p_decision: decision,
      p_note: note ?? null,
    }),
  telephone: (code: string, artisanId: string, phone: string) =>
    rpc<void>("admin_maj_telephone", { p_code: code, p_artisan_id: artisanId, p_phone: phone }),
  confiance: (code: string, artisanId: string, value: boolean) =>
    rpc<void>("admin_definir_confiance", { p_code: code, p_artisan_id: artisanId, p_value: value }),
};

export interface AdminStats {
  artisans: number;
  produits_en_ligne: number;
  produits_en_attente: number;
  produits_refuses: number;
  commandes: number;
  commandes_payees: number;
  chiffre_affaires: number;
  clients: number;
  artisans_sans_produit_ce_mois: number;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
  gallery: string[] | null;
  published: boolean;
  status: "pending" | "approved" | "rejected";
  moderation_note: string | null;
  submitted_at: string | null;
  created_at: string;
  artisan_id: string;
  artisan_name: string | null;
  artisan_metier: string | null;
  artisan_auto_approve: boolean | null;
}

export interface AdminArtisan {
  id: string;
  name: string;
  slug: string;
  metier: string;
  metier_category: string;
  login_id: string | null;
  phone: string | null;
  auto_approve: boolean;
  published: boolean;
  products_total: number;
  last_product_at: string | null;
}

export interface AdminOrder {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string | null;
  delivery_city: string | null;
  total: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  items: { product_name: string; quantity: number; unit_price: number; product_image: string | null }[];
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  failed: "Paiement échoué",
};
