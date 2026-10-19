import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";

import AppShell from "@/components/AppShell";
import BoutiqueProductCard from "@/components/BoutiqueProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useArtisans } from "@/hooks/useArtisans";

const METIERS = ["Botterie", "Bijouterie", "Accessoires", "Sculpture", "Peinture", "Tressage", "Tissage", "Sérigraphie"];
const TRIS = [
  { value: "recents", label: "Les plus récentes" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
];
const PAR_PAGE = 24;

const normalize = (s: string) => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const digits = (s: string) => s.replace(/\D/g, "");

const BoutiquePage = () => {
  const [params, setParams] = useSearchParams();
  const { data: produits = [], isLoading } = useProducts();
  const { data: artisans = [] } = useArtisans();
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [visibles, setVisibles] = useState(PAR_PAGE);

  // Les filtres vivent dans l'adresse : la page filtrée se partage telle quelle
  const metiers = (params.get("cat") || "")
    .split(",")
    .filter(Boolean)
    .map((c) => METIERS.find((m) => normalize(m) === normalize(c)))
    .filter((c): c is string => !!c);
  const recherche = params.get("q") || "";
  const artisanFiltre = params.get("artisan") || "";
  const prixMin = Number(params.get("min") || 0);
  const prixMax = Number(params.get("max") || 0);
  const enStock = params.get("stock") === "1";
  const tri = params.get("sort") || "recents";

  const maj = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
    setVisibles(PAR_PAGE);
  };
  const basculerMetier = (m: string) => {
    const set = new Set(metiers);
    set.has(m) ? set.delete(m) : set.add(m);
    maj({ cat: [...set].join(",") || null });
  };

  const comptes = useMemo(() => {
    const c: Record<string, number> = {};
    produits.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, [produits]);

  const resultats = useMemo(() => {
    let r = produits.filter((p) => {
      if (metiers.length && !metiers.includes(p.category)) return false;
      if (enStock && p.stock <= 0) return false;
      if (prixMin && p.price < prixMin) return false;
      if (prixMax && p.price > prixMax) return false;
      if (artisanFiltre && !normalize(p.artisan).includes(normalize(artisanFiltre))) return false;
      if (recherche) {
        const q = normalize(recherche);
        if (![p.name, p.artisan, p.category].some((v) => normalize(v).includes(q))) return false;
      }
      return true;
    });
    if (tri === "prix-asc") r = [...r].sort((a, b) => a.price - b.price);
    else if (tri === "prix-desc") r = [...r].sort((a, b) => b.price - a.price);
    else r = [...r].sort((a, b) => b.date.localeCompare(a.date));
    return r;
  }, [produits, metiers.join(","), enStock, prixMin, prixMax, artisanFiltre, recherche, tri]);

  const actifs: { label: string; retirer: () => void }[] = [
    ...metiers.map((m) => ({ label: m, retirer: () => basculerMetier(m) })),
    ...(recherche ? [{ label: `« ${recherche} »`, retirer: () => maj({ q: null }) }] : []),
    ...(artisanFiltre ? [{ label: `Artisan : ${artisanFiltre}`, retirer: () => maj({ artisan: null }) }] : []),
    ...(prixMin ? [{ label: `Dès ${prixMin.toLocaleString("fr-FR")} FCFA`, retirer: () => maj({ min: null }) }] : []),
    ...(prixMax ? [{ label: `Jusqu'à ${prixMax.toLocaleString("fr-FR")} FCFA`, retirer: () => maj({ max: null }) }] : []),
    ...(enStock ? [{ label: "En stock", retirer: () => maj({ stock: null }) }] : []),
  ];

  const champ = "h-11 px-3 rounded-xl border border-ink/[0.16] bg-white text-[15px] text-ink outline-none focus:border-primary";

  const filtres = (
    <div className="flex flex-col gap-8">
      <fieldset className="border-0 m-0 p-0 flex flex-col gap-1">
        <legend className="text-base font-semibold mb-2.5 p-0">Métier</legend>
        {METIERS.filter((m) => comptes[m]).map((m) => (
          <label key={m} className="flex items-center gap-3 min-h-10 text-[15px] cursor-pointer">
            <input type="checkbox" checked={metiers.includes(m)} onChange={() => basculerMetier(m)} className="w-[18px] h-[18px] accent-primary m-0" />
            <span className="flex-1">{m}</span>
            <span className="text-[13px] text-ink-muted">{comptes[m]}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="border-0 m-0 p-0">
        <legend className="text-base font-semibold mb-3 p-0">Prix (FCFA)</legend>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-muted">
            Minimum
            <input key={`min-${prixMin}`} inputMode="numeric" placeholder="0" defaultValue={prixMin || ""} onBlur={(e) => maj({ min: digits(e.target.value) || null })} className={champ} />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-muted">
            Maximum
            <input key={`max-${prixMax}`} inputMode="numeric" placeholder="Sans limite" defaultValue={prixMax || ""} onBlur={(e) => maj({ max: digits(e.target.value) || null })} className={champ} />
          </label>
        </div>
      </fieldset>

      <label className="flex items-center gap-3 min-h-10 text-[15px] cursor-pointer">
        <input type="checkbox" checked={enStock} onChange={() => maj({ stock: enStock ? null : "1" })} className="w-[18px] h-[18px] accent-primary m-0" />
        Seulement les pièces en stock
      </label>

      <label className="flex flex-col gap-2.5 text-base font-semibold">
        Artisan
        <input
          key={`artisan-${artisanFiltre}`}
          list="liste-artisans"
          placeholder="Nom de l'artisan"
          defaultValue={artisanFiltre}
          onBlur={(e) => maj({ artisan: e.target.value.trim() || null })}
          onKeyDown={(e) => e.key === "Enter" && maj({ artisan: (e.target as HTMLInputElement).value.trim() || null })}
          className={`${champ} font-normal`}
        />
        <datalist id="liste-artisans">
          {artisans.map((a) => <option key={a.id} value={a.name} />)}
        </datalist>
      </label>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 pt-8 md:pt-11 pb-16 md:pb-[88px]">
        <h1 className="m-0 text-4xl md:text-5xl leading-none tracking-[-0.035em] font-[650]">Boutique</h1>
        <p className="mt-2.5 text-base md:text-[17px] text-ink-soft">
          {produits.length} créations faites main par {artisans.length} artisans de San Pedro
        </p>

        <button
          onClick={() => setFiltresOuverts((v) => !v)}
          aria-expanded={filtresOuverts}
          aria-controls="panneau-filtres"
          className="lg:hidden mt-6 h-11 px-4 rounded-full border border-ink/[0.16] bg-white text-[15px] font-semibold inline-flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.8} /> Filtres{actifs.length ? ` (${actifs.length})` : ""}
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-6 lg:mt-10 items-start">
          <aside
            id="panneau-filtres"
            aria-label="Filtres"
            className={`${filtresOuverts ? "block" : "hidden"} lg:block w-full lg:w-[260px] shrink-0 bg-white lg:bg-transparent rounded-2xl lg:rounded-none p-5 lg:p-0 border lg:border-0 border-ink/[0.08]`}
          >
            {filtres}
          </aside>

          <section className="flex-1 min-w-0 w-full" aria-label="Résultats">
            <div className="flex justify-between items-center gap-4 flex-wrap pb-5 border-b border-ink/10 mb-7">
              <div className="flex items-center gap-2.5 flex-wrap text-[15px]">
                <span className="text-ink-soft" aria-live="polite">
                  {resultats.length} pièce{resultats.length > 1 ? "s" : ""}
                </span>
                {actifs.map((f) => (
                  <button
                    key={f.label}
                    onClick={f.retirer}
                    className="h-9 pl-3.5 pr-3 rounded-full bg-sand text-ink text-sm font-medium inline-flex items-center gap-1.5 hover:bg-[#E9DFD4]"
                    aria-label={`Retirer le filtre ${f.label}`}
                  >
                    {f.label}
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                ))}
                {actifs.length > 1 && (
                  <button onClick={() => setParams({}, { replace: true })} className="text-sm font-semibold text-primary underline underline-offset-4">
                    Tout effacer
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2.5 text-[15px] text-ink-soft">
                Trier par
                <select value={tri} onChange={(e) => maj({ sort: e.target.value === "recents" ? null : e.target.value })} className="h-[42px] px-3 rounded-xl border border-ink/[0.16] bg-white text-[15px] text-ink">
                  {TRIS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 md:gap-x-6 gap-y-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl aspect-[4/5] bg-sand animate-pulse" />
                ))}
              </div>
            ) : resultats.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-9">
                  {resultats.slice(0, visibles).map((p) => (
                    <BoutiqueProductCard key={p.id} product={p} />
                  ))}
                </div>
                {resultats.length > visibles && (
                  <div className="flex flex-col items-center gap-3 mt-12">
                    <span className="text-sm text-ink-muted">
                      {visibles} sur {resultats.length} pièces
                    </span>
                    <button
                      onClick={() => setVisibles((v) => v + PAR_PAGE)}
                      className="h-[52px] px-7 rounded-full border border-ink/[0.18] bg-white text-[15px] font-semibold hover:border-ink/40"
                    >
                      Afficher plus de créations
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-semibold">Aucune pièce ne correspond</p>
                <p className="text-ink-soft mt-2">Essayez avec moins de filtres.</p>
                <button
                  onClick={() => setParams({}, { replace: true })}
                  className="mt-5 h-11 px-6 rounded-full border border-ink/[0.18] bg-white text-[15px] font-semibold"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default BoutiquePage;
