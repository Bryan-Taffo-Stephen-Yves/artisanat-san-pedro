import { supabase } from "@/integrations/supabase/client";

// Catégories réelles de la base (enum metier_category / colonne category).
// Alignées sur les vraies valeurs PACTE San Pedro.
export const PRODUCT_CATEGORIES = [
  "Botterie",
  "Bijouterie",
  "Accessoires",
  "Sculpture",
  "Sérigraphie",
  "Tressage",
  "Tissage",
  "Peinture",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** Génère un slug propre à partir d'un texte (sans accents, sans espaces). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export interface NewProductInput {
  artisanId: string;
  artisanSlug: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  imageFile?: File | null;
}

export interface CreateProductResult {
  ok: boolean;
  error?: string;
  productId?: string;
}

/**
 * Crée un produit pour un artisan :
 *  1. (option) upload de la photo dans le bucket artisan-images/products/
 *  2. insertion de la ligne dans la table products
 * Retourne un résultat structuré (pas d'exception qui casse l'UI).
 */
export async function createProduct(input: NewProductInput): Promise<CreateProductResult> {
  try {
    const {
      artisanId, artisanSlug, name, price, stock, category, description, imageFile,
    } = input;

    // --- Validation minimale ---
    if (!artisanId) return { ok: false, error: "Session artisan introuvable. Reconnecte-toi." };
    if (!name.trim()) return { ok: false, error: "Le nom du produit est obligatoire." };
    if (!price || price <= 0) return { ok: false, error: "Le prix doit être supérieur à 0." };
    if (!category) return { ok: false, error: "Choisis une catégorie." };

    const baseSlug = `${slugify(artisanSlug || name)}-${Date.now().toString(36)}`;

    // --- 1. Upload photo (si fournie) ---
    let imageUrl = "";
    const gallery: string[] = [];
    if (imageFile) {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `products/${baseSlug}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("artisan-images")
        .upload(path, imageFile, { upsert: true, cacheControl: "3600" });
      if (upErr) {
        return { ok: false, error: `Échec de l'upload photo : ${upErr.message}` };
      }
      const { data: pub } = supabase.storage.from("artisan-images").getPublicUrl(path);
      imageUrl = pub?.publicUrl || "";
      if (imageUrl) gallery.push(imageUrl);
    }

    // --- 2. Insertion produit ---
    const row = {
      artisan_id: artisanId,
      slug: baseSlug,
      name: name.trim(),
      description: description.trim() || `${name.trim()} confectionné(e) à la main, pièce authentique du programme PACTE.`,
      category,
      price,
      stock: stock >= 0 ? stock : 1,
      image_url: imageUrl || null,
      gallery: gallery.length ? gallery : null,
      rating: 0,
      reviews_count: 0,
      published: true,
    };

    const { data, error } = await (supabase as any)
      .from("products")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      return { ok: false, error: `Publication impossible : ${error.message}` };
    }

    return { ok: true, productId: data?.id };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Erreur inattendue." };
  }
}
