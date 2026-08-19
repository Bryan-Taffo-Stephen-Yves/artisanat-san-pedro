// Accents par catégorie — charte "Mains de San Pedro" (monochrome terracotta).
// L'ancien système tricolore (terracotta/forest/bordeaux) est remplacé par
// des déclinaisons de la couleur signature #C3622D.
export type CategoryAccent = {
  hex: string;
  text: string;
  bg: string;
  border: string;
};

const CLAY_500: CategoryAccent = {
  hex: "#C3622D",
  text: "text-[#C3622D]",
  bg: "bg-[#C3622D]",
  border: "border-[#C3622D]",
};
const CLAY_700: CategoryAccent = {
  hex: "#864521",
  text: "text-[#864521]",
  bg: "bg-[#864521]",
  border: "border-[#864521]",
};
const CLAY_400: CategoryAccent = {
  hex: "#D28962",
  text: "text-[#D28962]",
  bg: "bg-[#D28962]",
  border: "border-[#D28962]",
};

// Chaque métier reçoit une nuance de terracotta pour garder une légère
// différenciation visuelle sans casser le monochrome de la charte.
const MAP: Record<string, CategoryAccent> = {
  sculpture: CLAY_500,
  scu: CLAY_500,
  tressage: CLAY_700,
  tre: CLAY_700,
  tissage: CLAY_400,
  tis: CLAY_400,
  poterie: CLAY_500,
  pot: CLAY_500,
  forge: CLAY_700,
  for: CLAY_700,
  peinture: CLAY_400,
  pnt: CLAY_400,
  // Métiers réels de la base PACTE
  botterie: CLAY_500,
  bijouterie: CLAY_700,
  accessoires: CLAY_400,
  serigraphie: CLAY_500,
  peinturecategory: CLAY_400,
};

export const categoryAccent = (category?: string): CategoryAccent =>
  MAP[(category ?? "").toLowerCase()] ?? CLAY_500;
