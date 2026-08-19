import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Share2, Heart, Star, Minus, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem, scaleReveal } from "@/lib/motionVariants";
import Footer from "@/components/Footer";
import BrandBar from "@/components/BrandBar";

const TABS = ["Description", "Livraison", "Avis"] as const;
type Tab = typeof TABS[number];

const mockReviews = [
  { name: "Marie L.", rating: 5, text: "Une pièce magnifique, le travail est d'une finesse incroyable. L'emballage était soigné.", date: "Mars 2026" },
  { name: "Jean-Pierre K.", rating: 4, text: "Très belle qualité artisanale. Livraison un peu longue mais le résultat en vaut la peine.", date: "Février 2026" },
  { name: "Aïcha D.", rating: 5, text: "Exactement ce que je cherchais. L'artisan a même ajouté un petit mot personnel.", date: "Janvier 2026" },
];

const paymentMethods = ["Wave", "Orange Money", "MTN MoMo", "Stripe", "PayPal"];

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [liked, setLiked] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const { data: product, isLoading } = useProduct(slug);
  const { data: allProducts = [] } = useProducts();

  useEffect(() => {
    setActivePhoto(0);
  }, [slug]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = allProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    );
    const others = allProducts.filter(
      (p) => p.category !== product.category && p.id !== product.id
    );
    return [...sameCategory, ...others].slice(0, 6);
  }, [product, allProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-6">
        <div className="aspect-[4/5] rounded-bento bg-surface-container-low animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-serif text-2xl italic text-muted-foreground">Œuvre introuvable</p>
          <button
            onClick={() => navigate("/boutique")}
            className="mt-4 inline-flex items-center justify-center h-10 px-6 rounded-full border border-secondary/20 text-primary uppercase tracking-widest text-[0.7rem] font-bold hover:bg-primary/5 transition-colors"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : (product.image ? [product.image] : []);
  const hasMultiple = gallery.length > 1;

  const goNext = () => setActivePhoto((p) => (p + 1) % gallery.length);
  const goPrev = () => setActivePhoto((p) => (p - 1 + gallery.length) % gallery.length);

  const handleAddToCart = () => {
    setAdded(true);
    addItem(product, qty);
    toast.success(`${product.name} ajouté au panier`, {
      description: `Quantité : ${qty}`,
    });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Nav */}
      <header className="glass-card fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-inverse-surface" />
        </button>
        <Link to="/" className="font-serif text-base italic text-inverse-surface tracking-tight hover:text-primary transition-colors">
          Mains de San Pedro
        </Link>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors">
          <Share2 className="w-[18px] h-[18px] text-inverse-surface" />
        </button>
      </header>

      {/* SECTION 1 — Photo Gallery (carousel) */}
      <div className="pt-[72px] px-4">
        <ScrollReveal variants={scaleReveal} className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden">
          {gallery.length > 0 ? (
            <motion.img
              key={activePhoto}
              src={gallery[activePhoto]}
              alt={`${product.name} - photo ${activePhoto + 1}`}
              width={800}
              height={1000}
              className="w-full h-full object-cover brightness-[0.95] sepia-[0.15] touch-pan-y"
              drag={hasMultiple ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) goNext();
                else if (info.offset.x > 60) goPrev();
              }}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "#E8E0D5" }}>
              <span className="font-serif italic text-muted-foreground">{product.category}</span>
            </div>
          )}

          <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
            {product.badge ? (
              <span className="glass-card px-4 py-1.5 rounded-full text-primary font-bold uppercase text-[10px] pointer-events-auto">
                {product.badge}
              </span>
            ) : <span />}
            <button
              onClick={() => setLiked(!liked)}
              className="glass-card w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto"
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-primary text-primary" : "text-inverse-surface"}`} />
            </button>
          </div>

          {/* Arrow buttons */}
          {hasMultiple && (
            <>
              <button
                onClick={goPrev}
                aria-label="Photo précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 glass-card w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              >
                <ChevronLeft className="w-5 h-5 text-inverse-surface" />
              </button>
              <button
                onClick={goNext}
                aria-label="Photo suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 glass-card w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              >
                <ChevronRight className="w-5 h-5 text-inverse-surface" />
              </button>
            </>
          )}

          {/* Pagination dots */}
          {hasMultiple && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`h-1 rounded-full transition-all ${i === activePhoto ? "w-8 bg-primary-foreground" : "w-1.5 bg-primary-foreground/40"}`}
                />
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Thumbnails row */}
        {hasMultiple && (
          <div className="flex gap-2 overflow-x-auto pb-1 mt-3">
            {gallery.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activePhoto ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={photo} alt={`miniature ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2 — Product Info */}
      <div className="px-6 mt-6 space-y-6">
        {/* Name + Category */}
        <ScrollReveal delay={0.1}>
          <span className="label-caps text-[10px] text-muted-foreground">{product.category}</span>
          <h1 className="font-serif text-4xl italic text-inverse-surface leading-tight mt-1">
            {product.name}
          </h1>
        </ScrollReveal>

        {/* Ratings + Stock */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-primary text-primary" : "text-border"}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">({product.reviews} avis)</span>
          </div>
          {product.stock <= 2 && (
            <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-[10px] font-bold uppercase">
              Plus que {product.stock} en stock
            </span>
          )}
        </div>

        {/* Price */}
        <ScrollReveal delay={0.2}>
          <p className="font-serif text-3xl italic text-primary">
            {product.price.toLocaleString("fr-FR")} <span className="text-base not-italic">FCFA</span>
          </p>
        </ScrollReveal>

        {/* Artisan Card */}
        <ScrollReveal delay={0.3} className="bg-surface-container-low p-5 rounded-bento flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={product.artisanAvatar}
              alt={product.artisan}
              loading="lazy"
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover border-2 border-background"
            />
            <div>
              <p className="font-serif text-lg text-inverse-surface">{product.artisan}</p>
              <p className="text-xs text-muted-foreground">
                {product.artisanMetier} · {product.artisanLocation}
              </p>
            </div>
          </div>
          <Link
            to={`/artisans/${product.artisanSlug}`}
            className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline shrink-0"
          >
            Voir →
          </Link>
        </ScrollReveal>

        {/* Tabs */}
        <ScrollReveal>
          <div className="flex gap-6 border-b border-border/20 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Description" && (
            <p className="text-sm text-muted-foreground font-light leading-relaxed animate-fade-in">
              {product.description}
            </p>
          )}

          {activeTab === "Livraison" && (
            <div className="text-sm text-muted-foreground font-light leading-relaxed space-y-3 animate-fade-in">
              <p>📦 <strong className="font-medium text-inverse-surface">Délai de livraison :</strong> 5 à 10 jours ouvrés selon votre localisation.</p>
              <p>🎁 <strong className="font-medium text-inverse-surface">Emballage :</strong> Chaque pièce est soigneusement emballée dans un écrin artisanal avec protection renforcée.</p>
              <p>🌍 <strong className="font-medium text-inverse-surface">Zones desservies :</strong> Côte d'Ivoire, Afrique de l'Ouest, France, Belgique, Canada.</p>
              <p>💳 <strong className="font-medium text-inverse-surface">Paiement :</strong> Wave, Orange Money, MTN MoMo, Stripe et PayPal acceptés.</p>
            </div>
          )}

          {activeTab === "Avis" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-serif text-2xl text-primary">{product.rating}</span>
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating) ? "fill-primary text-primary" : "text-border"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{product.reviews} avis</p>
                </div>
              </div>
              {mockReviews.map((r, i) => (
                <div key={i} className="bg-surface-container-low p-4 rounded-bento">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-3 h-3 ${j < r.rating ? "fill-primary text-primary" : "text-border"}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{r.date}</span>
                  </div>
                  <p className="text-sm text-inverse-surface font-medium mb-1">{r.name}</p>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Payment methods */}
        <div className="flex gap-2 flex-wrap">
          {paymentMethods.map((m) => (
            <span key={m} className="bg-surface-container text-muted-foreground text-[9px] uppercase px-3 py-1 rounded-full">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* SECTION 3 — Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-surface-container-low py-10 px-6 mt-8">
          <h2 className="font-serif italic text-2xl text-inverse-surface mb-6">Vous aimerez aussi</h2>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {relatedProducts.map((rp) => (
              <motion.div key={rp.id} variants={staggerItem}>
              <Link to={`/boutique/${rp.slug}`} className="group block">
                <div className="aspect-square rounded-bento overflow-hidden mb-2">
                  <img
                    src={rp.image}
                    alt={rp.name}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover brightness-[0.95] sepia-[0.1] group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="font-serif text-sm text-inverse-surface leading-snug line-clamp-1">{rp.name}</p>
                <p className="font-serif text-primary text-sm mt-0.5">
                  {rp.price.toLocaleString("fr-FR")} FCFA
                </p>
              </Link>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-8 flex justify-center">
            <Link
              to="/boutique"
              className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-secondary/20 text-primary uppercase tracking-widest text-[0.7rem] font-bold hover:bg-primary/5 transition-colors"
            >
              Voir toute la boutique →
            </Link>
          </div>
        </div>
      )}

      <Footer />
      <BrandBar />

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 w-full z-50 glass-card backdrop-blur-xl px-6 py-6 flex items-center gap-4 border-t border-border/10"
           style={{ boxShadow: "0 -10px 40px rgba(14,13,13,0.04)" }}>
        {/* Quantity selector */}
        <div className="flex items-center bg-surface-container rounded-full px-2 py-1">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="w-10 h-10 flex items-center justify-center text-primary disabled:opacity-30 transition-opacity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-bold text-inverse-surface">{qty}</span>
          <button
            onClick={() => setQty(Math.min(product.stock, qty + 1))}
            disabled={qty >= product.stock}
            className="w-10 h-10 flex items-center justify-center text-primary disabled:opacity-30 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 uppercase tracking-widest text-[0.7rem] font-bold transition-all active:scale-[0.97] ${
            added
              ? "bg-green-600 text-primary-foreground"
              : "bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground hover:opacity-90"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Ajouté !
            </>
          ) : (
            "Ajouter au panier"
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
