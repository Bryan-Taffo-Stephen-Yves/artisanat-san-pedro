import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, X, Check, Loader2, AlertTriangle, Image as ImageIcon, Plus, Star, Eye, EyeOff, Clock } from "lucide-react";
import { toast } from "sonner";
import { IMG } from "@/lib/image";
import { compressImage } from "@/lib/compressImage";
import { adminApi, isMissingFunction } from "@/lib/admin";

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
  status: "pending" | "approved" | "rejected";
  published: boolean;
  moderation_note: string | null;
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
  // Mode admin : lecture de tous les produits via la fonction sécurisée
  adminCode?: string;
  onChange?: () => void;
}

const CATEGORIES = [
  "Sculpture", "Tressage", "Tissage", "Peinture",
  "Bijouterie", "Botterie", "Accessoires", "Sérigraphie",
];

const ProductManager = ({ artisanId, title = "Gestion des produits", adminCode, onChange }: Props) => {
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
      let data: any[] = [];
      if (adminCode) {
        try {
          data = await adminApi.produits(adminCode);
        } catch (e: any) {
          if (!isMissingFunction(e.message)) throw e;
          // Base pas encore à jour : lecture classique de tous les produits
          const fb = await (supabase as any)
            .from("products").select("*, artisans(name)")
            .order("created_at", { ascending: false });
          if (fb.error) throw fb.error;
          data = fb.data ?? [];
        }
      } else if (artisanId) {
        // Inclut les produits en attente / refusés de l'artisan
        const res = await (supabase as any).rpc("artisan_produits", { p_artisan_id: artisanId });
        if (!res.error) {
          data = res.data ?? [];
        } else {
          // Base pas encore mise à jour : lecture classique (produits publiés)
          const fb = await (supabase as any)
            .from("products").select("*").eq("artisan_id", artisanId)
            .order("created_at", { ascending: false });
          if (fb.error) throw fb.error;
          data = fb.data ?? [];
        }
      }
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
        artisan_name: row.artisan_name ?? row.artisans?.name ?? "",
        status: row.status ?? "approved",
        published: row.published ?? true,
        moderation_note: row.moderation_note ?? null,
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
  }, [artisanId, adminCode]);

  const refresh = () => {
    loadProducts();
    onChange?.();
  };

  const toggleVisibility = async (p: ManagedProduct) => {
    if (!adminCode) return;
    try {
      await adminApi.moderer(adminCode, p.id, p.published ? "hide" : "show");
      toast.success(p.published ? "Produit masqué du site" : "Produit de nouveau visible");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

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
      refresh();
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
      refresh();
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
      refresh();
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
      refresh();
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
      refresh();
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
      <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>

      {products.length === 0 ? (
        <p className="text-[15px] text-ink-soft">Aucune création pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-ink/[0.08] rounded-[18px] p-3.5 md:p-4"
            >
              {editingId === p.id ? (
                /* ---------- EDIT MODE ---------- */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nom du produit"
                    className="w-full bg-white rounded-xl px-3.5 h-12 text-base border border-ink/[0.14] focus:border-primary focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="Prix (FCFA)"
                      className="flex-1 bg-white rounded-xl px-3.5 h-12 text-base border border-ink/[0.14] focus:border-primary focus:outline-none"
                    />
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      placeholder="Stock"
                      className="w-24 bg-white rounded-xl px-3.5 h-12 text-base border border-ink/[0.14] focus:border-primary focus:outline-none"
                    />
                  </div>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white rounded-xl px-3.5 h-12 text-base border border-ink/[0.14] focus:border-primary focus:outline-none"
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
                    className="w-full bg-white rounded-xl px-3.5 py-3 text-base border border-ink/[0.14] focus:border-primary focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="h-11 px-4 rounded-full text-sm font-semibold text-muted-foreground hover:bg-muted/50 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Annuler
                    </button>
                    <button
                      onClick={() => saveEdit(p.id)}
                      disabled={saving}
                      className="h-11 px-4 rounded-full text-sm font-semibold bg-primary text-primary-foreground flex items-center gap-1 disabled:opacity-50"
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
                      className="h-11 px-4 rounded-full text-sm font-semibold text-muted-foreground hover:bg-muted/50"
                    >
                      Non
                    </button>
                    <button
                      onClick={() => confirmDelete(p.id)}
                      disabled={saving}
                      className="h-11 px-4 rounded-full text-sm font-semibold bg-destructive text-white flex items-center gap-1 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Oui, supprimer
                    </button>
                  </div>
                </div>
              ) : (
                /* ---------- NORMAL ROW ---------- */
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-sand shrink-0">
                    {p.image_url ? (
                      <img src={IMG.thumb(p.image_url)} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "#E8E0D5" }}>
                        <span className="text-[8px] text-muted-foreground text-center px-1">{p.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold truncate">{p.name}</p>
                    {p.status === "pending" && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-tint text-amber-ink text-xs font-semibold">
                        <Clock className="w-3 h-3" /> En validation
                      </span>
                    )}
                    {p.status === "rejected" && (
                      <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-coral-tint text-coral-ink text-xs font-semibold">Refusée</span>
                    )}
                    {p.status === "approved" && !p.published && (
                      <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-sand text-ink-soft text-xs font-semibold">Masquée du site</span>
                    )}
                    <p className="text-[13px] text-ink-soft mt-1">
                      {p.price.toLocaleString("fr-FR")} FCFA · Stock {p.stock}
                      {!artisanId && p.artisan_name ? ` · ${p.artisan_name}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {adminCode && p.status === "approved" && (
                      <button
                        onClick={() => toggleVisibility(p)}
                        aria-label={p.published ? `Masquer ${p.name} du site` : `Réafficher ${p.name}`}
                        title={p.published ? "Masquer du site" : "Réafficher"}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-foreground hover:bg-muted/50"
                      >
                        {p.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => setManagingPhotosId(managingPhotosId === p.id ? null : p.id)}
                      aria-label={`Photos de ${p.name}`}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-foreground hover:bg-muted/50"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEdit(p)}
                      aria-label={`Modifier ${p.name}`}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-primary hover:bg-primary/10"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(p.id)}
                      aria-label={`Supprimer ${p.name}`}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {p.status === "rejected" && editingId !== p.id && deletingId !== p.id && (
                <div className="mt-3 p-3 rounded-xl bg-coral-tint">
                  <p className="text-sm text-coral-ink leading-normal">
                    <span className="font-semibold">Motif : </span>
                    {p.moderation_note || "la création ne respecte pas les critères de la boutique."}
                  </p>
                  {!adminCode && (
                    <>
                      <p className="text-[13px] text-coral-ink/90 mt-1">Corrigez-la : elle repart automatiquement en validation.</p>
                      <button
                        onClick={() => setManagingPhotosId(p.id)}
                        className="mt-2.5 h-11 px-4 rounded-full bg-white text-coral-ink text-sm font-semibold inline-flex items-center gap-1.5 border border-coral-ink/20"
                      >
                        <ImageIcon className="w-4 h-4" /> Reprendre la photo
                      </button>
                    </>
                  )}
                </div>
              )}

              {managingPhotosId === p.id && (
                <div className="mt-3 pt-3 border-t border-ink/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[15px] font-semibold">Photos</p>
                    <label className="cursor-pointer h-11 px-4 rounded-full bg-primary text-white text-[15px] font-semibold flex items-center gap-1.5">
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
                          <img src={IMG.thumb(url)} alt={`photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                          {p.image_url === url && (
                            <span className="absolute top-1 left-1 bg-primary text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
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
