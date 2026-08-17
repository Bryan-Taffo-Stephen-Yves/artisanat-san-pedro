// Per-category accent colors for the tri-color brand system.
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

const MAP: Record<string, CategoryAccent> = {
  sculpture: CLAY_500,
  scu: CLAY_500,
  tressage: CLAY_400,
  tre: CLAY_400,
  tissage: CLAY_700,
  tis: CLAY_700,
  poterie: CLAY_500,
  pot: CLAY_500,
  forge: CLAY_700,
  for: CLAY_700,
  peinture: CLAY_400,
  pnt: CLAY_400,
};

export const categoryAccent = (category?: string): CategoryAccent =>
  MAP[(category ?? "").toLowerCase()] ?? CLAY_500;
