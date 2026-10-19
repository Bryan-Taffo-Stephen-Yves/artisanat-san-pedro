import { Heart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";

interface BoutiqueProductCardProps {
  product: Product;
  // Libellé sous le nom : l'artisan (par défaut) ou masqué sur sa propre page
  showArtisan?: boolean;
}

const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

// Carte produit de la charte : photo 4/5, favori, nom, artisan, prix, panier.
const BoutiqueProductCard = ({ product, showArtisan = true }: BoutiqueProductCardProps) => {
  const { addItem } = useCart();
  const favorites = useFavorites("product");
  const liked = favorites.isFavorite(product.id);
  const outOfStock = product.stock <= 0;
  const href = `/boutique/${product.slug}`;

  return (
    <article className="flex flex-col gap-1.5">
      <div className="relative">
        <Link to={href} className="block rounded-2xl overflow-hidden bg-sand" tabIndex={-1} aria-hidden="true">
          {product.image ? (
            <img
              src={product.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full aspect-[4/5] object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full aspect-[4/5] grid place-items-center text-ink-muted text-sm">{product.category}</div>
          )}
        </Link>
        <button
          onClick={() => favorites.toggle(product.id, product.name)}
          aria-pressed={liked}
          aria-label={liked ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white text-ink grid place-items-center shadow-[0_2px_10px_rgba(29,23,18,0.14)] hover:scale-105 transition-transform"
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-primary text-primary" : ""}`} strokeWidth={1.8} />
        </button>
      </div>

      <h3 className="mt-2 text-[15px] md:text-[17px] leading-snug font-semibold tracking-normal">
        <Link to={href} className="text-ink no-underline hover:underline underline-offset-4">
          {product.name}
        </Link>
      </h3>
      {showArtisan && <span className="text-[13px] md:text-sm text-ink-muted">{product.artisan}</span>}

      <div className="flex items-center justify-between gap-2 mt-1">
        <span className="text-base md:text-lg font-bold tracking-tight">{fcfa(product.price)}</span>
        <button
          onClick={() => {
            if (outOfStock) {
              toast.error("Cette pièce n'est plus en stock");
              return;
            }
            addItem(product);
            toast.success(`${product.name} ajouté au panier`);
          }}
          disabled={outOfStock}
          aria-label={outOfStock ? `${product.name} : épuisé` : `Ajouter ${product.name} au panier`}
          className="h-11 min-w-11 px-3 md:px-4 rounded-full border border-ink/[0.16] bg-white text-ink text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:border-ink/40 transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">{outOfStock ? "Épuisé" : "Panier"}</span>
        </button>
      </div>
    </article>
  );
};

export default BoutiqueProductCard;
