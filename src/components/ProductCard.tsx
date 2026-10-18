import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { categoryAccent } from "@/lib/categoryColors";
import { useTilt } from "@/hooks/useTilt";

import productMask from "@/assets/product-mask.jpg";
import productBowls from "@/assets/product-bowls.jpg";
import productTextile from "@/assets/product-textile.jpg";
import productIronwork from "@/assets/product-ironwork.jpg";

const mockProducts = [
  {
    id: "1",
    name: "Masque Baoulé Ancien",
    category: "Sculpture",
    categoryCode: "SCU",
    artisan: "Kofi Asante",
    price: 45000,
    image: productMask,
  },
  {
    id: "2",
    name: "Trio de Bols Terre Cuite",
    category: "Poterie",
    categoryCode: "POT",
    artisan: "Ama Diallo",
    price: 18500,
    image: productBowls,
  },
  {
    id: "3",
    name: "Châle Tissé Main",
    category: "Tissage",
    categoryCode: "TIS",
    artisan: "Yao Kouadio",
    price: 32000,
    image: productTextile,
  },
];

const ProductCard = ({ product }: { product: typeof mockProducts[0] }) => {
  const [liked, setLiked] = useState(false);
  const accent = categoryAccent(product.category);
  const { ref, onMouseMove, onMouseLeave } = useTilt(12);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      className="rounded-bento overflow-hidden bg-background shadow-luxury"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1000}
          height={750}
          className="w-full h-full object-cover brightness-[0.95] sepia-[0.1]"
        />
        <span
          className="absolute top-4 left-4 glass-card px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold"
          style={{ color: accent.hex }}
        >
          {product.categoryCode}
        </span>
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-4 right-4 glass-card w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${liked ? "fill-primary text-primary" : "text-inverse-surface"}`}
          />
        </button>
      </div>
      <div className="p-4">
        <span
          className="text-[9px] uppercase tracking-widest font-semibold"
          style={{ color: accent.hex }}
        >
          {product.category}
        </span>
        <h3 className="font-serif text-base leading-snug mt-1 text-inverse-surface">
          {product.name}
        </h3>
        <p className="text-[10px] text-muted-foreground mt-1">{product.artisan}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="font-serif text-primary text-lg">
            {product.price.toLocaleString("fr-FR")} <span className="text-xs">CFA</span>
          </span>
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-terracotta to-terracotta-light flex items-center justify-center text-primary-foreground hover:opacity-90 active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export { ProductCard, mockProducts };
