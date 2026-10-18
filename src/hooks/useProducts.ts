import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IMG } from "@/lib/image";

export interface ProductUI {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryCode: string;
  artisan: string;
  artisanSlug: string;
  artisanAvatar: string;
  artisanMetier: string;
  artisanLocation: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  date: string;
  stock: number;
  description: string;
  gallery: string[];
}

const CATEGORY_CODES: Record<string, string> = {
  Sculpture: "SCU",
  Tressage: "TRE",
  Tissage: "TIS",
  Poterie: "POT",
  Forge: "FOR",
  Peinture: "PNT",
  Bijouterie: "BIJ",
  Botterie: "BOT",
  Accessoires: "ACC",
  Sérigraphie: "SER",
};

function mapProductRow(row: any): ProductUI {
  const a = row.artisans;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    categoryCode: CATEGORY_CODES[row.category] ?? "ART",
    artisan: a?.name ?? "Artisan",
    artisanSlug: a?.slug ?? "",
    artisanAvatar: IMG.thumb(a?.avatar_url),
    artisanMetier: a?.metier ?? "",
    artisanLocation: a?.location ?? "",
    price: Number(row.price ?? 0),
    image: IMG.card(row.image_url),
    rating: row.rating ?? 0,
    reviews: row.reviews_count ?? 0,
    badge: row.badge ?? undefined,
    date: row.created_at ?? "",
    stock: row.stock ?? 0,
    description: row.description ?? "",
    gallery: ((row.gallery && row.gallery.length > 0) ? row.gallery : (row.image_url ? [row.image_url] : [])).map(IMG.full),
  };
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select("*, artisans(name, slug, avatar_url, metier, location)")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data as any[]) ?? []).map(mapProductRow);
    },
    staleTime: 60000,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select("*, artisans(name, slug, avatar_url, metier, location)")
        .eq("slug", slug as string)
        .maybeSingle();
      if (error) throw error;
      return data ? mapProductRow(data) : null;
    },
  });
}

export function useProductsByArtisan(artisanId: string | undefined) {
  return useQuery({
    queryKey: ["products-by-artisan", artisanId],
    enabled: !!artisanId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select("*, artisans(name, slug, avatar_url, metier, location)")
        .eq("artisan_id", artisanId as string)
        .eq("published", true);
      if (error) throw error;
      return ((data as any[]) ?? []).map(mapProductRow);
    },
  });
}
