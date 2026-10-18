import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, User, Package, ChevronRight, LogOut, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AppShell from "@/components/AppShell";
import BoutiqueProductCard from "@/components/BoutiqueProductCard";
import ArtisanAvatar from "@/components/ArtisanAvatar";
import { useAuth, fetchProfile, type ClientProfile } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useProducts } from "@/hooks/useProducts";
import { useArtisans } from "@/hooks/useArtisans";
import { ORDER_STATUS_LABEL } from "@/lib/admin";
import { IMG } from "@/lib/image";
import { compressImage } from "@/lib/compressImage";

const inputClass =
  "bg-[hsl(var(--surface-container-low))] rounded-xl px-4 py-3 w-full border-none text-sm text-foreground focus:ring-1 focus:ring-primary outline-none";
const labelClass = "text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block";
const primaryBtn =
  "w-full h-12 inline-flex items-center justify-center gap-2 bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition disabled:opacity-60";

const authErrorFr = (msg: string) => {
  if (/Invalid login credentials/i.test(msg)) return "E-mail ou mot de passe incorrect.";
  if (/Email not confirmed/i.test(msg)) return "Confirmez d'abord votre adresse e-mail (lien reçu par e-mail).";
  if (/already registered|already been registered/i.test(msg)) return "Un compte existe déjà avec cet e-mail : connectez-vous.";
  if (/Password should be at least/i.test(msg)) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (/rate limit/i.test(msg)) return "Trop de tentatives, réessayez dans quelques minutes.";
  return "Une erreur est survenue. Réessayez.";
};

/* ─────────────── CONNEXION / INSCRIPTION ─────────────── */
const AuthPanel = () => {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const redirect = `${window.location.origin}/mon-espace`;
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
        if (error) throw error;
      } else if (mode === "signup") {
        if (!form.name.trim()) throw new Error("name");
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: redirect,
            data: { full_name: form.name.trim(), phone: form.phone.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("Compte créé ! Ouvrez l'e-mail de confirmation que nous venons d'envoyer, puis connectez-vous.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: redirect });
        if (error) throw error;
        setInfo("Si un compte existe pour cet e-mail, vous allez recevoir un lien pour choisir un nouveau mot de passe.");
      }
    } catch (err: any) {
      setError(err?.message === "name" ? "Indiquez votre nom." : authErrorFr(err?.message ?? ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-6 pt-24 pb-16 max-w-md mx-auto">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Mon espace</p>
      <h1 className="font-serif text-4xl italic text-foreground mt-1">
        {mode === "signup" ? "Créer un compte" : mode === "reset" ? "Mot de passe oublié" : "Se connecter"}
      </h1>
      <p className="text-sm text-muted-foreground font-light mt-2">
        Suivez vos commandes, retrouvez vos artisans et créations favoris, et payez plus vite.
      </p>

      {mode !== "reset" && (
        <div className="flex gap-2 mt-6 bg-surface-container-low rounded-full p-1" role="tablist">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setError(null); setInfo(null); }}
              className={`flex-1 h-10 rounded-full text-[10px] uppercase tracking-widest font-bold transition ${mode === m ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              {m === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4 mt-6">
        {mode === "signup" && (
          <>
            <div>
              <label htmlFor="name" className={labelClass}>Nom complet</label>
              <input id="name" autoComplete="name" value={form.name} onChange={set("name")} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Téléphone (Mobile Money)</label>
              <input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="07 00 00 00 00" value={form.phone} onChange={set("phone")} className={inputClass} />
            </div>
          </>
        )}
        <div>
          <label htmlFor="email" className={labelClass}>E-mail</label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} required />
        </div>
        {mode !== "reset" && (
          <div>
            <label htmlFor="password" className={labelClass}>Mot de passe {mode === "signup" && "(6 caractères minimum)"}</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              value={form.password}
              onChange={set("password")}
              className={inputClass}
              required
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        {info && <p className="text-sm text-green-700 bg-green-50 rounded-xl p-3" role="status">{info}</p>}

        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Recevoir le lien"}
        </button>
      </form>

      <div className="mt-4 text-center">
        {mode === "login" && (
          <button onClick={() => { setMode("reset"); setError(null); setInfo(null); }} className="text-xs text-muted-foreground underline underline-offset-4">
            Mot de passe oublié ?
          </button>
        )}
        {mode === "reset" && (
          <button onClick={() => setMode("login")} className="text-xs text-muted-foreground underline underline-offset-4">
            Retour à la connexion
          </button>
        )}
      </div>

      <Link to="/espace-artisan/login" className="mt-10 flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        Vous êtes artisan ? Espace artisan <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
};

/* ─────────────── COMMANDES ─────────────── */
interface OrderRow {
  id: string;
  reference: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { product_name: string; product_image: string | null; quantity: number }[];
}

const statusStyle = (s: string) =>
  s === "delivered" ? "bg-green-100 text-green-800"
  : s === "shipped" ? "bg-blue-100 text-blue-800"
  : s === "paid" || s === "preparing" ? "bg-amber-100 text-amber-800"
  : s === "cancelled" || s === "failed" ? "bg-red-100 text-red-800"
  : "bg-muted text-muted-foreground";

/* ─────────────── ESPACE CONNECTÉ ─────────────── */
const tabs = ["Commandes", "Favoris", "Profil"] as const;

const ClientDashboard = ({ userId, email }: { userId: string; email: string }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Commandes");

  const { data: profile } = useQuery({ queryKey: ["profile", userId], queryFn: () => fetchProfile(userId) });
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", userId],
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await (supabase as any)
        .from("orders")
        .select("id, reference, status, total, created_at, order_items(product_name, product_image, quantity)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const favArtisans = useFavorites("artisan");
  const favProducts = useFavorites("product");
  const { data: allProducts = [] } = useProducts();
  const { data: allArtisans = [] } = useArtisans();
  const favoriteProducts = useMemo(() => allProducts.filter((p) => favProducts.ids.includes(p.id)), [allProducts, favProducts.ids]);
  const favoriteArtisans = useMemo(() => allArtisans.filter((a) => favArtisans.ids.includes(a.id)), [allArtisans, favArtisans.ids]);

  const spent = orders
    .filter((o) => ["paid", "preparing", "shipped", "delivered"].includes(o.status))
    .reduce((s, o) => s + o.total, 0);
  const firstName = (profile?.full_name || email.split("@")[0]).split(" ")[0];

  /* Profil */
  const [form, setForm] = useState({ full_name: "", phone: "", delivery_address: "", delivery_city: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        delivery_address: profile.delivery_address ?? "",
        delivery_city: profile.delivery_city ?? "",
      });
    }
  }, [profile]);

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await (supabase as any).from("profiles").update({
      full_name: form.full_name.trim() || null,
      phone: form.phone.trim() || null,
      delivery_address: form.delivery_address.trim() || null,
      delivery_city: form.delivery_city.trim() || null,
    }).eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("Enregistrement impossible");
      return;
    }
    qc.invalidateQueries({ queryKey: ["profile", userId] });
    toast.success("Profil enregistré");
  };

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Choisissez une image");
      return;
    }
    setUploading(true);
    try {
      const blob = await compressImage(file, 600, 0.82).catch(() => file);
      const path = `client-avatars/${userId}-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("artisan-images").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const url = supabase.storage.from("artisan-images").getPublicUrl(path).data.publicUrl;
      const { error } = await (supabase as any).from("profiles").update({ avatar_url: url }).eq("id", userId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Photo mise à jour");
    } catch {
      toast.error("Échec de l'envoi de la photo");
    } finally {
      setUploading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate("/");
  };

  return (
    <>
      <div className="px-6 pt-24 pb-6">
        <p className="font-serif text-2xl italic text-foreground">Bonjour,</p>
        <p className="font-serif text-4xl italic text-primary">{firstName}</p>
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { value: orders.length, label: "Commandes" },
            { value: favArtisans.ids.length + favProducts.ids.length, label: "Favoris" },
            { value: spent.toLocaleString("fr-FR"), label: "FCFA dépensés" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[hsl(var(--surface-container-low))] rounded-xl p-4 text-center">
              <p className="font-serif text-2xl text-primary">{stat.value}</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 border-b border-border/20 mt-2" role="tablist">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[10px] uppercase tracking-widest transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary font-bold" : "text-muted-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-16">
        {activeTab === "Commandes" && (
          <div className="px-6 pt-6 space-y-4">
            {ordersLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Package className="w-14 h-14 text-muted-foreground/30" />
                <p className="font-serif text-xl italic text-muted-foreground mt-4">Aucune commande pour l'instant</p>
                <Link to="/boutique" className="mt-6 border border-muted-foreground/20 rounded-full uppercase tracking-widest text-[9px] font-bold px-6 py-3 hover:bg-muted/50">
                  Découvrir la boutique
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-background rounded-[1.5rem] p-5 shadow-sm">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-sm text-foreground">{order.reference}</span>
                    <span className={`text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold ${statusStyle(order.status)}`}>
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground uppercase mt-1">
                    {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {order.order_items.slice(0, 5).map((item, i) => (
                      item.product_image
                        ? <img key={i} src={IMG.thumb(item.product_image)} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover" />
                        : <div key={i} className="w-12 h-12 rounded-lg bg-muted" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {order.order_items.map((i) => `${i.quantity} × ${i.product_name}`).join(" · ")}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-serif text-base text-primary">{order.total.toLocaleString("fr-FR")} FCFA</p>
                    {(order.status === "pending" || order.status === "failed") && (
                      <Link
                        to={`/paiement/retour?commande=${order.id}`}
                        className="h-9 px-4 inline-flex items-center rounded-full bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground text-[10px] uppercase tracking-widest font-bold"
                      >
                        Payer
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "Favoris" && (
          <div className="px-6 pt-6 space-y-8">
            <section>
              <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Artisans favoris</h2>
              {favoriteArtisans.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun artisan favori. Touchez le cœur sur la page d'un artisan pour le suivre.
                </p>
              ) : (
                <div className="space-y-2">
                  {favoriteArtisans.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 bg-surface-container-low rounded-xl p-3">
                      <Link to={`/artisans/${a.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <ArtisanAvatar src={a.avatar} initials={a.initials} accentColor={a.accentColor} name={a.name} className="w-12 h-12 rounded-full shrink-0" />
                        <div className="min-w-0">
                          <p className="font-serif italic truncate">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.metier}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => favArtisans.toggle(a.id, a.name)}
                        aria-label={`Retirer ${a.name} des favoris`}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/50"
                      >
                        <Heart className="w-4 h-4 fill-primary text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Créations favorites</h2>
              {favoriteProducts.length === 0 ? (
                <div className="flex flex-col items-center py-10">
                  <Heart className="w-12 h-12 text-muted-foreground/30" />
                  <p className="font-serif text-lg italic text-muted-foreground mt-3">Aucune création favorite</p>
                  <button onClick={() => navigate("/boutique")} className="mt-5 border border-muted-foreground/20 rounded-full uppercase tracking-widest text-[9px] font-bold px-6 py-3 hover:bg-muted/50">
                    Découvrir des œuvres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {favoriteProducts.map((product) => <BoutiqueProductCard key={product.id} product={product} />)}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "Profil" && (
          <div className="px-6 pt-6 space-y-4 max-w-md">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-20 h-20 rounded-full bg-[hsl(var(--surface-container))] flex items-center justify-center overflow-hidden">
                {profile?.avatar_url
                  ? <img src={IMG.thumb(profile.avatar_url)} alt="Ma photo" className="w-full h-full object-cover" />
                  : <User className="w-8 h-8 text-muted-foreground" />}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-3 border border-muted-foreground/20 rounded-full uppercase tracking-widest text-[9px] font-bold px-4 py-2 flex items-center gap-1.5 hover:bg-muted/50 disabled:opacity-50"
              >
                <Camera className="w-3 h-3" /> {uploading ? "Envoi…" : "Modifier la photo"}
              </button>
            </div>

            {([
              { key: "full_name", label: "Nom complet", type: "text", auto: "name" },
              { key: "phone", label: "Téléphone (Mobile Money)", type: "tel", auto: "tel" },
              { key: "delivery_address", label: "Adresse de livraison", type: "text", auto: "street-address" },
              { key: "delivery_city", label: "Ville", type: "text", auto: "address-level2" },
            ] as const).map((f) => (
              <div key={f.key}>
                <label htmlFor={f.key} className={labelClass}>{f.label}</label>
                <input
                  id={f.key}
                  type={f.type}
                  autoComplete={f.auto}
                  value={form[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className={inputClass}
                />
              </div>
            ))}
            <div>
              <label className={labelClass}>E-mail</label>
              <p className="text-sm text-muted-foreground px-1">{email}</p>
            </div>

            <button onClick={saveProfile} disabled={saving} className={primaryBtn}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
            </button>

            <button onClick={logout} className="w-full text-center mt-6 mb-4 text-destructive text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
              <LogOut className="w-3 h-3" /> Se déconnecter
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const ClientHubPage = () => {
  const { user, loading } = useAuth();
  return (
    <AppShell>
      {loading ? (
        <div className="pt-32 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : user ? (
        <ClientDashboard userId={user.id} email={user.email ?? ""} />
      ) : (
        <AuthPanel />
      )}
    </AppShell>
  );
};

export default ClientHubPage;
