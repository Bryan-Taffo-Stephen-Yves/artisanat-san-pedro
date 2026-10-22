import { useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import { CARD_SIZES, type ResponsiveImage } from "@/lib/image";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";

type CardProduct = Product & { imageSrcSet?: string; cardImages?: ResponsiveImage[] };
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useFavorites } from "@/hooks/useFavorites";

interface BoutiqueProductCardProps {
  product: CardProduct;
  // Libellé sous le nom : l'artisan (par défaut) ou masqué sur sa propre page
  showArtisan?: boolean;
  // Apparition au scroll : position dans la rangée (décalage)
  reveal?: number;
  // Carte visible dès l'arrivée sur la page : première photo chargée en priorité
  eager?: boolean;
}

const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

// Carte produit de la charte : photo 4/5, favori, nom, artisan, prix, panier.
const BoutiqueProductCard = ({ product, showArtisan = true, reveal, eager = false }: BoutiqueProductCardProps) => {
  const { addItem } = useCart();
  const favorites = useFavorites("product");
  const liked = favorites.isFavorite(product.id);
  const outOfStock = product.stock <= 0;
  const href = `/boutique/${product.slug}`;
  // Retours visuels : cœur qui bat, coche après l'ajout au panier
  const [pop, setPop] = useState(false);
  const [added, setAdded] = useState(false);
  const photos: ResponsiveImage[] = product.cardImages?.length
    ? product.cardImages
    : [{ src: product.image, srcSet: product.imageSrcSet }];
  const pisteRef = useRef<HTMLDivElement>(null);
  const [photoActive, setPhotoActive] = useState(0);
  const allerA = (i: number) => {
    const el = pisteRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <article
      className="flex flex-col gap-1.5"
      {...(reveal !== undefined ? { "data-san-scroll": "", "data-san-delay": Math.min(reveal, 5) } : {})}
    >
      <div className="relative group/photos">
        {/* Photos à faire défiler : balayage au doigt, flèches au survol sur ordinateur.
            Les photos suivantes ne se chargent que lorsqu'on s'en approche. */}
        <div
          ref={pisteRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            setPhotoActive(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
          }}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-2xl bg-sand overscroll-x-contain"
        >
          {photos.map((ph, i) => (
            <Link key={i} to={href} className="block w-full shrink-0 snap-start" tabIndex={-1} aria-hidden="true">
              {ph.src ? (
                <img
                  src={ph.src}
                  srcSet={ph.srcSet}
                  sizes={CARD_SIZES}
                  alt=""
                  width={480}
                  height={600}
                  loading={eager && i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  {...(eager && i === 0 ? ({ fetchpriority: "high" } as Record<string, string>) : {})}
                  className="w-full aspect-[4/5] object-cover"
                />
              ) : (
                <div className="w-full aspect-[4/5] grid place-items-center text-ink-muted text-sm">{product.category}</div>
              )}
            </Link>
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <div className="pointer-events-none absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5" aria-hidden="true">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full bg-white shadow-[0_0_2px_rgba(0,0,0,0.4)] transition-all duration-300 ${
                    i === photoActive ? "w-4 opacity-100" : "w-1.5 opacity-70"
                  }`}
                />
              ))}
            </div>
            {photoActive > 0 && (
              <button
                onClick={() => allerA(photoActive - 1)}
                aria-label={`Photo précédente de ${product.name}`}
                className="hidden md:grid absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-ink place-items-center shadow-[0_2px_10px_rgba(29,23,18,0.18)] opacity-0 group-hover/photos:opacity-100 focus-visible:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            )}
            {photoActive < photos.length - 1 && (
              <button
                onClick={() => allerA(photoActive + 1)}
                aria-label={`Photo suivante de ${product.name}`}
                className="hidden md:grid absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-ink place-items-center shadow-[0_2px_10px_rgba(29,23,18,0.18)] opacity-0 group-hover/photos:opacity-100 focus-visible:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            )}
          </>
        )}

        <button
          onClick={() => { favorites.toggle(product.id, product.name); setPop(true); }}
          aria-pressed={liked}
          aria-label={liked ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white text-ink grid place-items-center shadow-[0_2px_10px_rgba(29,23,18,0.14)] hover:scale-105 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${liked ? "fill-primary text-primary" : ""} ${pop ? "animate-pop" : ""}`}
            onAnimationEnd={() => setPop(false)}
            strokeWidth={1.8}
          />
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
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1400);
            toast.success(`${product.name} ajouté au panier`);
          }}
          disabled={outOfStock}
          aria-label={outOfStock ? `${product.name} : épuisé` : `Ajouter ${product.name} au panier`}
          className="h-11 min-w-11 px-3 md:px-4 rounded-full border border-ink/[0.16] bg-white text-ink text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:border-ink/40 transition-colors disabled:opacity-40"
        >
          {added ? (
            <Check className="w-4 h-4 text-pacte animate-pop" strokeWidth={2.4} />
          ) : (
            <Plus className="w-4 h-4" strokeWidth={2} />
          )}
          <span className="hidden sm:inline">{outOfStock ? "Épuisé" : added ? "Ajouté" : "Panier"}</span>
        </button>
      </div>
    </article>
  );
};

export default BoutiqueProductCard;
