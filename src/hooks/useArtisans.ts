import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IMG } from "@/lib/image";

export interface ArtisanUI {
  id: string;
  slug: string;
  name: string;
  metier: string;
  metierCategory: string;
  avatar: string;
  coverImage: string;
  location: string;
  since: number;
  rating: number;
  reviews: number;
  productsCount: number;
  bio: string;
  featured: boolean;
  initials: string;
  accentColor: string;
}

const ACCENT_BY_CATEGORY: Record<string, string> = {
  Sculpture: "#C3622D",
  Tressage: "#A55427",
  Tissage: "#864521",
  Poterie: "#C3622D",
  Forge: "#864521",
  Peinture: "#A55427",
  Bijouterie: "#864521",
  Botterie: "#5C3A1E",
  Accessoires: "#A55427",
  Sérigraphie: "#C3622D",
};

// Colonnes publiques uniquement : jamais pin_code, login_id, email ni téléphone
const PUBLIC_COLUMNS =
  "id, slug, name, metier, metier_category, location, since, bio, avatar_url, cover_image_url, rating, reviews_count, products_count, featured, published, diagnostic_order";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapArtisanRow(row: any): ArtisanUI {
  const accent = ACCENT_BY_CATEGORY[row.metier_category] || "#C3622D";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    metier: row.metier,
    metierCategory: row.metier_category,
    avatar: IMG.avatar(row.avatar_url),
    coverImage: IMG.full(row.cover_image_url),
    location: row.location,
    since: row.since ?? new Date().getFullYear(),
    rating: row.rating ?? 0,
    reviews: row.reviews_count ?? 0,
    productsCount: row.products_count ?? 0,
    bio: row.bio ?? "",
    featured: row.featured ?? false,
    initials: getInitials(row.name ?? ""),
    accentColor: accent,
  };
}

export function useArtisans() {
  return useQuery({
    queryKey: ["artisans"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("artisans")
        .select(PUBLIC_COLUMNS)
        .eq("published", true)
        .order("diagnostic_order", { ascending: true });
      if (error) throw error;
      return ((data as any[]) ?? []).map(mapArtisanRow);
    },
    staleTime: 60000,
  });
}

export function useArtisan(slug: string | undefined) {
  return useQuery({
    queryKey: ["artisan", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("artisans")
        .select(PUBLIC_COLUMNS)
        .eq("slug", slug as string)
        .maybeSingle();
      if (error) throw error;
      return data ? mapArtisanRow(data) : null;
    },
  });
}