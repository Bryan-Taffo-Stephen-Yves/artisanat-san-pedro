// Sert les images du Storage Supabase redimensionnées (Image Transformations)
// au lieu des originaux, qui peuvent peser plusieurs Mo. Le navigateur reçoit
// automatiquement du WebP quand il sait le lire.
// Les URLs externes ou locales sont renvoyées telles quelles.
const OBJECT_PATH = "/storage/v1/object/public/";
const RENDER_PATH = "/storage/v1/render/image/public/";

export function optimizeImage(
  url: string | null | undefined,
  width: number,
  height: number = width,
  quality = 70,
  resize: "contain" | "cover" = "contain"
): string {
  if (!url) return "";
  if (!url.includes(OBJECT_PATH)) return url;
  const base = url.replace(OBJECT_PATH, RENDER_PATH).split("?")[0];
  return `${base}?width=${width}&height=${height}&resize=${resize}&quality=${quality}`;
}

// Image au format des cartes (4/5), recadrée côté serveur comme à l'écran
const card = (url: string | null | undefined, w: number) =>
  optimizeImage(url, w, Math.round(w * 1.25), 65, "cover");

export interface ResponsiveImage {
  src: string;
  srcSet?: string;
}

// Carte produit / portrait : le navigateur choisit la plus petite taille suffisante
export function cardImage(url: string | null | undefined): ResponsiveImage {
  if (!url) return { src: "" };
  if (!url.includes(OBJECT_PATH)) return { src: url };
  return {
    src: card(url, 480),
    srcSet: `${card(url, 320)} 320w, ${card(url, 480)} 480w, ${card(url, 720)} 720w`,
  };
}

// Largeur d'affichage des cartes, pour le choix dans srcSet
export const CARD_SIZES = "(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw";

// Tailles standard utilisées dans le site
export const IMG = {
  thumb: (url?: string | null) => optimizeImage(url, 160, 160, 60, "cover"),
  card: (url?: string | null) => card(url, 480),
  full: (url?: string | null) => optimizeImage(url, 1200, 1200, 75),
  avatar: (url?: string | null) => card(url, 480),
};

// Grande photo de la fiche produit : 640 à 900 px sur téléphone, 1200 px sur grand écran
export function fullImageSet(url: string | null | undefined): string | undefined {
  if (!url || !url.includes(OBJECT_PATH)) return undefined;
  return `${optimizeImage(url, 640, 640, 72)} 640w, ${optimizeImage(url, 900, 900, 72)} 900w, ${optimizeImage(url, 1200, 1200, 75)} 1200w`;
}
