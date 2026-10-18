import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, X, Check, Loader2, AlertTriangle, Image as ImageIcon, Plus, Star } from "lucide-react";
import { toast } from "sonner";

async function compressImage(file: File, maxSize = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target?.result as string; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = (height / width) * maxSize; width = maxSize; }
        else { width = (width / height) * maxSize; height = maxSize; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no ctx"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("compression failed")),
        "image/jpeg", quality
      );
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ManagedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  image_url: string;
  gallery: string[];
  artisan_name?: string;
}

interface EditForm {
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
}

interface Props {
  // If artisanId is provided → only that artisan's products (dashboard mode).
  // If undefined → all products (admin mode).
  artisanId?: string;
  title?: string;
}

const CATEGORIES = [
  "Sculpture", "Tressage", "Tissage", "Poterie", "Peinture",
  "Bijouterie", "Botterie", "Accessoires", "Sérigraphie",
];

const ProductManager = ({ artisanId, title = "Gestion des produits" }: Props) => {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({ name: "", price: 0, description: "", stock: 0, category: "" });
  const [managingPhotosId, setManagingPhotosId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("products")
        .select("*, artisans(name)")
        .order("created_at", { ascending: false });
      if (artisanId) query = query.eq("artisan_id", artisanId);
      const { data, error } = await query;
      if (error) throw error;
      const mapped: ManagedProduct[] = (data ?? []).map((row: any) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        price: row.price,
        description: row.description ?? "",
        stock: row.stock ?? 0,
        category: row.category,
        image_url: row.image_url ?? "",
        gallery: Array.isArray(row.gallery) ? row.gallery : (row.image_url ? [row.image_url] : []),
        artisan_name: row.artisans?.name ?? "",
      }));
      setProducts(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artisanId]);

  const startEdit = (p: ManagedProduct) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: p.price, description: p.description, stock: p.stock, category: p.category });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: 0, description: "", stock: 0, category: "" });
  };

  const saveEdit = async (id: string) => {
    if (!form.name || form.price == null) {
      toast.error("Le nom et le prix sont obligatoires");
      return;
    }
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("products")
        .update({
          name: form.name,
          price: Number(form.price),
          description: form.description ?? "",
          stock: Number(form.stock ?? 0),
          category: form.category,
        })
        .eq("id", id);
      if (error) throw error;
      toast.success("Produit modifié");
      setEditingId(null);
      setForm({ name: "", price: 0, description: "", stock: 0, category: "" });
      loadProducts();
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await (supabase as any).from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Produit supprimé");
      setDeletingId(null);
      loadProducts();
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhotos = async (product: ManagedProduct, files: FileList) => {
    if (!files || files.length === 0) return;
    setUploadingPhoto(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const compressed = await compressImage(file);
        const path = `products/${product.slug}-${Date.now()}-${i}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("artisan-images")
          .upload(path, compressed, { contentType: "image/jpeg", upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("artisan-images").getPublicUrl(path);
        newUrls.push(pub.publicUrl);
      }
      if (newUrls.length === 0) { toast.error("Aucune image valide"); return; }
      const updatedGallery = [...product.gallery, ...newUrls];
      const newCover = product.image_url || newUrls[0];
      const { error } = await (supabase as any)
        .from("products")
        .update({ gallery: updatedGallery, image_url: newCover })
        .eq("id", product.id);
      if (error) throw error;
      toast.success(`${newUrls.length} photo(s) ajoutée(s)`);
      loadProducts();
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'ajout des photos");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (product: ManagedProduct, url: string) => {
    try {
      const updatedGallery = product.gallery.filter((g) => g !== url);
      let newCover = product.image_url;
      if (product.image_url === url) newCover = updatedGallery[0] || "";
      const { error } = await (supabase as any)
        .from("products")
        .update({ gallery: updatedGallery, image_url: newCover })
        .eq("id", product.id);
      if (error) throw error;
      toast.success("Photo supprimée");
      loadProducts();
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression de la photo");
    }
  };

  const handleSetCover = async (product: ManagedProduct, url: string) => {
    try {
      const { error } = await (supabase as any)
        .from("products")
        .update({ image_url: url })
        .eq("id", product.id);
      if (error) throw error;
      toast.success("Photo principale définie");
      loadProducts();
    } catch (e) {
      console.error(e);
      toast.error("Erreur");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl italic text-foreground">{title}</h2>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun produit.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-surface-container-low rounded-xl p-4"
            >
              {editingId === p.id ? (
                /* ---------- EDIT MODE ---------- */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nom du produit"
                    className="w-full bg-background rounded-lg px-3 py-2 text-sm border border-border/30 focus:border-primary focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="Prix (FCFA)"
                      className="flex-1 bg-background rounded-lg px-3 py-2 text-sm border border-border/30 focus:border-primary focus:outline-none"
                    />
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      placeholder="Stock"
                      className="w-24 bg-background rounded-lg px-3 py-2 text-sm border border-border/30 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-background rounded-lg px-3 py-2 text-sm border border-border/30 focus:border-primary focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description"
                    rows={3}
                    className="w-full bg-background rounded-lg px-3 py-2 text-sm border border-border/30 focus:border-primary focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="px-4 py-2 rounded-full text-xs uppercase tracking-widest text-muted-foreground hover:bg-muted/50 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Annuler
                    </button>
                    <button
                      onClick={() => saveEdit(p.id)}
                      disabled={saving}
                      className="px-4 py-2 rounded-full text-xs uppercase tracking-widest bg-primary text-primary-foreground flex items-center gap-1 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Enregistrer
                    </button>
                  </div>
                </div>
              ) : deletingId === p.id ? (
                /* ---------- DELETE CONFIRM ---------- */
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-sm text-foreground">Supprimer « {p.name} » ? Cette action est définitive.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setDeletingId(null)}
                      disabled={saving}
                      className="px-3 py-2 rounded-full text-xs uppercase tracking-widest text-muted-foreground hover:bg-muted/50"
                    >
                      Non
                    </button>
                    <button
                      onClick={() => confirmDelete(p.id)}
                      disabled={saving}
                      className="px-3 py-2 rounded-full text-xs uppercase tracking-widest bg-destructive text-white flex items-center gap-1 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Oui, supprimer
                    </button>
                  </div>
                </div>
              ) : (
                /* ---------- NORMAL ROW ---------- */
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container shrink-0">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#E8E0D5" }}>
                        <span className="text-[8px] text-muted-foreground text-center px-1">{p.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.price.toLocaleString("fr-FR")} FCFA · Stock {p.stock}
                      {!artisanId && p.artisan_name ? ` · ${p.artisan_name}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setManagingPhotosId(managingPhotosId === p.id ? null : p.id)}
                      className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-foreground hover:bg-muted/50"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEdit(p)}
                      className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-primary hover:bg-primary/10"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(p.id)}
                      className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {managingPhotosId === p.id && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Photos du produit</p>
                    <label className="cursor-pointer px-3 py-2 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-widest flex items-center gap-1">
                      {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Ajouter
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploadingPhoto}
                        onChange={(e) => { if (e.target.files) handleAddPhotos(p, e.target.files); e.target.value = ""; }}
                      />
                    </label>
                  </div>
                  {p.gallery.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucune photo. Ajoutez-en une.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {p.gallery.map((url, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-surface-container">
                          <img src={url} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                          {p.image_url === url && (
                            <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[8px] uppercase px-1.5 py-0.5 rounded-full">
                              Principale
                            </span>
                          )}
                          <div className="absolute inset-0 bg-inverse-surface/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {p.image_url !== url && (
                              <button
                                onClick={() => handleSetCover(p, url)}
                                title="Définir comme principale"
                                className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center text-primary"
                              >
                                <Star className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePhoto(p, url)}
                              title="Supprimer"
                              className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductManager;
