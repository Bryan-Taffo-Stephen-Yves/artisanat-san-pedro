import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Minus, Plus, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalItems, subtotal } = useCart();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="glass-card fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-inverse-surface"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
          <span className="text-[13px] font-semibold">Retour</span>
        </button>
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-inverse-surface" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
              {totalItems}
            </span>
          )}
        </div>
      </header>

      {/* Header */}
      <div className="px-6 pt-24 pb-4">
        <h1 className="font-serif text-3xl italic text-inverse-surface">Mon Panier</h1>
        <span className="text-[13px] font-semibold text-muted-foreground">
          {totalItems} article{totalItems !== 1 ? "s" : ""}
        </span>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center py-20 px-6">
          <ShoppingBag className="w-16 h-16 text-border" />
          <h2 className="font-serif text-2xl italic text-muted-foreground mt-4">
            Votre panier est vide
          </h2>
          <p className="text-sm text-muted-foreground font-light mt-2 text-center">
            Explorez notre collection et trouvez des pièces uniques
          </p>
          <button
            onClick={() => navigate("/boutique")}
            className="mt-8 h-12 px-8 rounded-full bg-primary hover:bg-[#8E4219] text-primary-foreground text-base font-semibold hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Explorer la boutique
          </button>
        </div>
      ) : (
        <>
          {/* Cart items */}
          <div className="px-6 space-y-4 pb-60">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-background rounded-bento p-4 flex gap-4 items-center shadow-luxury relative"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 sepia-[0.1]"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-muted-foreground">
                    {product.category}
                  </span>
                  <h3 className="font-serif text-sm leading-tight text-inverse-surface truncate">
                    {product.name}
                  </h3>
                  <p className="text-[9px] text-muted-foreground">{product.artisan}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-6 h-6 bg-surface-container rounded-full flex items-center justify-center text-primary"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center text-inverse-surface">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="w-6 h-6 bg-surface-container rounded-full flex items-center justify-center text-primary disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <span className="font-serif text-primary text-base shrink-0">
                  {(product.price * quantity).toLocaleString("fr-FR")}
                </span>
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-[2rem] px-6 pt-6 pb-8"
               style={{ boxShadow: "0 -10px 40px rgba(14,13,13,0.04)" }}>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Sous-total</span>
              <span>{subtotal.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Livraison</span>
              <span className="italic text-xs">Calculée à l'étape suivante</span>
            </div>
            <div className="bg-border/20 h-px my-3" />
            <div className="flex justify-between items-center">
              <span className="font-serif text-xl text-inverse-surface">Total</span>
              <span className="font-serif text-xl text-primary">
                {subtotal.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full h-14 mt-4 rounded-full bg-primary hover:bg-[#8E4219] text-primary-foreground text-base font-semibold hover:opacity-90 active:scale-[0.97] transition-all"
            >
              Procéder au paiement →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
