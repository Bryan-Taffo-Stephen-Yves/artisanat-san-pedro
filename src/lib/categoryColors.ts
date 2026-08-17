// Per-category accent colors for the tri-color brand system.
export type CategoryAccent = {
  hex: string;
  text: string;
  bg: string;
  border: string;
};

const TERRACOTTA: CategoryAccent = {
  hex: "#C3622D",
  text: "text-[#C3622D]",
  bg: "bg-[#C3622D]",
  border: "border-[#C3622D]",
};
const FOREST: CategoryAccent = {
  hex: "#A55427",
  text: "text-[#A55427]",
  bg: "bg-[#A55427]",
  border: "border-[#A55427]",
};
const BORDEAUX: CategoryAccent = {
  hex: "#864521",
  text: "text-[#864521]",
  bg: "bg-[#864521]",
  border: "border-[#864521]",
};

const MAP: Record<string, CategoryAccent> = {
  sculpture: TERRACOTTA,
  scu: TERRACOTTA,
  tressage: FOREST,
  tre: FOREST,
  tissage: BORDEAUX,
  tis: BORDEAUX,
  poterie: TERRACOTTA,
  pot: TERRACOTTA,
  forge: BORDEAUX,
  for: BORDEAUX,
  peinture: FOREST,
  pnt: FOREST,
};

export const categoryAccent = (category?: string): CategoryAccent =>
  MAP[(category ?? "").toLowerCase()] ?? TERRACOTTA;
