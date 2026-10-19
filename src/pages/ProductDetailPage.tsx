import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Share2, Heart, Minus, Plus, Check, ChevronLeft, ChevronRight, ChevronRight as Chevron, ShieldCheck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import AppShell from "@/components/AppShell";
import BoutiqueProductCard from "@/components/BoutiqueProductCard";
import ArtisanAvatar from "@/components/ArtisanAvatar";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/hooks/useFavorites";

const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

// Les descriptions peuvent contenir un peu de Markdown (# titre, **gras**)
const blocs = (texte: string) =>
  (texte || "")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => ({ titre: b.startsWith("#"), texte: b.replace(/^#+\s*/, "").replace(/\*\*/g, "") }));

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const favoris = useFavorites("product");
  const [qty, setQty] = useState(1);
  const [ajoute, setAjoute] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [toucheX, setToucheX] = useState<number | null>(null);

  const { data: product, isLoading } = useProduct(slug);
  const { data: tous = [] } = useProducts();

  useEffect(() => {
    setPhoto(0);
    setQty(1);
  }, [slug]);

  const memeCategorie = useMemo(
    () => (product ? tous.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [product, tous]
  );
  const nbOeuvresArtisan = useMemo(
    () => (product ? tous.filter((p) => p.artisanSlug === product.artisanSlug).length : 0),
    [product, tous]
  );

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 pt-6 grid lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] rounded-[20px] bg-sand animate-pulse" />
          <div className="space-y-4 pt-4">
            <div className="h-10 w-3/4 rounded-lg bg-sand animate-pulse" />
            <div className="h-8 w-1/3 rounded-lg bg-sand animate-pulse" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!product) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <p className="text-2xl font-semibold">Cette pièce est introuvable</p>
          <p className="text-ink-soft mt-2">Elle a peut-être été vendue ou retirée.</p>
          <Link to="/boutique" className="mt-6 inline-flex h-12 px-6 items-center rounded-full border border-ink/[0.18] text-ink font-semibold no-underline">
            Retour à la boutique
          </Link>
        </div>
      </AppShell>
    );
  }

  const galerie = product.gallery?.length ? product.gallery : product.image ? [product.image] : [];
  const plusieurs = galerie.length > 1;
  const suivante = () => setPhoto((p) => (p + 1) % galerie.length);
  const precedente = () => setPhoto((p) => (p - 1 + galerie.length) % galerie.length);
  const epuise = product.stock <= 0;
  const aime = favoris.isFavorite(product.id);

  const ajouter = () => {
    if (epuise) return;
    addItem(product, qty);
    setAjoute(true);
    toast.success(`${product.name} ajouté au panier`, { description: qty > 1 ? `Quantité : ${qty}` : undefined });
    setTimeout(() => setAjoute(false), 2000);
  };

  const partager = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié");
      }
    } catch {
      /* partage annulé */
    }
  };

  const boutonPanier = (
    <button
      onClick={ajouter}
      disabled={epuise}
      className={`flex-1 h-[54px] rounded-full text-base font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-40 ${
        ajoute ? "bg-pacte text-white" : "bg-primary text-white hover:bg-[#8E4219]"
      }`}
    >
      {ajoute ? <Check className="w-5 h-5" strokeWidth={2.2} /> : <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.8} />}
      {epuise ? "Épuisée" : ajoute ? "Ajoutée au panier" : "Ajouter au panier"}
    </button>
  );

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 pt-4 md:pt-8 pb-36 md:pb-20">
        <nav aria-label="Fil d'Ariane" className="hidden md:flex items-center gap-2 text-sm text-ink-muted mb-6">
          <Link to="/boutique" className="text-ink-muted no-underline hover:text-primary">Boutique</Link>
          <Chevron className="w-3.5 h-3.5" aria-hidden="true" />
          <Link to={`/boutique?cat=${encodeURIComponent(product.category)}`} className="text-ink-muted no-underline hover:text-primary">{product.category}</Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14 items-start">
          {/* Galerie */}
          <div>
            <div
              className="relative rounded-[20px] overflow-hidden bg-sand"
              onTouchStart={(e) => setToucheX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (toucheX === null || !plusieurs) return;
                const dx = e.changedTouches[0].clientX - toucheX;
                if (dx < -50) suivante();
                else if (dx > 50) precedente();
                setToucheX(null);
              }}
            >
              {galerie.length ? (
                <img src={galerie[photo]} alt={`${product.name}, photo ${photo + 1} sur ${galerie.length}`} className="w-full aspect-[4/5] object-cover" />
              ) : (
                <div className="w-full aspect-[4/5] grid place-items-center text-ink-muted">{product.category}</div>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={partager} aria-label="Partager cette pièce" className="w-11 h-11 rounded-full bg-white text-ink grid place-items-center shadow-[0_2px_10px_rgba(29,23,18,0.14)]">
                  <Share2 className="w-[19px] h-[19px]" strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => favoris.toggle(product.id, product.name)}
                  aria-pressed={aime}
                  aria-label={aime ? "Retirer des favoris" : "Ajouter aux favoris"}
                  className="w-11 h-11 rounded-full bg-white text-ink grid place-items-center shadow-[0_2px_10px_rgba(29,23,18,0.14)]"
                >
                  <Heart className={`w-5 h-5 ${aime ? "fill-primary text-primary" : ""}`} strokeWidth={1.8} />
                </button>
              </div>
              {plusieurs && (
                <>
                  <button onClick={precedente} aria-label="Photo précédente" className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-ink grid place-items-center">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={suivante} aria-label="Photo suivante" className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-ink grid place-items-center">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {plusieurs && (
              <div className="flex gap-2 overflow-x-auto mt-3" role="tablist" aria-label="Photos">
                {galerie.map((src, i) => (
                  <button
                    key={src}
                    role="tab"
                    aria-selected={i === photo}
                    aria-label={`Photo ${i + 1}`}
                    onClick={() => setPhoto(i)}
                    className={`shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-opacity ${i === photo ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="lg:sticky lg:top-28">
            <Link
              to={`/boutique?cat=${encodeURIComponent(product.category)}`}
              className="inline-flex items-center h-[30px] px-3 rounded-full bg-sand text-ink-soft text-[13px] font-semibold no-underline hover:bg-[#E9DFD4]"
            >
              {product.category}
            </Link>
            <h1 className="mt-3.5 mb-0 text-[30px] md:text-[44px] leading-[1.06] tracking-[-0.03em] font-[650]">{product.name}</h1>
            <p className="mt-2.5 md:mt-4 text-[26px] md:text-[32px] font-bold tracking-tight">{fcfa(product.price)}</p>
            {epuise ? (
              <p className="mt-2.5 text-sm font-semibold text-coral-ink">Épuisée pour le moment</p>
            ) : (
              <p className="mt-2.5 flex items-center gap-2 text-sm font-semibold text-pacte">
                <ShieldCheck className="w-[18px] h-[18px]" strokeWidth={1.8} />
                {product.stock} en stock, vérifiée par l'équipe PACTE
              </p>
            )}

            <div className="hidden md:flex items-center gap-3 mt-7">
              <div className="flex items-center h-[54px] rounded-full border border-ink/[0.16] bg-white px-1.5">
                <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="Diminuer la quantité" className="w-11 h-11 grid place-items-center rounded-full disabled:opacity-30">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold" aria-live="polite">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} disabled={qty >= product.stock} aria-label="Augmenter la quantité" className="w-11 h-11 grid place-items-center rounded-full disabled:opacity-30">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {boutonPanier}
            </div>

            <Link
              to={`/artisans/${product.artisanSlug}`}
              className="mt-6 md:mt-8 flex items-center gap-3.5 p-3 rounded-[18px] bg-white border border-ink/[0.08] text-ink no-underline hover:border-ink/20 transition-colors"
            >
              <ArtisanAvatar src={product.artisanAvatar} initials={product.artisan.split(" ").map((w) => w[0]).slice(0, 2).join("")} accentColor="#A84F1F" name={product.artisan} className="w-14 h-14 rounded-full shrink-0" />
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-base font-semibold">{product.artisan}</span>
                <span className="text-sm text-ink-muted truncate">
                  {[product.artisanMetier, product.artisanLocation].filter(Boolean).join(" à ")} · {nbOeuvresArtisan} création{nbOeuvresArtisan > 1 ? "s" : ""}
                </span>
              </span>
              <Chevron className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            </Link>

            {product.description && (
              <>
                <h2 className="mt-8 mb-0 text-xl tracking-[-0.02em] font-semibold">L'histoire de la pièce</h2>
                <div className="mt-2.5 space-y-3 max-w-prose">
                  {blocs(product.description).map((b, i) =>
                    b.titre ? (
                      <h3 key={i} className="m-0 text-base font-semibold">{b.texte}</h3>
                    ) : (
                      <p key={i} className="m-0 text-base leading-relaxed text-[#3F352E] whitespace-pre-line">{b.texte}</p>
                    )
                  )}
                </div>
              </>
            )}

            <dl className="mt-6 flex flex-col border-t border-ink/10">
              <div className="flex gap-3.5 py-3.5 border-b border-ink/10">
                <dt className="basis-[104px] shrink-0 text-sm font-semibold">Paiement</dt>
                <dd className="m-0 text-sm leading-normal text-ink-soft">Wave, Orange Money, MTN MoMo ou Moov Money, avec le numéro de votre compte</dd>
              </div>
              <div className="flex gap-3.5 py-3.5 border-b border-ink/10">
                <dt className="basis-[104px] shrink-0 text-sm font-semibold">Livraison</dt>
                <dd className="m-0 text-sm leading-normal text-ink-soft">L'équipe PACTE vous appelle après la commande pour l'organiser</dd>
              </div>
            </dl>
          </div>
        </div>

        {memeCategorie.length > 0 && (
          <section className="mt-14 md:mt-20">
            <div className="flex justify-between items-end gap-4 mb-5 md:mb-7">
              <h2 className="m-0 text-xl md:text-[28px] tracking-[-0.02em] font-semibold">Autres créations en {product.category.toLowerCase()}</h2>
              <Link to={`/boutique?cat=${encodeURIComponent(product.category)}`} className="text-[15px] font-semibold no-underline hover:underline underline-offset-4 whitespace-nowrap">Tout voir</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-8">
              {memeCategorie.map((p) => <BoutiqueProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* Mobile : barre d'achat toujours visible, au-dessus des onglets */}
      <div className="md:hidden fixed inset-x-0 bottom-[68px] z-40 px-4 py-3 bg-white border-t border-ink/10 flex items-center gap-3.5 shadow-[0_-6px_20px_rgba(29,23,18,0.06)]">
        <span className="flex flex-col">
          <span className="text-[13px] text-ink-muted">Prix</span>
          <span className="text-[19px] font-bold whitespace-nowrap">{fcfa(product.price)}</span>
        </span>
        {boutonPanier}
      </div>
    </AppShell>
  );
};

export default ProductDetailPage;
