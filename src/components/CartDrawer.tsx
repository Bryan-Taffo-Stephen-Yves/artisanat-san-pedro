import { Link } from "react-router-dom";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface Props { open: boolean; onClose: () => void; }

const CartDrawer = ({ open, onClose }: Props) => {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-inverse-surface/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-[91] w-full sm:w-[420px] bg-background flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/20">
              <h2 className="font-serif italic text-xl text-inverse-surface">Mon Panier</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-inverse-surface" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-full py-16">
                  <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="font-serif italic text-lg text-inverse-surface">Votre panier est vide</p>
                  <p className="text-sm text-muted-foreground mt-1">Découvrez nos artisans</p>
                  <Link
                    to="/boutique"
                    onClick={onClose}
                    className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold"
                  >
                    Explorer la boutique
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex gap-3">
                      <img src={product.image} alt={product.name} className="w-20 h-20 rounded-md object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif italic text-inverse-surface truncate">{product.name}</p>
                        <p className="text-[13px] font-semibold text-muted-foreground">{product.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 border border-border/30 rounded-full px-1">
                            <button
                              onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                              className="w-6 h-6 flex items-center justify-center text-primary"
                              aria-label="Diminuer"
                            >−</button>
                            <span className="text-sm w-6 text-center">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-primary"
                              aria-label="Augmenter"
                            >+</button>
                          </div>
                          <p className="text-sm font-bold text-primary">{(product.price * quantity).toLocaleString("fr-FR")} FCFA</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        aria-label="Retirer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/20 px-6 py-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-muted-foreground">Total</span>
                  <span className="font-serif italic text-xl text-inverse-surface">{subtotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="block text-center py-3 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold"
                >
                  Procéder au paiement
                </Link>
                <Link
                  to="/panier"
                  onClick={onClose}
                  className="block text-center py-2 text-[13px] font-semibold text-muted-foreground hover:text-primary"
                >
                  Voir le panier complet
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;