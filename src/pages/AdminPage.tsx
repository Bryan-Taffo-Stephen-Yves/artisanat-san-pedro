import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle, Check, X, Loader2, LogOut, MessageCircle, ShieldCheck, Package,
  Users, ShoppingBag, Clock, RefreshCw,
} from "lucide-react";
import ProductManager from "@/components/ProductManager";
import { IMG } from "@/lib/image";
import {
  adminApi, getAdminCode, setAdminCode, ORDER_STATUS_LABEL,
  type AdminArtisan, type AdminOrder, type AdminProduct, type AdminStats,
} from "@/lib/admin";

const fcfa = (n: number) => `${(n ?? 0).toLocaleString("fr-FR")} FCFA`;
const dateFr = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

/* ─────────────── ACCÈS (code vérifié par la base) ─────────────── */
const AdminGate = ({ onSuccess }: { onSuccess: (code: string) => void }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const ok = await adminApi.verifier(code.trim());
      if (ok) onSuccess(code.trim());
      else setError("Code incorrect");
    } catch {
      setError("Impossible de vérifier le code. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A120C] flex items-center justify-center px-6">
      <div className="text-center w-full max-w-sm">
        <ShieldCheck className="w-10 h-10 text-[#E8A27C] mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="font-serif text-3xl italic text-white">Accès réservé</h1>
        <p className="text-[10px] uppercase tracking-widest text-[#E8A27C] mt-2 mb-8">
          Mains de San Pedro · Administration
        </p>
        <label htmlFor="admin-code" className="sr-only">Code administrateur</label>
        <input
          id="admin-code"
          type="password"
          autoComplete="current-password"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Code administrateur"
          className="w-full bg-transparent border border-white/20 rounded-full px-5 py-3 text-white placeholder:text-white/40 outline-none focus:border-[#E8A27C] text-sm"
        />
        {error && <p className="text-red-300 text-xs mt-3" role="alert">{error}</p>}
        <button
          onClick={submit}
          disabled={loading}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full py-3 uppercase tracking-widest text-[0.7rem] font-bold hover:opacity-90 active:scale-[0.97] transition disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Accéder
        </button>
        <Link to="/" className="block mt-6 text-[10px] uppercase tracking-widest text-white/40 hover:text-white/70">
          Retour au site
        </Link>
      </div>
    </div>
  );
};

/* ─────────────── FILE DE VALIDATION ─────────────── */
const QUICK_REASONS = [
  "Photo non conforme ou illisible",
  "Catégorie incorrecte",
  "Produit hors du métier de l'artisan",
  "Prix incohérent",
  "Doublon d'un produit existant",
];

const ModerationCard = ({
  p, code, onDone,
}: { p: AdminProduct; code: string; onDone: () => void }) => {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const photos = (p.gallery?.length ? p.gallery : p.image_url ? [p.image_url] : []).slice(0, 4);
  const horsMetier = p.artisan_metier && p.category !== p.artisan_metier;

  const decide = async (decision: "approve" | "reject") => {
    if (decision === "reject" && !note.trim()) {
      toast.error("Indiquez le motif du refus (il sera visible par l'artisan)");
      return;
    }
    setBusy(true);
    try {
      await adminApi.moderer(code, p.id, decision, decision === "reject" ? note : undefined);
      toast.success(decision === "approve" ? `« ${p.name} » est en ligne` : `« ${p.name} » refusé`);
      onDone();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="bg-background rounded-[1.5rem] p-4 border border-border/20 shadow-sm">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {photos.length ? photos.map((u) => (
          <img key={u} src={IMG.card(u)} alt="" loading="lazy" className="w-28 h-28 rounded-xl object-cover shrink-0 bg-muted" />
        )) : (
          <div className="w-28 h-28 rounded-xl bg-muted flex items-center justify-center text-[10px] text-muted-foreground">Sans photo</div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-lg leading-tight">{p.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {p.artisan_name ?? "Artisan inconnu"} · {p.artisan_metier ?? "?"} · soumis le {dateFr(p.submitted_at ?? p.created_at)}
          </p>
        </div>
        <span className="font-serif text-primary whitespace-nowrap">{fcfa(p.price)}</span>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        Catégorie : <span className="text-foreground font-bold">{p.category}</span> · Stock : {p.stock}
      </p>
      {horsMetier && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Catégorie différente du métier de l'artisan ({p.artisan_metier})
        </p>
      )}
      {p.description && <p className="mt-2 text-sm font-light text-muted-foreground line-clamp-3">{p.description}</p>}

      {rejecting ? (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setNote(r)}
                className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors ${note === r ? "bg-primary text-primary-foreground border-primary" : "border-border/40 hover:bg-muted/50"}`}
              >
                {r}
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor={`note-${p.id}`}>Motif du refus</label>
          <textarea
            id={`note-${p.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Motif du refus (visible par l'artisan)"
            className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button onClick={() => decide("reject")} disabled={busy} className="flex-1 h-10 rounded-full bg-red-600 text-white text-[11px] uppercase tracking-widest font-bold disabled:opacity-60">
              Confirmer le refus
            </button>
            <button onClick={() => { setRejecting(false); setNote(""); }} className="h-10 px-4 rounded-full border border-border/40 text-[11px] uppercase tracking-widest">
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => decide("approve")}
            disabled={busy}
            className="flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full bg-green-700 text-white text-[11px] uppercase tracking-widest font-bold hover:bg-green-800 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Valider et publier
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={busy}
            className="h-11 px-5 inline-flex items-center gap-1.5 rounded-full border border-red-300 text-red-700 text-[11px] uppercase tracking-widest font-bold hover:bg-red-50"
          >
            <X className="w-4 h-4" /> Refuser
          </button>
        </div>
      )}
    </article>
  );
};

const ModerationPanel = ({ code, products, reload }: { code: string; products: AdminProduct[]; reload: () => void }) => {
  const pending = products.filter((p) => p.status === "pending");
  const rejected = products.filter((p) => p.status === "rejected");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif text-xl italic mb-1">À valider ({pending.length})</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Les produits ajoutés par les artisans n'apparaissent sur le site qu'après validation.
        </p>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-surface-container-low rounded-xl p-6 text-center">
            Rien à valider pour l'instant. ✓
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((p) => <ModerationCard key={p.id} p={p} code={code} onDone={reload} />)}
          </div>
        )}
      </section>

      {rejected.length > 0 && (
        <section>
          <h2 className="font-serif text-xl italic mb-4">Refusés ({rejected.length})</h2>
          <ul className="space-y-2">
            {rejected.map((p) => (
              <li key={p.id} className="flex items-center gap-3 bg-surface-container-low rounded-xl p-3">
                {p.image_url && <img src={IMG.thumb(p.image_url)} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name} <span className="text-muted-foreground font-normal">· {p.artisan_name}</span></p>
                  <p className="text-xs text-red-700 truncate">Motif : {p.moderation_note ?? "—"}</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await adminApi.moderer(code, p.id, "approve");
                      toast.success("Produit validé et publié");
                      reload();
                    } catch (e: any) { toast.error(e.message); }
                  }}
                  className="text-[10px] uppercase tracking-widest font-bold text-green-700 px-3 py-2 rounded-full hover:bg-green-50"
                >
                  Valider
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

/* ─────────────── ARTISANS ─────────────── */
const waLink = (a: AdminArtisan) => {
  const digits = (a.phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  const intl = digits.startsWith("225") ? digits : `225${digits}`;
  const msg =
    `Bonjour ${a.name}, c'est l'équipe PACTE San Pedro. ` +
    `Pensez à publier vos nouvelles créations ce mois-ci sur Mains de San Pedro : ` +
    `${window.location.origin}/espace-artisan/login` +
    (a.login_id ? ` (votre identifiant : ${a.login_id})` : "") + ". Merci !";
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
};

// Téléphone de l'artisan : nécessaire pour les rappels (WhatsApp / SMS)
const PhoneField = ({ code, artisan, onSaved }: { code: string; artisan: AdminArtisan; onSaved: () => void }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(artisan.phone ?? "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.telephone(code, artisan.id, value);
      toast.success(value.trim() ? `Téléphone de ${artisan.name} enregistré` : "Téléphone retiré");
      setEditing(false);
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Numéro invalide");
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary">
        {artisan.phone ? `☎ ${artisan.phone}` : "+ Ajouter le téléphone"}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <label className="sr-only" htmlFor={`tel-${artisan.id}`}>Téléphone de {artisan.name}</label>
      <input
        id={`tel-${artisan.id}`}
        type="tel"
        inputMode="tel"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="07 00 00 00 00"
        className="w-36 bg-surface-container-low rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
      />
      <button onClick={save} disabled={busy} aria-label="Enregistrer le téléphone" className="w-7 h-7 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center disabled:opacity-50">
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      </button>
      <button onClick={() => { setEditing(false); setValue(artisan.phone ?? ""); }} aria-label="Annuler" className="w-7 h-7 rounded-full border border-border/40 inline-flex items-center justify-center">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
};

const ArtisansPanel = ({ code, artisans, reload }: { code: string; artisans: AdminArtisan[]; reload: () => void }) => {
  const monthStart = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  }, []);
  const [onlyInactive, setOnlyInactive] = useState(false);
  const isInactive = (a: AdminArtisan) => !a.last_product_at || new Date(a.last_product_at).getTime() < monthStart;
  const list = onlyInactive ? artisans.filter(isInactive) : artisans;
  const inactiveCount = artisans.filter(isInactive).length;

  const toggleTrust = async (a: AdminArtisan) => {
    try {
      await adminApi.confiance(code, a.id, !a.auto_approve);
      toast.success(!a.auto_approve
        ? `${a.name} publie désormais sans validation (dans son métier)`
        : `Les produits de ${a.name} passeront par la validation`);
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-serif text-xl italic">Artisans ({artisans.length})</h2>
          <p className="text-xs text-muted-foreground">
            {inactiveCount} n'ont rien publié ce mois-ci · « De confiance » = publication sans validation, dans leur métier uniquement.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={onlyInactive} onChange={(e) => setOnlyInactive(e.target.checked)} className="accent-[#C3622D]" />
          À relancer uniquement
        </label>
      </div>

      <ul className="divide-y divide-border/20 bg-background rounded-[1.5rem] border border-border/20">
        {list.map((a) => {
          const link = waLink(a);
          const inactive = isInactive(a);
          return (
            <li key={a.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-medium">
                  {a.name} {a.login_id && <span className="text-muted-foreground font-normal">· n° {a.login_id}</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.metier_category} · {a.products_total} produit(s) · dernier ajout : {dateFr(a.last_product_at)}
                </p>
                <PhoneField code={code} artisan={a} onSaved={reload} />
              </div>
              {inactive && (
                link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-green-700 px-3 py-2 rounded-full border border-green-200 hover:bg-green-50">
                    <MessageCircle className="w-3.5 h-3.5" /> Relancer (WhatsApp)
                  </a>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-amber-700">À relancer · téléphone manquant</span>
                )
              )}
              <label className="inline-flex items-center gap-2 text-xs cursor-pointer select-none">
                <input type="checkbox" checked={a.auto_approve} onChange={() => toggleTrust(a)} className="accent-[#C3622D] w-4 h-4" />
                De confiance
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/* ─────────────── COMMANDES ─────────────── */
const OrdersPanel = ({ orders }: { orders: AdminOrder[] }) => (
  <div>
    <h2 className="font-serif text-xl italic mb-4">Commandes ({orders.length})</h2>
    {orders.length === 0 ? (
      <p className="text-sm text-muted-foreground bg-surface-container-low rounded-xl p-6 text-center">
        Aucune commande pour l'instant.
      </p>
    ) : (
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="bg-background rounded-[1.5rem] p-4 border border-border/20">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-bold text-sm">{o.reference}</p>
                <p className="text-xs text-muted-foreground">{dateFr(o.created_at)} · {o.customer_name} · {o.customer_phone}</p>
                {o.delivery_address && <p className="text-xs text-muted-foreground">{o.delivery_address}{o.delivery_city ? `, ${o.delivery_city}` : ""}</p>}
              </div>
              <div className="text-right">
                <p className="font-serif text-primary">{fcfa(o.total)}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{ORDER_STATUS_LABEL[o.status] ?? o.status}</p>
              </div>
            </div>
            <ul className="mt-2 text-xs text-muted-foreground">
              {o.items.map((i, k) => <li key={k}>{i.quantity} × {i.product_name} — {fcfa(i.unit_price)}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    )}
  </div>
);

/* ─────────────── TABLEAU DE BORD ─────────────── */
type Tab = "validation" | "produits" | "artisans" | "commandes";

const AdminDashboard = ({ code, onLogout }: { code: string; onLogout: () => void }) => {
  const [tab, setTab] = useState<Tab>("validation");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [artisans, setArtisans] = useState<AdminArtisan[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, a, o] = await Promise.all([
        adminApi.stats(code), adminApi.produits(code), adminApi.artisans(code), adminApi.commandes(code),
      ]);
      setStats(s); setProducts(p); setArtisans(a); setOrders(o);
    } catch (e: any) {
      toast.error(e.message);
      if (/Accès refusé/.test(e.message)) onLogout();
    } finally {
      setLoading(false);
    }
  }, [code, onLogout]);

  useEffect(() => { load(); }, [load]);

  const kpis = stats ? [
    { icon: Users, label: "Artisans", value: stats.artisans },
    { icon: Package, label: "Produits en ligne", value: stats.produits_en_ligne },
    { icon: Clock, label: "À valider", value: stats.produits_en_attente, highlight: stats.produits_en_attente > 0 },
    { icon: ShoppingBag, label: "Commandes", value: stats.commandes },
    { icon: ShoppingBag, label: "Ventes payées", value: fcfa(stats.chiffre_affaires) },
    { icon: Users, label: "Comptes clients", value: stats.clients },
  ] : [];

  const tabs: { id: Tab; label: string }[] = [
    { id: "validation", label: `À valider${stats?.produits_en_attente ? ` (${stats.produits_en_attente})` : ""}` },
    { id: "produits", label: "Produits" },
    { id: "artisans", label: `Artisans${stats?.artisans_sans_produit_ce_mois ? ` · ${stats.artisans_sans_produit_ce_mois} à relancer` : ""}` },
    { id: "commandes", label: "Commandes" },
  ];

  return (
    <div className="min-h-screen bg-surface-container-low pb-16">
      <header className="bg-[#1A120C] text-white px-6 pt-10 pb-8">
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#E8A27C]">Programme PACTE · San Pedro</p>
            <h1 className="font-serif text-3xl italic mt-1">Administration</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={load} aria-label="Actualiser" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={onLogout} className="h-10 px-4 rounded-full border border-white/20 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest hover:bg-white/10">
              <LogOut className="w-3.5 h-3.5" /> Quitter
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {kpis.map(({ icon: Icon, label, value, highlight }) => (
            <div key={label} className={`rounded-xl p-4 ${highlight ? "bg-[#C3622D]" : "bg-white/5"}`}>
              <Icon className="w-4 h-4 text-white/60 mb-2" />
              <p className="font-serif text-2xl">{value}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/60 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </header>

      <nav className="sticky top-0 z-10 bg-background/95 border-b border-border/20">
        <div className="max-w-5xl mx-auto px-6 flex gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-4 whitespace-nowrap text-[10px] uppercase tracking-widest transition-colors ${tab === t.id ? "border-b-2 border-primary text-primary font-bold" : "text-muted-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-8">
        {loading && !stats ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            {tab === "validation" && <ModerationPanel code={code} products={products} reload={load} />}
            {tab === "produits" && <ProductManager adminCode={code} title="Tous les produits" onChange={load} />}
            {tab === "artisans" && <ArtisansPanel code={code} artisans={artisans} reload={load} />}
            {tab === "commandes" && <OrdersPanel orders={orders} />}
          </>
        )}
      </main>
    </div>
  );
};

/* ─────────────── PAGE ─────────────── */
const AdminPage = () => {
  const [code, setCode] = useState<string | null>(() => getAdminCode());

  const logout = useCallback(() => {
    setAdminCode(null);
    setCode(null);
  }, []);

  if (!code) {
    return <AdminGate onSuccess={(c) => { setAdminCode(c); setCode(c); }} />;
  }
  return <AdminDashboard code={code} onLogout={logout} />;
};

export default AdminPage;
