import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IMG, cardImage, fullImageSet, type ResponsiveImage } from "@/lib/image";
import { readSnapshot, writeSnapshot } from "@/lib/snapshot";

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
  imageSrcSet?: string;
  // Photos de la carte, à faire défiler (format carte, chargées à la demande)
  cardImages: ResponsiveImage[];
  rating: number;
  reviews: number;
  badge?: string;
  date: string;
  stock: number;
  description: string;
  gallery: string[];
  gallerySrcSets: (string | undefined)[];
  galleryThumbs: string[];
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
  const photos: string[] = (row.gallery && row.gallery.length > 0) ? row.gallery : (row.image_url ? [row.image_url] : []);
  const cover = cardImage(row.image_url);
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
    image: cover.src,
    imageSrcSet: cover.srcSet,
    cardImages: [row.image_url, ...photos.filter((u) => u !== row.image_url)].filter(Boolean).slice(0, 5).map(cardImage),
    rating: row.rating ?? 0,
    reviews: row.reviews_count ?? 0,
    badge: row.badge ?? undefined,
    date: row.created_at ?? "",
    stock: row.stock ?? 0,
    description: row.description ?? "",
    gallery: photos.map(IMG.full),
    gallerySrcSets: photos.map(fullImageSet),
    galleryThumbs: photos.map(IMG.thumb),
  };
}

// Colonnes utiles aux listes (sans les descriptions, chargées sur la fiche)
const LIST_COLUMNS =
  "id, slug, name, category, price, image_url, gallery, stock, created_at, badge, rating, reviews_count, artisans(name, slug, avatar_url, metier, location)";
const FULL_COLUMNS = "*, artisans(name, slug, avatar_url, metier, location)";
const SNAPSHOT_KEY = "san_products_v1";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select(LIST_COLUMNS)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data as any[]) ?? [];
      writeSnapshot(SNAPSHOT_KEY, rows);
      return rows.map(mapProductRow);
    },
    // Visite suivante : la dernière liste s'affiche tout de suite, puis se met à jour
    initialData: () => readSnapshot<any[]>(SNAPSHOT_KEY)?.map(mapProductRow),
    initialDataUpdatedAt: 0,
  });
}

export function useProduct(slug: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["product", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select(FULL_COLUMNS)
        .eq("slug", slug as string)
        .maybeSingle();
      if (error) throw error;
      return data ? mapProductRow(data) : null;
    },
    // Fiche ouverte depuis une liste : on affiche déjà ce qu'on connaît
    placeholderData: () =>
      queryClient.getQueryData<ProductUI[]>(["products"])?.find((p) => p.slug === slug),
  });
}

export interface ArtisanProductRow {
  id: string;
  name: string;
  published: boolean;
  status: "pending" | "approved" | "rejected";
  stock: number;
  created_at: string;
}

// Tous les produits d'un artisan, y compris en attente / refusés
// (repli sur les produits publiés si la base n'est pas encore à jour)
export function useArtisanAllProducts(artisanId: string | undefined) {
  return useQuery({
    queryKey: ["artisan-all-products", artisanId],
    enabled: !!artisanId,
    queryFn: async (): Promise<ArtisanProductRow[]> => {
      const res = await (supabase as any).rpc("artisan_produits", { p_artisan_id: artisanId });
      let rows: any[] = res.data ?? [];
      if (res.error) {
        const fb = await (supabase as any)
          .from("products").select("id, name, published, stock, created_at").eq("artisan_id", artisanId);
        if (fb.error) throw fb.error;
        rows = fb.data ?? [];
      }
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        published: r.published ?? true,
        status: r.status ?? "approved",
        stock: r.stock ?? 0,
        created_at: r.created_at,
      }));
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
        .select(LIST_COLUMNS)
        .eq("artisan_id", artisanId as string)
        .eq("published", true);
      if (error) throw error;
      return ((data as any[]) ?? []).map(mapProductRow);
    },
  });
}
