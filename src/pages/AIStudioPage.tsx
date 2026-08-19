import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Copy, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { createProduct, PRODUCT_CATEGORIES } from "@/hooks/useCreateProduct";

interface ArtisanSession {
  id: string;
  slug: string;
  name: string;
}

const AIStudioPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<ArtisanSession | null>(null);

  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("artisan_connecte");
    if (!stored) {
      navigate("/espace-artisan/login");
      return;
    }
    try {
      setSession(JSON.parse(stored));
    } catch {
      navigate("/espace-artisan/login");
    }
  }, [navigate]);

  const imagePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile]);
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setGeneratedText("");

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { type: "product-description", description: description.trim() },
      });

      if (error) throw error;
      setGeneratedText(data?.content || "Erreur lors de la génération.");
    } catch (err) {
      console.error("Generation error:", err);
      setGeneratedText("Une erreur est survenue lors de la génération. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
      setShowForm(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
  };

  const handlePublish = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setPublishing(true);

    const result = await createProduct({
      artisanId: session?.id || "",
      artisanSlug: session?.slug || "",
      name: productName,
      price: Number(price),
      stock: stock === "" ? 1 : Number(stock),
      category,
      description: generatedText || description,
      imageFile,
    });

    setPublishing(false);

    if (!result.ok) {
      setErrorMsg(result.error || "Publication impossible.");
      return;
    }

    setSuccessMsg("Produit publié avec succès. Redirection…");
    setProductName("");
    setPrice("");
    setStock("");
    setCategory(PRODUCT_CATEGORIES[0]);
    setImageFile(null);
    setDescription("");
    setGeneratedText("");

    setTimeout(() => navigate("/espace-artisan"), 1400);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="px-6 pt-24 pb-6">
        <button onClick={() => navigate("/espace-artisan")} className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <p className="text-[10px] uppercase tracking-widest text-primary mb-1">IA STUDIO</p>
        <h1 className="font-serif text-3xl text-foreground">Le Conteur</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">
          Décrivez votre œuvre, l'IA génère une fiche professionnelle.
        </p>
      </div>

      {/* Input */}
      <div className="px-6 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">01 — DÉCRIVEZ VOTRE ŒUVRE</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          placeholder="Ex : Un masque en bois de fromager sculpté à la main, représentant un ancêtre Dan avec des scarifications rituelles, finition à l'huile de palme, hauteur 38cm, utilisé lors des cérémonies d'initiation…"
          className="bg-surface-container-low rounded-xl p-5 w-full border-none text-sm font-light h-36 resize-none focus:ring-1 focus:ring-primary focus:outline-none"
        />
        <p className="text-[9px] text-muted-foreground text-right">{description.length}/500</p>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className="w-full h-14 mt-2 flex items-center justify-center gap-3 bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full uppercase tracking-widest text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Génération en cours…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Générer avec l'IA
            </>
          )}
        </button>
      </div>

      {/* Generated Result */}
      {generatedText && (
        <div className="px-6 mt-6 animate-fade-in">
          <div className="bg-background rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(14,13,13,0.04)] border-l-4 border-primary">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary fill-primary" />
              <span className="font-serif text-lg text-foreground">Description générée</span>
              <button onClick={handleCopy} className="ml-auto py-1 px-3 rounded-full border border-secondary/20 text-primary text-[9px] uppercase tracking-widest font-bold hover:bg-secondary/10 transition-colors flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copier
              </button>
            </div>
            <p className="text-sm text-foreground leading-relaxed font-light mt-4">{generatedText}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 h-12 bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full uppercase tracking-widest text-[10px] font-bold"
              >
                Utiliser cette description
              </button>
              <button
                onClick={handleGenerate}
                className="px-5 h-12 rounded-full border border-secondary/20 text-primary text-[10px] uppercase tracking-widest font-bold hover:bg-secondary/10 transition-colors"
              >
                Régénérer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div className="px-6 mt-4 animate-fade-in">
          <div className="bg-surface-container-low rounded-[2rem] p-6">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">02 — INFORMATIONS DU PRODUIT</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Nom du produit</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="bg-background rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Masque Dan Ancestral"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Prix en FCFA</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-background rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Stock disponible</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="bg-background rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="5"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-background rounded-xl px-4 py-3 w-full border-none text-sm focus:ring-1 focus:ring-primary focus:outline-none appearance-none"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Photo</label>
                <label className="block rounded-xl border-2 border-dashed border-muted-foreground/30 p-6 text-center cursor-pointer hover:border-primary/40 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={imagePreview} alt="Aperçu du produit" className="w-32 h-32 object-cover rounded-xl" />
                      <p className="text-xs text-muted-foreground">{imageFile?.name} — cliquez pour changer</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Cliquez pour choisir une photo</p>
                    </>
                  )}
                </label>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-xl bg-destructive/10 text-destructive p-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 text-emerald-700 p-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full h-14 mt-2 flex items-center justify-center gap-3 bg-gradient-to-br from-terracotta to-terracotta-light text-primary-foreground rounded-full uppercase tracking-widest text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Publication…
                  </>
                ) : (
                  "Publier le produit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="px-6 mt-6 pb-16">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[
            { step: "1", title: "Décrivez", text: "Quelques mots sur votre œuvre" },
            { step: "2", title: "Générez", text: "L'IA rédige en 5 secondes" },
            { step: "3", title: "Publiez", text: "Votre fiche est en ligne" },
          ].map((s) => (
            <div key={s.step} className="bg-primary/5 rounded-xl p-4 min-w-[140px] text-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                {s.step}
              </div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{s.title}</p>
              <p className="text-xs text-foreground font-light mt-1">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default AIStudioPage;
