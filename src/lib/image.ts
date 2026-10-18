// Sert les images du Storage Supabase redimensionnées (Image Transformations)
// au lieu des originaux, qui peuvent peser plusieurs Mo.
// Les URLs externes ou locales sont renvoyées telles quelles.
const OBJECT_PATH = "/storage/v1/object/public/";
const RENDER_PATH = "/storage/v1/render/image/public/";

export function optimizeImage(
  url: string | null | undefined,
  width: number,
  height: number = width,
  quality = 70
): string {
  if (!url) return "";
  if (!url.includes(OBJECT_PATH)) return url;
  const base = url.replace(OBJECT_PATH, RENDER_PATH).split("?")[0];
  // resize=contain : jamais de recadrage, l'image tient dans width×height
  return `${base}?width=${width}&height=${height}&resize=contain&quality=${quality}`;
}

// Tailles standard utilisées dans le site
export const IMG = {
  thumb: (url?: string | null) => optimizeImage(url, 240, 240, 65),
  card: (url?: string | null) => optimizeImage(url, 800, 800, 70),
  full: (url?: string | null) => optimizeImage(url, 1400, 1400, 78),
  avatar: (url?: string | null) => optimizeImage(url, 800, 800, 72),
};
